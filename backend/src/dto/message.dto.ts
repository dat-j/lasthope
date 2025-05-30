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

export class MessageResponseDto {
  @IsString()
  replyText: string;

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