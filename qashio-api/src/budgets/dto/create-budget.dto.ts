import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { BudgetPeriod } from '../budget.entity';

export class CreateBudgetDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @ApiProperty({ example: 1000.0 })
  @IsNotEmpty({ message: 'Budget amount is required' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a number with at most 2 decimal places' })
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;

  @ApiProperty({ enum: BudgetPeriod, example: BudgetPeriod.MONTHLY })
  @IsNotEmpty({ message: 'Budget period is required' })
  @IsEnum(BudgetPeriod, { message: 'Period must be either "monthly" or "weekly"' })
  period: BudgetPeriod;

  @ApiProperty({ example: '2026-03-01' })
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: string;

  @ApiProperty({ example: '2026-03-31' })
  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  @IsNotEmpty({ message: 'End date is required' })
  endDate: string;
}
