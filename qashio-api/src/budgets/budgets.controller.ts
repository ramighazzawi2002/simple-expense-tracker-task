import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget } from './budget.entity';
import { BudgetWithSpentDto } from './dto/budget-with-spent.dto';

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
  @ApiResponse({ status: 200, type: [BudgetWithSpentDto] })
  findAll(): Promise<BudgetWithSpentDto[]> {
    return this.budgetsService.findAll();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a budget' })
  @ApiParam({ name: 'id', type: String, description: 'Budget UUID' })
  @ApiResponse({ status: 200, type: Budget })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBudgetDto,
  ): Promise<Budget> {
    return this.budgetsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a budget' })
  @ApiParam({ name: 'id', type: String, description: 'Budget UUID' })
  @ApiResponse({ status: 204, description: 'Budget deleted' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.budgetsService.remove(id);
  }
}
