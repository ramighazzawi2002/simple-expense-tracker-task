import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../transactions/transaction.entity';
import { Budget, BudgetPeriod } from './budget.entity';
import { BudgetWithSpentDto } from './dto/budget-with-spent.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateBudgetDto): Promise<Budget> {
    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new BadRequestException('startDate must be before endDate');
    }

    const overlapping = await this.budgetRepository
      .createQueryBuilder('b')
      .where('b.categoryId = :categoryId', { categoryId: dto.categoryId })
      .andWhere('b.period = :period', { period: dto.period })
      .andWhere('b.startDate < :endDate', { endDate: dto.endDate })
      .andWhere('b.endDate > :startDate', { startDate: dto.startDate })
      .getCount();

    if (overlapping > 0) {
      throw new BadRequestException(
        'A budget for this category already exists in the given period',
      );
    }

    const category = await this.categoriesService.findOne(dto.categoryId);
    const budget = this.budgetRepository.create({ ...dto, category });
    return this.budgetRepository.save(budget);
  }

  async findAll(): Promise<BudgetWithSpentDto[]> {
    const budgets = await this.budgetRepository.find({
      relations: ['category'],
    });

    const results: BudgetWithSpentDto[] = [];

    for (const budget of budgets) {
      const { periodStart, periodEnd } = this.getCurrentPeriodBounds(budget);

      const result = await this.transactionRepository
        .createQueryBuilder('t')
        .select('COALESCE(SUM(t.amount), 0)', 'total')
        .where('t.categoryId = :categoryId', { categoryId: budget.categoryId })
        .andWhere('t.type = :type', { type: TransactionType.EXPENSE })
        .andWhere('t.status = :status', { status: TransactionStatus.COMPLETED })
        .andWhere('t.date >= :periodStart', { periodStart })
        .andWhere('t.date <= :periodEnd', { periodEnd })
        .andWhere('t.deletedAt IS NULL')
        .getRawOne<{ total: string }>();

      results.push({
        ...budget,
        spent: parseFloat(result?.total ?? '0'),
        periodStart,
        periodEnd,
      });
    }

    return results;
  }

  getCurrentPeriodBounds(budget: Budget): { periodStart: string; periodEnd: string } {
    const today = new Date();
    const budgetStart = new Date(budget.startDate);
    const budgetEnd = new Date(budget.endDate);

    // Clamp reference date to within budget range
    const ref = today < budgetStart ? budgetStart : today > budgetEnd ? budgetEnd : today;

    let periodStart: Date;
    let periodEnd: Date;

    if (budget.period === BudgetPeriod.MONTHLY) {
      periodStart = new Date(ref.getFullYear(), ref.getMonth(), 1);
      periodEnd = new Date(ref.getFullYear(), ref.getMonth() + 1, 0); // last day of month
    } else {
      // Weekly: align weeks to the budget's start date
      const diffDays = Math.floor((ref.getTime() - budgetStart.getTime()) / (86400000));
      const weekOffset = Math.floor(diffDays / 7) * 7;
      periodStart = new Date(budgetStart);
      periodStart.setDate(periodStart.getDate() + weekOffset);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 6);
    }

    // Clamp to budget boundaries
    if (periodStart < budgetStart) periodStart = budgetStart;
    if (periodEnd > budgetEnd) periodEnd = budgetEnd;

    return {
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: periodEnd.toISOString().split('T')[0],
    };
  }

  async update(id: string, dto: UpdateBudgetDto): Promise<Budget> {
    const budget = await this.budgetRepository.findOneBy({ id });
    if (!budget) {
      throw new NotFoundException(`Budget with id "${id}" not found`);
    }

    const startDate = dto.startDate ?? budget.startDate;
    const endDate = dto.endDate ?? budget.endDate;
    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('startDate must be before endDate');
    }

    Object.assign(budget, dto);
    return this.budgetRepository.save(budget);
  }

  async remove(id: string): Promise<void> {
    const budget = await this.budgetRepository.findOneBy({ id });
    if (!budget) {
      throw new NotFoundException(`Budget with id "${id}" not found`);
    }
    await this.budgetRepository.softRemove(budget);
  }
}
