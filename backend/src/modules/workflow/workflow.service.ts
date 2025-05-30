import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from '../../entities/workflow.entity';
import { CreateWorkflowDto, UpdateWorkflowDto } from '../../dto/workflow.dto';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
  ) {}

  async create(createWorkflowDto: CreateWorkflowDto): Promise<Workflow> {
    const workflow = this.workflowRepository.create(createWorkflowDto);
    return await this.workflowRepository.save(workflow);
  }

  async findAll(ownerId?: string): Promise<Workflow[]> {
    const where = ownerId ? { ownerId, isActive: true } : { isActive: true };
    return await this.workflowRepository.find({
      where,
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Workflow> {
    const workflow = await this.workflowRepository.findOne({
      where: { id, isActive: true },
    });
    
    if (!workflow) {
      throw new NotFoundException(`Workflow với ID ${id} không tồn tại`);
    }
    
    return workflow;
  }

  async update(id: number, updateWorkflowDto: UpdateWorkflowDto): Promise<Workflow> {
    const workflow = await this.findOne(id);
    
    Object.assign(workflow, updateWorkflowDto);
    return await this.workflowRepository.save(workflow);
  }

  async remove(id: number): Promise<void> {
    const workflow = await this.findOne(id);
    workflow.isActive = false;
    await this.workflowRepository.save(workflow);
  }

  async getStartNode(workflowId: number): Promise<any> {
    const workflow = await this.findOne(workflowId);
    const { data } = workflow;
    
    if (data.startNodeId) {
      return data.nodes.find(node => node.id === data.startNodeId);
    }
    
    // Nếu không có startNodeId, lấy node đầu tiên
    return data.nodes[0] || null;
  }

  async getNodeById(workflowId: number, nodeId: string): Promise<any> {
    const workflow = await this.findOne(workflowId);
    const node = workflow.data.nodes.find(n => n.id === nodeId);
    
    if (!node) {
      throw new NotFoundException(`Node ${nodeId} không tồn tại trong workflow ${workflowId}`);
    }
    
    return node;
  }

  async getNextNode(workflowId: number, currentNodeId: string, userInput?: string): Promise<any> {
    const currentNode = await this.getNodeById(workflowId, currentNodeId);
    
    if (!currentNode.edges && !currentNode.options) {
      return null; // Kết thúc luồng
    }
    
    // Xử lý options (quick replies)
    if (currentNode.options) {
      const selectedOption = currentNode.options.find(option => 
        option.label.toLowerCase() === userInput?.toLowerCase() ||
        option.value === userInput
      );
      
      if (selectedOption) {
        return await this.getNodeById(workflowId, selectedOption.next);
      }
    }
    
    // Xử lý edges (luồng tự động)
    if (currentNode.edges && currentNode.edges.length > 0) {
      const nextEdge = currentNode.edges[0]; // Lấy edge đầu tiên
      return await this.getNodeById(workflowId, nextEdge.target);
    }
    
    return null;
  }

  // Chatbot methods
  async startWorkflow(workflowId: number, userId: string): Promise<any> {
    const workflow = await this.findOne(workflowId);
    const startNode = await this.getStartNode(workflowId);
    
    if (!startNode) {
      throw new NotFoundException(`Workflow ${workflowId} không có node bắt đầu`);
    }

    const messageText = startNode.content || startNode.text || 'Xin chào!';
    const buttons = startNode.options || [];

    // Tạo response theo format Facebook Messenger
    const response = this.formatMessengerResponse(messageText, buttons, startNode.id, workflowId, userId);
    return response;
  }

  async handleMessage(
    workflowId: number, 
    userId: string, 
    message: string, 
    currentNodeId: string
  ): Promise<any> {
    const nextNode = await this.getNextNode(workflowId, currentNodeId, message);
    
    if (!nextNode) {
      return this.formatMessengerResponse(
        'Cảm ơn bạn đã sử dụng dịch vụ!',
        [],
        null,
        workflowId,
        userId,
        true
      );
    }

    const messageText = nextNode.content || nextNode.text || 'Tin nhắn mặc định';
    const buttons = nextNode.options || [];

    return this.formatMessengerResponse(messageText, buttons, nextNode.id, workflowId, userId);
  }

  async handleButtonClick(
    workflowId: number,
    userId: string,
    buttonValue: string,
    currentNodeId: string,
    nextNodeId?: string
  ): Promise<any> {
    let targetNode;
    
    if (nextNodeId) {
      // Nếu có nextNodeId từ button, sử dụng trực tiếp
      targetNode = await this.getNodeById(workflowId, nextNodeId);
    } else {
      // Nếu không, tìm node tiếp theo dựa trên buttonValue
      targetNode = await this.getNextNode(workflowId, currentNodeId, buttonValue);
    }
    
    if (!targetNode) {
      return this.formatMessengerResponse(
        'Cảm ơn bạn đã sử dụng dịch vụ!',
        [],
        null,
        workflowId,
        userId,
        true
      );
    }

    const messageText = targetNode.content || targetNode.text || 'Tin nhắn mặc định';
    const buttons = targetNode.options || [];

    return this.formatMessengerResponse(messageText, buttons, targetNode.id, workflowId, userId);
  }

  private formatMessengerResponse(
    text: string,
    buttons: any[],
    currentNodeId: string | null,
    workflowId: number,
    userId: string,
    isEnd: boolean = false
  ): any {
    const baseResponse = {
      workflowId,
      userId,
      currentNodeId,
      isEnd
    };

    // Nếu không có button, trả về text đơn giản
    if (!buttons || buttons.length === 0) {
      return {
        ...baseResponse,
        text: text
      };
    }

    // Nếu có button, trả về format template
    return {
      ...baseResponse,
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text,
          buttons: buttons.map(button => ({
            type: "postback",
            title: button.label,
            payload: button.value || button.label
          }))
        }
      }
    };
  }

  private formatButtons(options: any[]): any[] {
    return options.map((option, index) => ({
      id: `btn_${index}_${Date.now()}`,
      label: option.label,
      value: option.value || option.label,
      nextNodeId: option.next
    }));
  }
} 