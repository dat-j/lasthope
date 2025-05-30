import { MessageService } from './message.service';
import { MessageRequestDto } from '../../dto/message.dto';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    processMessage(messageRequest: MessageRequestDto): Promise<import("../../dto/message.dto").MessageResponseDto>;
    resetConversation(userId: string, flowId?: number): Promise<void>;
    getConversationHistory(userId: string, flowId: number): Promise<any>;
}
