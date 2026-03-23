import { ApiProperty } from '@nestjs/swagger';
import { Budget } from '../budget.entity';

export class BudgetWithSpentDto extends Budget {
  @ApiProperty({ example: 250.0, description: 'Total spent in this budget period' })
  spent: number;
}