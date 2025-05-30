import { Repository } from 'typeorm';
import { Conversation } from '../../entities/conversation.entity';
export declare class ConversationService {
    private conversationRepository;
    constructor(conversationRepository: Repository<Conversation>);
    findOrCreate(userId: string, flowId: number): Promise<Conversation>;
    updateCurrentNode(userId: string, flowId: number, nodeId: string): Promise<void>;
    addToHistory(userId: string, flowId: number, nodeId: string, userInput?: string, botResponse?: string): Promise<void>;
    setVariable(userId: string, flowId: number, key: string, value: any): Promise<void>;
    getVariable(userId: string, flowId: number, key: string): Promise<any>;
    resetConversation(userId: string, flowId: number): Promise<void>;
    endConversation(userId: string, flowId: number): Promise<void>;
    getActiveConversations(userId: string): Promise<Conversation[]>;
    cleanupOldConversations(daysOld?: number): Promise<void>;
}
