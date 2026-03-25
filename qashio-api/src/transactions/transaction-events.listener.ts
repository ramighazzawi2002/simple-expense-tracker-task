import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget, BudgetPeriod } from '../budgets/budget.entity';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from './transaction.entity';

const TOPIC = 'transaction-events';

@Injectable()
export class TransactionEventsListener {
  private readonly logger = new Logger(TransactionEventsListener.name);

  constructor(
    private readonly kafka: KafkaProducerService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
  ) {}

  private toPayload(transaction: Transaction) {
    return {
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      categoryName: transaction.category?.name ?? null,
      date: transaction.date,
      reference: transaction.reference,
      counterparty: transaction.counterparty,
      status: transaction.status,
      narration: transaction.narration,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  private getPeriodBounds(
    budget: Budget,
    transactionDate: string,
  ): { periodStart: string; periodEnd: string } {
    const txDate = new Date(transactionDate);
    const budgetStart = new Date(budget.startDate);
    const budgetEnd = new Date(budget.endDate);

    let periodStart: Date;
    let periodEnd: Date;

    if (budget.period === BudgetPeriod.MONTHLY) {
      periodStart = new Date(txDate.getFullYear(), txDate.getMonth(), 1);
      periodEnd = new Date(txDate.getFullYear(), txDate.getMonth() + 1, 0);
    } else {
      const diffDays = Math.floor((txDate.getTime() - budgetStart.getTime()) / 86400000);
      const weekOffset = Math.floor(diffDays / 7) * 7;
      periodStart = new Date(budgetStart);
      periodStart.setDate(periodStart.getDate() + weekOffset);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 6);
    }

    if (periodStart < budgetStart) periodStart = budgetStart;
    if (periodEnd > budgetEnd) periodEnd = budgetEnd;

    return {
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: periodEnd.toISOString().split('T')[0],
    };
  }

  private async checkBudgetUsage(transaction: Transaction): Promise<void> {
    const budgets = await this.budgetRepository
      .createQueryBuilder('b')
      .where('b.categoryId = :categoryId', { categoryId: transaction.categoryId })
      .andWhere('b.startDate <= :date', { date: transaction.date })
      .andWhere('b.endDate >= :date', { date: transaction.date })
      .getMany();

    for (const budget of budgets) {
      const { periodStart, periodEnd } = this.getPeriodBounds(budget, transaction.date);

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

      const spent = parseFloat(result?.total ?? '0');

      if (spent > budget.amount) {
        const overspendBy = spent - budget.amount;
        this.logger.warn(
          `Budget exceeded — categoryId=${budget.categoryId}, period=${periodStart}..${periodEnd}, spent=${spent}, budget=${budget.amount}, over=${overspendBy}`,
        );
        await this.kafka.publish(TOPIC, budget.id, {
          event: 'budget.exceeded',
          occurredAt: new Date().toISOString(),
          data: {
            budgetId: budget.id,
            categoryId: budget.categoryId,
            period: budget.period,
            periodStart,
            periodEnd,
            budgetAmount: budget.amount,
            spent,
            overspendBy,
          },
        });
      }
    }
  }

  @OnEvent('transaction.created')
  async handleTransactionCreated(transaction: Transaction): Promise<void> {
    this.logger.log(
      `Transaction created: id=${transaction.id}, amount=${transaction.amount}, type=${transaction.type}, status=${transaction.status}`,
    );
    await this.kafka.publish(TOPIC, transaction.id, {
      event: 'transaction.created',
      occurredAt: new Date().toISOString(),
      data: this.toPayload(transaction),
    });

    if (transaction.type === TransactionType.EXPENSE) {
      await this.checkBudgetUsage(transaction);
    }
  }

  @OnEvent('transaction.updated')
  async handleTransactionUpdated(transaction: Transaction): Promise<void> {
    this.logger.log(
      `Transaction updated: id=${transaction.id}, amount=${transaction.amount}, type=${transaction.type}, status=${transaction.status}`,
    );
    await this.kafka.publish(TOPIC, transaction.id, {
      event: 'transaction.updated',
      occurredAt: new Date().toISOString(),
      data: this.toPayload(transaction),
    });

    if (transaction.type === TransactionType.EXPENSE) {
      await this.checkBudgetUsage(transaction);
    }
  }

  @OnEvent('transaction.deleted')
  async handleTransactionDeleted(transaction: Transaction): Promise<void> {
    this.logger.log(
      `Transaction deleted: id=${transaction.id}, amount=${transaction.amount}, type=${transaction.type}`,
    );
    await this.kafka.publish(TOPIC, transaction.id, {
      event: 'transaction.deleted',
      occurredAt: new Date().toISOString(),
      data: this.toPayload(transaction),
    });
  }
}
