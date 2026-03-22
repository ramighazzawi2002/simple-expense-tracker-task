import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { Budget } from './budget.entity';

@ApiTags('budgets')
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a budget for a category' })
  @ApiResponse({ status: 201, type: Budget })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  create(@Body() dto: CreateBudgetDto): Promise<Budget> {
    return this.budgetsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all budgets with current spending' })
  @ApiResponse({ status: 200 })
  findAll() {
    return this.budgetsService.findAll();
  }
}
