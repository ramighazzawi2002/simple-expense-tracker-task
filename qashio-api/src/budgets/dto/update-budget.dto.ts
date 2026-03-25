import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { BudgetPeriod } from '../budget.entity';

export class UpdateBudgetDto {
  @ApiPropertyOptional({ example: 1500.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a number with at most 2 decimal places' })
  @IsPositive({ message: 'Amount must be a positive number' })
  amount?: number;

  @ApiPropertyOptional({ enum: BudgetPeriod })
  @IsOptional()
  @IsEnum(BudgetPeriod, { message: 'Period must be either "monthly" or "weekly"' })
  period?: BudgetPeriod;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  endDate?: string;
}
