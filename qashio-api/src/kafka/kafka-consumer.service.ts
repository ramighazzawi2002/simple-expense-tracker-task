import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka } from 'kafkajs';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditEntityType } from '../audit-logs/audit-log.entity';

const LARGE_EXPENSE_THRESHOLD = 1000;

interface TransactionEventPayload {
  event: string;
  occurredAt: string;
  data: {
    id: string;
    amount: number;
    type: string;
    categoryId: string;
    categoryName: string | null;
    date: string;
    reference: string;
    counterparty: string;
    status: string;
  };
}

interface BudgetExceededPayload {
  event: 'budget.exceeded';
  occurredAt: string;
  data: {
    budgetId: string;
    categoryId: string;
    period: string;
    budgetAmount: number;
    spent: number;
    overspendBy: number;
  };
}

type EventPayload = TransactionEventPayload | BudgetExceededPayload;

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: Consumer;

  constructor(
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
    private readonly auditLogs: AuditLogsService,
  ) {
    const kafka = new Kafka({
      clientId: 'qashio-api-consumer',
      brokers: [this.config.get<string>('KAFKA_BROKER') ?? 'kafka:29092'],
      retry: { initialRetryTime: 300, retries: 5 },
    });
    this.consumer = kafka.consumer({ groupId: 'notification-processor' });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: 'transaction-events', fromBeginning: false });
      await this.consumer.run({
        eachMessage: async ({ message }) => {
          try {
            const payload: EventPayload = JSON.parse(message.value?.toString() ?? '{}');
            await this.processEvent(payload);
          } catch (err) {
            this.logger.error(`Failed to process message: ${(err as Error).message}`);
          }
        },
      });
      this.logger.log('Kafka consumer connected and listening on "transaction-events"');
    } catch (err) {
      this.logger.warn(`Kafka consumer failed to start: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect().catch(() => {});
  }

  private async processEvent(payload: EventPayload): Promise<void> {
    await this.recordAuditLog(payload);

    switch (payload.event) {
      case 'budget.exceeded':
        await this.handleBudgetExceeded(payload as BudgetExceededPayload);
        break;
      case 'transaction.created':
        await this.handleTransactionCreated(payload as TransactionEventPayload);
        break;
    }
  }

  private async recordAuditLog(payload: EventPayload): Promise<void> {
    const isTransaction = ['transaction.created', 'transaction.updated', 'transaction.deleted'].includes(payload.event);
    const entityType = isTransaction ? AuditEntityType.TRANSACTION : AuditEntityType.BUDGET;
    const entityId = isTransaction
      ? (payload as TransactionEventPayload).data.id
      : (payload as BudgetExceededPayload).data.budgetId;

    await this.auditLogs.create({
      action: payload.event as AuditAction,
      entityType,
      entityId,
      payload: payload.data as Record<string, unknown>,
    });
  }

  private async handleBudgetExceeded(payload: BudgetExceededPayload): Promise<void> {
    const { data } = payload;
    await this.notifications.create({
      type: NotificationType.BUDGET_EXCEEDED,
      title: 'Budget Exceeded',
      message: `You've overspent your ${data.period} budget by $${data.overspendBy.toFixed(2)}. Spent $${data.spent.toFixed(2)} of $${data.budgetAmount.toFixed(2)} budget.`,
      metadata: {
        budgetId: data.budgetId,
        categoryId: data.categoryId,
        spent: data.spent,
        budgetAmount: data.budgetAmount,
      },
    });
    this.logger.log(`Notification created: budget exceeded for category ${data.categoryId}`);
  }

  private async handleTransactionCreated(payload: TransactionEventPayload): Promise<void> {
    const { data } = payload;
    if (data.type === 'expense' && data.amount >= LARGE_EXPENSE_THRESHOLD) {
      await this.notifications.create({
        type: NotificationType.LARGE_EXPENSE,
        title: 'Large Expense Detected',
        message: `A $${data.amount.toFixed(2)} expense was recorded${data.counterparty ? ` to ${data.counterparty}` : ''}${data.categoryName ? ` in ${data.categoryName}` : ''}.`,
        metadata: {
          transactionId: data.id,
          amount: data.amount,
          categoryId: data.categoryId,
        },
      });
      this.logger.log(`Notification created: large expense $${data.amount} (transaction ${data.id})`);
    }
  }
}
