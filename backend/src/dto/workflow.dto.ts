import { IsString, IsOptional, IsObject, IsBoolean, IsArray } from 'class-validator';
import { WorkflowData } from '../entities/workflow.entity';

export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  data: WorkflowData;

  @IsString()
  @IsOptional()
  ownerId?: string;
}

export class UpdateWorkflowDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  data?: WorkflowData;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class WorkflowResponseDto {
  id: number;
  name: string;
  description?: string;
  data: WorkflowData;
  isActive: boolean;
  ownerId?: string;
  createdAt: Date;
  updatedAt: Date;
} 