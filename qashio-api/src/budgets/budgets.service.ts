import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { TransactionType } from '../transactions/transaction.entity';
import { Budget } from './budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateBudgetDto): Promise<Budget> {
    const category = await this.categoriesService.findOne(dto.categoryId);
    const budget = this.budgetRepository.create({ ...dto, category });
    return this.budgetRepository.save(budget);
  }

  async findAll(): Promise<(Budget & { spent: number })[]> {
    const budgets = await this.budgetRepository.find();

    return Promise.all(
      budgets.map(async (budget) => {
        const result = await this.budgetRepository.manager
          .createQueryBuilder()
          .select('COALESCE(SUM(t.amount), 0)', 'spent')
          .from('transactions', 't')
          .where('t.categoryId = :categoryId', { categoryId: budget.categoryId })
          .andWhere('t.type = :type', { type: TransactionType.EXPENSE })
          .andWhere('t.date >= :startDate', { startDate: budget.startDate })
          .andWhere('t.date <= :endDate', { endDate: budget.endDate })
          .getRawOne<{ spent: string }>();

        return { ...budget, spent: parseFloat(result?.spent ?? '0') };
      }),
    );
  }
}
