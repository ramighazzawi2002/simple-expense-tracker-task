import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import {
  Transaction,
  TransactionType,
} from '../transactions/transaction.entity';
import { Budget } from './budget.entity';
import { BudgetWithSpentDto } from './dto/budget-with-spent.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
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
    const budgets = await this.budgetRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.category', 'category')
      .addSelect((subQuery) => {
        return subQuery
          .select('COALESCE(SUM(t.amount), 0)')
          .from(Transaction, 't')
          .where('t.categoryId = b.categoryId')
          .andWhere('t.type = :type')
          .andWhere('t.date >= b.startDate')
          .andWhere('t.date <= b.endDate');
      }, 'spent')
      .setParameter('type', TransactionType.EXPENSE)
      .getRawAndEntities();

    const { entities, raw } = budgets;

    return entities.map((budget, index) => ({
      ...budget,
      spent: parseFloat(raw[index]?.spent ?? '0'),
    }));
  }
}
