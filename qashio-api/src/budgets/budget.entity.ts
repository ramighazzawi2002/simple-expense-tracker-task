import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';

export enum BudgetPeriod {
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
}

@Entity('budgets')
export class Budget {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => Category })
  @ManyToOne(() => Category, { eager: true, nullable: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @Column()
  categoryId: string;

  @ApiProperty({ example: 1000.0 })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @ApiProperty({ enum: BudgetPeriod, example: BudgetPeriod.MONTHLY })
  @Column({ type: 'enum', enum: BudgetPeriod })
  period: BudgetPeriod;

  @ApiProperty({ example: '2026-03-01' })
  @Column({ type: 'date' })
  startDate: string;

  @ApiProperty({ example: '2026-03-31' })
  @Column({ type: 'date' })
  endDate: string;
}
