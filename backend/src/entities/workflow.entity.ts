import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface WorkflowNode {
  id: string;
  type: 'bot' | 'user' | 'api' | 'condition';
  text?: string;
  content?: string;
  edges?: WorkflowEdge[];
  options?: WorkflowOption[];
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface WorkflowOption {
  label: string;
  next: string;
  value?: string;
}

export interface WorkflowData {
  nodes: WorkflowNode[];
  edges?: WorkflowEdge[];
  startNodeId?: string;
}

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  data: WorkflowData;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 