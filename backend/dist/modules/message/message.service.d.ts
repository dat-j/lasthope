import { WorkflowService } from '../workflow/workflow.service';
import { ConversationService } from '../conversation/conversation.service';
import { MessageRequestDto, MessageResponseDto } from '../../dto/message.dto';
export declare class MessageService {
    private workflowService;
    private conversationService;
    constructor(workflowService: WorkflowService, conversationService: ConversationService);
    processMessage(messageRequest: MessageRequestDto): Promise<MessageResponseDto>;
    private buildResponse;
    resetUserConversation(userId: string, flowId?: number): Promise<void>;
    getUserConversationHistory(userId: string, flowId: number): Promise<any>;
}
