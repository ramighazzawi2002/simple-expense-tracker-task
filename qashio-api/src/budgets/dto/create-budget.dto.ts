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
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 1000.0 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: BudgetPeriod, example: BudgetPeriod.MONTHLY })
  @IsNotEmpty()
  @IsEnum(BudgetPeriod)
  period: BudgetPeriod;

  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-03-31' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
