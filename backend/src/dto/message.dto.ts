import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class MessageRequestDto {
  @IsString()
  userId: string;

  @IsString()
  text: string;

  @IsNumber()
  @IsOptional()
  flowId?: number;

  @IsString()
  @IsOptional()
  platform?: string; // 'messenger', 'telegram', etc.
}

export class ButtonDto {
  @IsString()
  type: string; // 'postback'

  @IsString()
  title: string;

  @IsString()
  payload: string;
}

export class AttachmentTemplateDto {
  @IsString()
  template_type: string; // 'button'

  @IsString()
  text: string;

  @IsArray()
  buttons: ButtonDto[];
}

export class AttachmentDto {
  @IsString()
  type: string; // 'template'

  @IsOptional()
  payload?: AttachmentTemplateDto;
}

export class MessageResponseDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsOptional()
  attachment?: AttachmentDto;

  // Giữ lại các field cũ để backward compatibility
  @IsString()
  @IsOptional()
  replyText?: string;

  @IsArray()
  @IsOptional()
  quickReplies?: string[];

  @IsOptional()
  attachments?: Array<{
    type: 'image' | 'file' | 'video';
    url: string;
    title?: string;
  }>;

  @IsOptional()
  metadata?: {
    nodeId?: string;
    isEndOfFlow?: boolean;
    nextActions?: string[];
  };
} 