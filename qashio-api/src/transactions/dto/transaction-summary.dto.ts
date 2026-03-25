import { ApiProperty } from '@nestjs/swagger';

class StatusBreakdownDto {
  @ApiProperty()
  Completed: number;

  @ApiProperty()
  Pending: number;

  @ApiProperty()
  Failed: number;
}

export class TransactionSummaryDto {
  @ApiProperty({ example: 5000.0 })
  totalIncome: number;

  @ApiProperty({ example: 3200.5 })
  totalExpense: number;

  @ApiProperty({ example: 1799.5 })
  netBalance: number;

  @ApiProperty({ example: 42 })
  transactionCount: number;

  @ApiProperty({ type: StatusBreakdownDto })
  byStatus: StatusBreakdownDto;
}
