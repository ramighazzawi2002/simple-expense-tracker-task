import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './transaction.entity';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, type: Transaction })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  create(@Body() dto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all transactions with pagination and filters' })
  @ApiResponse({ status: 200 })
  findAll(@Query() query: QueryTransactionDto) {
    return this.transactionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by id' })
  @ApiResponse({ status: 200, type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Transaction> {
    return this.transactionsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({ status: 200, type: Transaction })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({ status: 204, description: 'Transaction deleted' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.transactionsService.remove(id);
  }
}
