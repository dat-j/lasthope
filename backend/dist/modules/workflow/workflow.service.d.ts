import { Repository } from 'typeorm';
import { Workflow } from '../../entities/workflow.entity';
import { CreateWorkflowDto, UpdateWorkflowDto } from '../../dto/workflow.dto';
export declare class WorkflowService {
    private workflowRepository;
    constructor(workflowRepository: Repository<Workflow>);
    create(createWorkflowDto: CreateWorkflowDto): Promise<Workflow>;
    findAll(ownerId?: string): Promise<Workflow[]>;
    findOne(id: number): Promise<Workflow>;
    update(id: number, updateWorkflowDto: UpdateWorkflowDto): Promise<Workflow>;
    remove(id: number): Promise<void>;
    getStartNode(workflowId: number): Promise<any>;
    getNodeById(workflowId: number, nodeId: string): Promise<any>;
    getNextNode(workflowId: number, currentNodeId: string, userInput?: string): Promise<any>;
    startWorkflow(workflowId: number, userId: string): Promise<any>;
    handleMessage(workflowId: number, userId: string, message: string, currentNodeId: string): Promise<any>;
    handleButtonClick(workflowId: number, userId: string, buttonValue: string, currentNodeId: string, nextNodeId?: string): Promise<any>;
    private formatMessengerResponse;
    private formatButtons;
}
