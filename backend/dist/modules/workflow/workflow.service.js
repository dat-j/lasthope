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
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const workflow_entity_1 = require("../../entities/workflow.entity");
let WorkflowService = class WorkflowService {
    constructor(workflowRepository) {
        this.workflowRepository = workflowRepository;
    }
    async create(createWorkflowDto) {
        const workflow = this.workflowRepository.create(createWorkflowDto);
        return await this.workflowRepository.save(workflow);
    }
    async findAll(ownerId) {
        const where = ownerId ? { ownerId, isActive: true } : { isActive: true };
        return await this.workflowRepository.find({
            where,
            order: { updatedAt: 'DESC' },
        });
    }
    async findOne(id) {
        const workflow = await this.workflowRepository.findOne({
            where: { id, isActive: true },
        });
        if (!workflow) {
            throw new common_1.NotFoundException(`Workflow với ID ${id} không tồn tại`);
        }
        return workflow;
    }
    async update(id, updateWorkflowDto) {
        const workflow = await this.findOne(id);
        Object.assign(workflow, updateWorkflowDto);
        return await this.workflowRepository.save(workflow);
    }
    async remove(id) {
        const workflow = await this.findOne(id);
        workflow.isActive = false;
        await this.workflowRepository.save(workflow);
    }
    async getStartNode(workflowId) {
        const workflow = await this.findOne(workflowId);
        const { data } = workflow;
        if (data.startNodeId) {
            return data.nodes.find(node => node.id === data.startNodeId);
        }
        return data.nodes[0] || null;
    }
    async getNodeById(workflowId, nodeId) {
        const workflow = await this.findOne(workflowId);
        const node = workflow.data.nodes.find(n => n.id === nodeId);
        if (!node) {
            throw new common_1.NotFoundException(`Node ${nodeId} không tồn tại trong workflow ${workflowId}`);
        }
        return node;
    }
    async getNextNode(workflowId, currentNodeId, userInput) {
        const currentNode = await this.getNodeById(workflowId, currentNodeId);
        if (!currentNode.edges && !currentNode.options) {
            return null;
        }
        if (currentNode.options) {
            const selectedOption = currentNode.options.find(option => option.label.toLowerCase() === userInput?.toLowerCase() ||
                option.value === userInput);
            if (selectedOption) {
                return await this.getNodeById(workflowId, selectedOption.next);
            }
        }
        if (currentNode.edges && currentNode.edges.length > 0) {
            const nextEdge = currentNode.edges[0];
            return await this.getNodeById(workflowId, nextEdge.target);
        }
        return null;
    }
    async startWorkflow(workflowId, userId) {
        const workflow = await this.findOne(workflowId);
        const startNode = await this.getStartNode(workflowId);
        if (!startNode) {
            throw new common_1.NotFoundException(`Workflow ${workflowId} không có node bắt đầu`);
        }
        const messageText = startNode.content || startNode.text || 'Xin chào!';
        const buttons = startNode.options || [];
        const response = this.formatMessengerResponse(messageText, buttons, startNode.id, workflowId, userId);
        return response;
    }
    async handleMessage(workflowId, userId, message, currentNodeId) {
        const nextNode = await this.getNextNode(workflowId, currentNodeId, message);
        if (!nextNode) {
            return this.formatMessengerResponse('Cảm ơn bạn đã sử dụng dịch vụ!', [], null, workflowId, userId, true);
        }
        const messageText = nextNode.content || nextNode.text || 'Tin nhắn mặc định';
        const buttons = nextNode.options || [];
        return this.formatMessengerResponse(messageText, buttons, nextNode.id, workflowId, userId);
    }
    async handleButtonClick(workflowId, userId, buttonValue, currentNodeId, nextNodeId) {
        let targetNode;
        if (nextNodeId) {
            targetNode = await this.getNodeById(workflowId, nextNodeId);
        }
        else {
            targetNode = await this.getNextNode(workflowId, currentNodeId, buttonValue);
        }
        if (!targetNode) {
            return this.formatMessengerResponse('Cảm ơn bạn đã sử dụng dịch vụ!', [], null, workflowId, userId, true);
        }
        const messageText = targetNode.content || targetNode.text || 'Tin nhắn mặc định';
        const buttons = targetNode.options || [];
        return this.formatMessengerResponse(messageText, buttons, targetNode.id, workflowId, userId);
    }
    formatMessengerResponse(text, buttons, currentNodeId, workflowId, userId, isEnd = false) {
        const baseResponse = {
            workflowId,
            userId,
            currentNodeId,
            isEnd
        };
        if (!buttons || buttons.length === 0) {
            return {
                ...baseResponse,
                text: text
            };
        }
        return {
            ...baseResponse,
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: text,
                    buttons: buttons.map(button => ({
                        type: "postback",
                        title: button.label,
                        payload: button.value || button.label
                    }))
                }
            }
        };
    }
    formatButtons(options) {
        return options.map((option, index) => ({
            id: `btn_${index}_${Date.now()}`,
            label: option.label,
            value: option.value || option.label,
            nextNodeId: option.next
        }));
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workflow_entity_1.Workflow)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map