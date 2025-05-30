import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Workflow } from './workflow.entity';

export interface ConversationData {
  history?: Array<{
    nodeId: string;
    userInput?: string;
    botResponse?: string;
    timestamp: Date;
  }>;
  variables?: Record<string, any>;
  context?: Record<string, any>;
}

@Entity('conversations')
export class Conversation {
  @PrimaryColumn({ name: 'user_id', type: 'varchar' })
  userId: string;

  @PrimaryColumn({ name: 'flow_id', type: 'int' })
  flowId: number;

  @Column({ name: 'current_node_id', type: 'varchar', nullable: true })
  currentNodeId: string;

  @Column({ type: 'jsonb', nullable: true })
  data: ConversationData;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Workflow)
  @JoinColumn({ name: 'flow_id' })
  workflow: Workflow;
} 