import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from '../../dto/workflow.dto';

@Controller('api/workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createWorkflowDto: CreateWorkflowDto) {
    return await this.workflowService.create(createWorkflowDto);
  }

  @Get()
  async findAll(@Query('ownerId') ownerId?: string) {
    return await this.workflowService.findAll(ownerId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.workflowService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
  ) {
    return await this.workflowService.update(id, updateWorkflowDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.workflowService.remove(id);
  }

  @Get(':id/start-node')
  async getStartNode(@Param('id', ParseIntPipe) id: number) {
    return await this.workflowService.getStartNode(id);
  }

  @Get(':id/nodes/:nodeId')
  async getNode(
    @Param('id', ParseIntPipe) id: number,
    @Param('nodeId') nodeId: string,
  ) {
    return await this.workflowService.getNodeById(id, nodeId);
  }

  // Chatbot endpoints
  @Post(':id/start')
  async startWorkflow(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: string },
  ) {
    return await this.workflowService.startWorkflow(id, body.userId);
  }

  @Post(':id/message')
  async handleMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: string; message: string; currentNodeId: string },
  ) {
    return await this.workflowService.handleMessage(
      id,
      body.userId,
      body.message,
      body.currentNodeId,
    );
  }

  @Post(':id/button')
  async handleButtonClick(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { 
      userId: string; 
      buttonValue: string; 
      currentNodeId: string; 
      nextNodeId?: string 
    },
  ) {
    return await this.workflowService.handleButtonClick(
      id,
      body.userId,
      body.buttonValue,
      body.currentNodeId,
      body.nextNodeId,
    );
  }
} 