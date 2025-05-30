export declare class MessageRequestDto {
    userId: string;
    text: string;
    flowId?: number;
    platform?: string;
}
export declare class ButtonDto {
    type: string;
    title: string;
    payload: string;
}
export declare class AttachmentTemplateDto {
    template_type: string;
    text: string;
    buttons: ButtonDto[];
}
export declare class AttachmentDto {
    type: string;
    payload?: AttachmentTemplateDto;
}
export declare class MessageResponseDto {
    text?: string;
    attachment?: AttachmentDto;
    replyText?: string;
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
