import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { Transaction } from './transaction.entity';

const TOPIC = 'transaction-events';

@Injectable()
export class TransactionEventsListener {
  private readonly logger = new Logger(TransactionEventsListener.name);

  constructor(private readonly kafka: KafkaProducerService) {}

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
