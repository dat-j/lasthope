import { Workflow } from './workflow.entity';
export interface ConversationData {
    history?: Array<{
        nodeId: string;
        userInput?: string;
        botResponse?: string;
        timestamp: Date;
    }>;
    variables?: Record<string, any>;
    context?: Record<string, any>;
}
export declare class Conversation {
    userId: string;
    flowId: number;
    currentNodeId: string;
    data: ConversationData;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    workflow: Workflow;
}
