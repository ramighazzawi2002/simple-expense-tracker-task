import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../transaction.entity';

class PaginationMeta {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class PaginatedTransactionsDto {
  @ApiProperty({ type: [Transaction] })
  data: Transaction[];

  @ApiProperty({ type: PaginationMeta })
  pagination: PaginationMeta;
}
