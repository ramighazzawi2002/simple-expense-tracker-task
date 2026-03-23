import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { Transaction } from './transaction.entity';

const TOPIC = 'transaction-events';

@Injectable()
export class TransactionEventsListener {
  private readonly logger = new Logger(TransactionEventsListener.name);

  constructor(private readonly kafka: KafkaProducerService) {}

  @OnEvent('transaction.created')
  async handleTransactionCreated(transaction: Transaction): Promise<void> {
    this.logger.log(
      `Transaction created: id=${transaction.id}, amount=${transaction.amount}, type=${transaction.type}, status=${transaction.status}`,
    );
    await this.kafka.publish(TOPIC, transaction.id, {
      event: 'transaction.created',
      data: transaction,
    });
  }

  @OnEvent('transaction.updated')
  async handleTransactionUpdated(transaction: Transaction): Promise<void> {
    this.logger.log(
      `Transaction updated: id=${transaction.id}, amount=${transaction.amount}, type=${transaction.type}, status=${transaction.status}`,
    );
    await this.kafka.publish(TOPIC, transaction.id, {
      event: 'transaction.updated',
      data: transaction,
    });
  }

  @OnEvent('transaction.deleted')
  async handleTransactionDeleted(transaction: Transaction): Promise<void> {
    this.logger.log(
      `Transaction deleted: id=${transaction.id}, amount=${transaction.amount}, type=${transaction.type}`,
    );
    await this.kafka.publish(TOPIC, transaction.id, {
      event: 'transaction.deleted',
      data: transaction,
    });
  }
}
