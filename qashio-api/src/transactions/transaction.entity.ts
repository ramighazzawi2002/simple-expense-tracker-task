import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionStatus {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  FAILED = 'Failed',
}

@Entity('transactions')
export class Transaction {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 150.5 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ type: () => Category })
  @ManyToOne(() => Category, { eager: true, nullable: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ApiProperty({ example: '2026-03-23' })
  @Column({ type: 'date' })
  date: string;

  @ApiPropertyOptional({ example: 'INV-001' })
  @Column({ nullable: true })
  reference: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @Column({ nullable: true })
  counterparty: string;

  @ApiProperty({ enum: TransactionStatus, default: TransactionStatus.PENDING })
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @ApiPropertyOptional({ example: 'Monthly subscription payment' })
  @Column({ nullable: true })
  narration: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
