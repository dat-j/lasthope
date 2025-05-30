import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageRequestDto } from '../../dto/message.dto';

@Controller('api')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  async processMessage(@Body() messageRequest: MessageRequestDto) {
    return await this.messageService.processMessage(messageRequest);
  }

  @Post('conversations/:userId/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetConversation(
    @Param('userId') userId: string,
    @Query('flowId', ParseIntPipe) flowId?: number,
  ) {
    await this.messageService.resetUserConversation(userId, flowId);
  }

  @Get('conversations/:userId/history')
  async getConversationHistory(
    @Param('userId') userId: string,
    @Query('flowId', ParseIntPipe) flowId: number,
  ) {
    return await this.messageService.getUserConversationHistory(userId, flowId);
  }
} 