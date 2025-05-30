import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, ConversationData } from '../../entities/conversation.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  async findOrCreate(userId: string, flowId: number): Promise<Conversation> {
    let conversation = await this.conversationRepository.findOne({
      where: { userId, flowId, isActive: true },
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        userId,
        flowId,
        currentNodeId: null,
        data: {
          history: [],
          variables: {},
          context: {},
        },
        isActive: true,
      });
      await this.conversationRepository.save(conversation);
    }

    return conversation;
  }

  async updateCurrentNode(userId: string, flowId: number, nodeId: string): Promise<void> {
    await this.conversationRepository.update(
      { userId, flowId },
      { currentNodeId: nodeId, updatedAt: new Date() }
    );
  }

  async addToHistory(
    userId: string, 
    flowId: number, 
    nodeId: string, 
    userInput?: string, 
    botResponse?: string
  ): Promise<void> {
    const conversation = await this.findOrCreate(userId, flowId);
    
    if (!conversation.data) {
      conversation.data = { history: [], variables: {}, context: {} };
    }
    
    if (!conversation.data.history) {
      conversation.data.history = [];
    }

    conversation.data.history.push({
      nodeId,
      userInput,
      botResponse,
      timestamp: new Date(),
    });

    // Giữ lại chỉ 50 tin nhắn gần nhất để tránh dữ liệu quá lớn
    if (conversation.data.history.length > 50) {
      conversation.data.history = conversation.data.history.slice(-50);
    }

    await this.conversationRepository.save(conversation);
  }

  async setVariable(userId: string, flowId: number, key: string, value: any): Promise<void> {
    const conversation = await this.findOrCreate(userId, flowId);
    
    if (!conversation.data) {
      conversation.data = { history: [], variables: {}, context: {} };
    }
    
    if (!conversation.data.variables) {
      conversation.data.variables = {};
    }

    conversation.data.variables[key] = value;
    await this.conversationRepository.save(conversation);
  }

  async getVariable(userId: string, flowId: number, key: string): Promise<any> {
    const conversation = await this.findOrCreate(userId, flowId);
    return conversation.data?.variables?.[key];
  }

  async resetConversation(userId: string, flowId: number): Promise<void> {
    await this.conversationRepository.update(
      { userId, flowId },
      {
        currentNodeId: null,
        data: {
          history: [],
          variables: {},
          context: {},
        },
        updatedAt: new Date(),
      }
    );
  }

  async endConversation(userId: string, flowId: number): Promise<void> {
    await this.conversationRepository.update(
      { userId, flowId },
      { isActive: false, updatedAt: new Date() }
    );
  }

  async getActiveConversations(userId: string): Promise<Conversation[]> {
    return await this.conversationRepository.find({
      where: { userId, isActive: true },
      relations: ['workflow'],
      order: { updatedAt: 'DESC' },
    });
  }

  async cleanupOldConversations(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await this.conversationRepository.update(
      { updatedAt: { $lt: cutoffDate } as any },
      { isActive: false }
    );
  }
} 