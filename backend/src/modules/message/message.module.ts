import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { WorkflowModule } from '../workflow/workflow.module';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [WorkflowModule, ConversationModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}