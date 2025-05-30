export interface WorkflowNode {
    id: string;
    type: 'bot' | 'user' | 'api' | 'condition';
    text?: string;
    content?: string;
    edges?: WorkflowEdge[];
    options?: WorkflowOption[];
    position?: {
        x: number;
        y: number;
    };
}
export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    condition?: string;
}
export interface WorkflowOption {
    label: string;
    next: string;
    value?: string;
}
export interface WorkflowData {
    nodes: WorkflowNode[];
    edges?: WorkflowEdge[];
    startNodeId?: string;
}
export declare class Workflow {
    id: number;
    ownerId: string;
    name: string;
    description: string;
    data: WorkflowData;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
