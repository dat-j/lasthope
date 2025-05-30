import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { MessageModule } from './modules/message/message.module';
import { Workflow } from './entities/workflow.entity';
import { Conversation } from './entities/conversation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'chatbot_user'),
        password: configService.get('DB_PASSWORD', 'chatbot_password'),
        database: configService.get('DB_DATABASE', 'chatbot_db'),
        entities: [Workflow, Conversation],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    WorkflowModule,
    ConversationModule,
    MessageModule,
  ],
})
export class AppModule {} 