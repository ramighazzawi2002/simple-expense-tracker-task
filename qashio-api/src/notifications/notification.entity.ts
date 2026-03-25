import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  BUDGET_EXCEEDED = 'budget_exceeded',
  LARGE_EXPENSE = 'large_expense',
}

@Entity('notifications')
export class Notification {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.BUDGET_EXCEEDED })
  @Index()
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ example: 'Budget exceeded for Food' })
  @Column()
  title: string;

  @ApiProperty({ example: 'You have spent $1,200 out of $1,000 budget for Food' })
  @Column()
  message: string;

  @ApiProperty({ example: false })
  @Index()
  @Column({ default: false })
  read: boolean;

  @ApiProperty({ example: { budgetId: 'uuid', spent: 1200, limit: 1000 }, nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @ApiProperty({ example: '2026-03-25T10:00:00.000Z' })
  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
