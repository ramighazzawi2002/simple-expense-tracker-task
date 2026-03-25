import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TransactionStatus, TransactionType } from '../transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ example: 150.5 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a number with at most 2 decimal places' })
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType, { message: 'Type must be either "income" or "expense"' })
  type: TransactionType;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @ApiProperty({ example: '2026-03-23' })
  @IsDateString({}, { message: 'Date must be a valid ISO date string (e.g. 2026-03-23)' })
  date: string;

  @ApiPropertyOptional({ example: 'INV-001' })
  @IsOptional()
  @IsString({ message: 'Reference must be a string' })
  @MaxLength(100, { message: 'Reference must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  reference?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString({ message: 'Counterparty must be a string' })
  @MaxLength(150, { message: 'Counterparty must not exceed 150 characters' })
  @Transform(({ value }) => value?.trim())
  counterparty?: string;

  @ApiPropertyOptional({ enum: TransactionStatus, default: TransactionStatus.PENDING })
  @IsOptional()
  @IsEnum(TransactionStatus, { message: 'Status must be "Completed", "Pending", or "Failed"' })
  status?: TransactionStatus;

  @ApiPropertyOptional({ example: 'Monthly subscription payment' })
  @IsOptional()
  @IsString({ message: 'Narration must be a string' })
  @MaxLength(500, { message: 'Narration must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  narration?: string;
}
