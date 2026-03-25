import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PaginatedTransactionsDto } from './dto/paginated-transactions.dto';
import { QueryTransactionDto, SortableField } from './dto/query-transaction.dto';
import { TransactionSummaryDto } from './dto/transaction-summary.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly categoriesService: CategoriesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const category = await this.categoriesService.findOne(dto.categoryId);
    const transaction = this.transactionRepository.create({
      ...dto,
      category,
    });
    const saved = await this.transactionRepository.save(transaction);
    const full = await this.findOne(saved.id);
    this.eventEmitter.emit('transaction.created', full);
    return full;
  }

  async findAll(query: QueryTransactionDto): Promise<PaginatedTransactionsDto> {
    const {
      page = 1,
      limit = 10,
      sortBy = SortableField.CREATED_AT,
      order = 'DESC',
      category,
      type,
      status,
      startDate,
      endDate,
      search,
    } = query;

    const qb = this.transactionRepository
      .createQueryBuilder('transaction')
      .withDeleted()
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.deletedAt IS NULL');

    if (category) {
      qb.andWhere('category.id = :category', { category });
    }
    if (type) {
      qb.andWhere('transaction.type = :type', { type });
    }
    if (status) {
      qb.andWhere('transaction.status = :status', { status });
    }
    if (startDate) {
      qb.andWhere('transaction.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('transaction.date <= :endDate', { endDate });
    }
    if (search) {
      const escaped = search.replace(/[%_]/g, '\\$&');
      qb.andWhere(
        '(transaction.reference ILIKE :search OR transaction.counterparty ILIKE :search OR transaction.narration ILIKE :search)',
        { search: `%${escaped}%` },
      );
    }

    const sortColumn =
      sortBy === SortableField.CATEGORY
        ? 'category.name'
        : `transaction.${sortBy}`;

    qb.orderBy(sortColumn, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository
      .createQueryBuilder('transaction')
      .withDeleted()
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.id = :id', { id })
      .andWhere('transaction.deletedAt IS NULL')
      .getOne();
    if (!transaction) {
      throw new NotFoundException(`Transaction with id "${id}" not found`);
    }
    return transaction;
  }

  async update(id: string, dto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findOne(id);

    if (dto.categoryId) {
      transaction.category = await this.categoriesService.findOne(dto.categoryId);
    }

    const { categoryId: _, ...rest } = dto;
    Object.assign(transaction, rest);

    await this.transactionRepository.save(transaction);
    const updated = await this.findOne(id);
    this.eventEmitter.emit('transaction.updated', updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const transaction = await this.findOne(id);
    await this.transactionRepository.softRemove(transaction);
    this.eventEmitter.emit('transaction.deleted', { ...transaction, id });
  }

  async exportToCsv(): Promise<string> {
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .withDeleted()
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.deletedAt IS NULL')
      .orderBy('transaction.date', 'DESC')
      .getMany();

    const escape = (v: unknown) => {
      let str = String(v ?? '').replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(str)) str = `'${str}`;
      return `"${str}"`;
    };

    const header = ['id', 'date', 'type', 'amount', 'category', 'reference', 'counterparty', 'status', 'narration', 'createdAt'].join(',');
    const rows = transactions.map((t) =>
      [
        escape(t.id),
        escape(t.date),
        escape(t.type),
        escape(t.amount),
        escape(t.category?.name),
        escape(t.reference),
        escape(t.counterparty),
        escape(t.status),
        escape(t.narration),
        escape(t.createdAt),
      ].join(','),
    );

    return [header, ...rows].join('\n');
  }

  async getSummary(): Promise<TransactionSummaryDto> {
    const raw = await this.transactionRepository
      .createQueryBuilder('t')
      .select([
        `COALESCE(SUM(CASE WHEN t.type = 'income' AND t.status = 'Completed' THEN t.amount ELSE 0 END), 0) AS "totalIncome"`,
        `COALESCE(SUM(CASE WHEN t.type = 'expense' AND t.status = 'Completed' THEN t.amount ELSE 0 END), 0) AS "totalExpense"`,
        `COUNT(*) AS "transactionCount"`,
        `SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS "completedCount"`,
        `SUM(CASE WHEN t.status = 'Pending' THEN 1 ELSE 0 END) AS "pendingCount"`,
        `SUM(CASE WHEN t.status = 'Failed' THEN 1 ELSE 0 END) AS "failedCount"`,
      ])
      .getRawOne();

    const totalIncome = parseFloat(raw.totalIncome) || 0;
    const totalExpense = parseFloat(raw.totalExpense) || 0;

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionCount: parseInt(raw.transactionCount) || 0,
      byStatus: {
        Completed: parseInt(raw.completedCount) || 0,
        Pending: parseInt(raw.pendingCount) || 0,
        Failed: parseInt(raw.failedCount) || 0,
      },
    };
  }
}
