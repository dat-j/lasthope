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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const workflow_service_1 = require("../workflow/workflow.service");
const conversation_service_1 = require("../conversation/conversation.service");
let MessageService = class MessageService {
    constructor(workflowService, conversationService) {
        this.workflowService = workflowService;
        this.conversationService = conversationService;
    }
    async processMessage(messageRequest) {
        const { userId, text, flowId } = messageRequest;
        let targetFlowId = flowId;
        if (!targetFlowId) {
            const workflows = await this.workflowService.findAll();
            if (workflows.length === 0) {
                throw new common_1.BadRequestException('Không có workflow nào được cấu hình');
            }
            targetFlowId = workflows[0].id;
        }
        const conversation = await this.conversationService.findOrCreate(userId, targetFlowId);
        let currentNode;
        let nextNode;
        if (!conversation.currentNodeId) {
            currentNode = await this.workflowService.getStartNode(targetFlowId);
            if (!currentNode) {
                throw new common_1.BadRequestException('Workflow không có node khởi đầu');
            }
            await this.conversationService.updateCurrentNode(userId, targetFlowId, currentNode.id);
            await this.conversationService.addToHistory(userId, targetFlowId, currentNode.id, text, currentNode.text || currentNode.content);
            return this.buildResponse(currentNode);
        }
        currentNode = await this.workflowService.getNodeById(targetFlowId, conversation.currentNodeId);
        nextNode = await this.workflowService.getNextNode(targetFlowId, currentNode.id, text);
        if (!nextNode) {
            await this.conversationService.addToHistory(userId, targetFlowId, currentNode.id, text, 'Cảm ơn bạn đã sử dụng dịch vụ!');
            await this.conversationService.resetConversation(userId, targetFlowId);
            return {
                text: 'Cảm ơn bạn đã sử dụng dịch vụ! Gửi tin nhắn bất kỳ để bắt đầu lại.',
                metadata: {
                    isEndOfFlow: true,
                    nodeId: currentNode.id,
                },
            };
        }
        await this.conversationService.updateCurrentNode(userId, targetFlowId, nextNode.id);
        await this.conversationService.addToHistory(userId, targetFlowId, nextNode.id, text, nextNode.text || nextNode.content);
        return this.buildResponse(nextNode);
    }
    buildResponse(node) {
        const responseText = node.text || node.content || 'Xin lỗi, tôi không hiểu.';
        const hasButtons = node.options && node.options.length > 0;
        if (hasButtons) {
            const response = {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: responseText,
                        buttons: node.options.map(option => ({
                            type: "postback",
                            title: option.label,
                            payload: option.label
                        }))
                    }
                },
                metadata: {
                    nodeId: node.id,
                    isEndOfFlow: false,
                },
            };
            return response;
        }
        else {
            const response = {
                text: responseText,
                metadata: {
                    nodeId: node.id,
                    isEndOfFlow: false,
                },
            };
            return response;
        }
    }
    async resetUserConversation(userId, flowId) {
        if (flowId) {
            await this.conversationService.resetConversation(userId, flowId);
        }
        else {
            const conversations = await this.conversationService.getActiveConversations(userId);
            for (const conv of conversations) {
                await this.conversationService.resetConversation(userId, conv.flowId);
            }
        }
    }
    async getUserConversationHistory(userId, flowId) {
        const conversation = await this.conversationService.findOrCreate(userId, flowId);
        return conversation.data?.history || [];
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workflow_service_1.WorkflowService,
        conversation_service_1.ConversationService])
], MessageService);
//# sourceMappingURL=message.service.js.map