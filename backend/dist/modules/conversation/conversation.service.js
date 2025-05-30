"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("../../entities/conversation.entity");
let ConversationService = class ConversationService {
    constructor(conversationRepository) {
        this.conversationRepository = conversationRepository;
    }
    async findOrCreate(userId, flowId) {
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
    async updateCurrentNode(userId, flowId, nodeId) {
        await this.conversationRepository.update({ userId, flowId }, { currentNodeId: nodeId, updatedAt: new Date() });
    }
    async addToHistory(userId, flowId, nodeId, userInput, botResponse) {
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
        if (conversation.data.history.length > 50) {
            conversation.data.history = conversation.data.history.slice(-50);
        }
        await this.conversationRepository.save(conversation);
    }
    async setVariable(userId, flowId, key, value) {
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
    async getVariable(userId, flowId, key) {
        const conversation = await this.findOrCreate(userId, flowId);
        return conversation.data?.variables?.[key];
    }
    async resetConversation(userId, flowId) {
        await this.conversationRepository.update({ userId, flowId }, {
            currentNodeId: null,
            data: {
                history: [],
                variables: {},
                context: {},
            },
            updatedAt: new Date(),
        });
    }
    async endConversation(userId, flowId) {
        await this.conversationRepository.update({ userId, flowId }, { isActive: false, updatedAt: new Date() });
    }
    async getActiveConversations(userId) {
        return await this.conversationRepository.find({
            where: { userId, isActive: true },
            relations: ['workflow'],
            order: { updatedAt: 'DESC' },
        });
    }
    async cleanupOldConversations(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        await this.conversationRepository.update({ updatedAt: { $lt: cutoffDate } }, { isActive: false });
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map