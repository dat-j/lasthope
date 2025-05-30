import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from '../../dto/workflow.dto';
export declare class WorkflowController {
    private readonly workflowService;
    constructor(workflowService: WorkflowService);
    create(createWorkflowDto: CreateWorkflowDto): Promise<import("../../entities/workflow.entity").Workflow>;
    findAll(ownerId?: string): Promise<import("../../entities/workflow.entity").Workflow[]>;
    findOne(id: number): Promise<import("../../entities/workflow.entity").Workflow>;
    update(id: number, updateWorkflowDto: UpdateWorkflowDto): Promise<import("../../entities/workflow.entity").Workflow>;
    remove(id: number): Promise<void>;
    getStartNode(id: number): Promise<any>;
    getNode(id: number, nodeId: string): Promise<any>;
    startWorkflow(id: number, body: {
        userId: string;
    }): Promise<any>;
    handleMessage(id: number, body: {
        userId: string;
        message: string;
        currentNodeId: string;
    }): Promise<any>;
    handleButtonClick(id: number, body: {
        userId: string;
        buttonValue: string;
        currentNodeId: string;
        nextNodeId?: string;
    }): Promise<any>;
}
