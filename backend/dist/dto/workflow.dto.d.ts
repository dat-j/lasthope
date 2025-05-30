import { WorkflowData } from '../entities/workflow.entity';
export declare class CreateWorkflowDto {
    name: string;
    description?: string;
    data: WorkflowData;
    ownerId?: string;
}
export declare class UpdateWorkflowDto {
    name?: string;
    description?: string;
    data?: WorkflowData;
    isActive?: boolean;
}
export declare class WorkflowResponseDto {
    id: number;
    name: string;
    description?: string;
    data: WorkflowData;
    isActive: boolean;
    ownerId?: string;
    createdAt: Date;
    updatedAt: Date;
}
