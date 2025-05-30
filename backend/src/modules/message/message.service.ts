import { Injectable, BadRequestException } from '@nestjs/common';
import { WorkflowService } from '../workflow/workflow.service';
import { ConversationService } from '../conversation/conversation.service';
import { MessageRequestDto, MessageResponseDto } from '../../dto/message.dto';

@Injectable()
export class MessageService {
  constructor(
    private workflowService: WorkflowService,
    private conversationService: ConversationService,
  ) {}

  async processMessage(messageRequest: MessageRequestDto): Promise<MessageResponseDto> {
    const { userId, text, flowId } = messageRequest;

    // Xác định flowId nếu không được cung cấp
    let targetFlowId = flowId;
    if (!targetFlowId) {
      // Lấy workflow mặc định hoặc workflow đầu tiên
      const workflows = await this.workflowService.findAll();
      if (workflows.length === 0) {
        throw new BadRequestException('Không có workflow nào được cấu hình');
      }
      targetFlowId = workflows[0].id;
    }

    // Lấy hoặc tạo conversation
    const conversation = await this.conversationService.findOrCreate(userId, targetFlowId);

    let currentNode;
    let nextNode;

    // Nếu chưa có node hiện tại, bắt đầu từ node đầu tiên
    if (!conversation.currentNodeId) {
      currentNode = await this.workflowService.getStartNode(targetFlowId);
      if (!currentNode) {
        throw new BadRequestException('Workflow không có node khởi đầu');
      }
      
      // Cập nhật node hiện tại
      await this.conversationService.updateCurrentNode(userId, targetFlowId, currentNode.id);
      
      // Lưu lịch sử
      await this.conversationService.addToHistory(
        userId, 
        targetFlowId, 
        currentNode.id, 
        text, 
        currentNode.text || currentNode.content
      );

      return this.buildResponse(currentNode);
    }

    // Lấy node hiện tại
    currentNode = await this.workflowService.getNodeById(targetFlowId, conversation.currentNodeId);

    // Xử lý input của user và tìm node tiếp theo
    nextNode = await this.workflowService.getNextNode(targetFlowId, currentNode.id, text);

    if (!nextNode) {
      // Kết thúc luồng hoặc không tìm thấy node phù hợp
      await this.conversationService.addToHistory(
        userId, 
        targetFlowId, 
        currentNode.id, 
        text, 
        'Cảm ơn bạn đã sử dụng dịch vụ!'
      );

      // Reset conversation để bắt đầu lại
      await this.conversationService.resetConversation(userId, targetFlowId);

      return {
        text: 'Cảm ơn bạn đã sử dụng dịch vụ! Gửi tin nhắn bất kỳ để bắt đầu lại.',
        metadata: {
          isEndOfFlow: true,
          nodeId: currentNode.id,
        },
      };
    }

    // Cập nhật node hiện tại
    await this.conversationService.updateCurrentNode(userId, targetFlowId, nextNode.id);

    // Lưu lịch sử
    await this.conversationService.addToHistory(
      userId, 
      targetFlowId, 
      nextNode.id, 
      text, 
      nextNode.text || nextNode.content
    );

    return this.buildResponse(nextNode);
  }

  private buildResponse(node: any): MessageResponseDto {
    const responseText = node.text || node.content || 'Xin lỗi, tôi không hiểu.';
    
    // Kiểm tra xem có button không (dựa vào options hoặc quickReplies)
    const hasButtons = node.options && node.options.length > 0;
    
    if (hasButtons) {
      // Trả về response với attachment template
      const response: MessageResponseDto = {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: responseText,
            buttons: node.options.map(option => ({
              type: "postback",
              title: option.label,
              payload: option.label
            }))
          }
        },
        metadata: {
          nodeId: node.id,
          isEndOfFlow: false,
        },
      };
      
      return response;
    } else {
      // Trả về response dạng text đơn giản
      const response: MessageResponseDto = {
        text: responseText,
        metadata: {
          nodeId: node.id,
          isEndOfFlow: false,
        },
      };
      
      return response;
    }
  }

  async resetUserConversation(userId: string, flowId?: number): Promise<void> {
    if (flowId) {
      await this.conversationService.resetConversation(userId, flowId);
    } else {
      // Reset tất cả conversations của user
      const conversations = await this.conversationService.getActiveConversations(userId);
      for (const conv of conversations) {
        await this.conversationService.resetConversation(userId, conv.flowId);
      }
    }
  }

  async getUserConversationHistory(userId: string, flowId: number): Promise<any> {
    const conversation = await this.conversationService.findOrCreate(userId, flowId);
    return conversation.data?.history || [];
  }
} 