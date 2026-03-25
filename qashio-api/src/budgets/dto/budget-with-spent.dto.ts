import { ApiProperty } from '@nestjs/swagger';
import { Budget } from '../budget.entity';

export class BudgetWithSpentDto extends Budget {
  @ApiProperty({ example: 250.0, description: 'Total spent in the current period' })
  spent: number;

  @ApiProperty({ example: '2026-03-01', description: 'Start of the current period' })
  periodStart: string;

  @ApiProperty({ example: '2026-03-31', description: 'End of the current period' })
  periodEnd: string;
}