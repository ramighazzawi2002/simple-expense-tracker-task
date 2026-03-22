import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './transaction.entity';

const SORTABLE_FIELDS = ['amount', 'date', 'status', 'type', 'createdAt', 'updatedAt'];

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
    this.eventEmitter.emit('transaction.created', saved);
    return saved;
  }

  async findAll(query: QueryTransactionDto): Promise<{
    data: Transaction[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'DESC',
      category,
      type,
      status,
      startDate,
      endDate,
      search,
    } = query;

    const field = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';

    const qb = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category');

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
      qb.andWhere(
        '(transaction.reference ILIKE :search OR transaction.counterparty ILIKE :search OR transaction.narration ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const sortColumn = field === 'createdAt' || field === 'updatedAt'
      ? `transaction.${field}`
      : `transaction.${field}`;

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
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['category'],
    });
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

    const { categoryId, ...rest } = dto;
    Object.assign(transaction, rest);

    const updated = await this.transactionRepository.save(transaction);
    this.eventEmitter.emit('transaction.updated', updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const transaction = await this.findOne(id);
    await this.transactionRepository.remove(transaction);
  }
}
