export declare class MessageRequestDto {
    userId: string;
    text: string;
    flowId?: number;
    platform?: string;
}
export declare class MessageResponseDto {
    replyText: string;
    quickReplies?: string[];
    attachments?: Array<{
        type: 'image' | 'file' | 'video';
        url: string;
        title?: string;
    }>;
    metadata?: {
        nodeId?: string;
        isEndOfFlow?: boolean;
        nextActions?: string[];
    };
}
