import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionEventsListener {
  private readonly logger = new Logger(TransactionEventsListener.name);

  @OnEvent('transaction.created')
  handleTransactionCreated(transaction: Transaction) {
    this.logger.log(
      `Transaction created: id=${transaction.id}, amount=${transaction.amount}, type=${transaction.type}, status=${transaction.status}`,
    );
  }

  @OnEvent('transaction.updated')
  handleTransactionUpdated(transaction: Transaction) {
    this.logger.log(
      `Transaction updated: id=${transaction.id}, amount=${transaction.amount}, type=${transaction.type}, status=${transaction.status}`,
    );
  }
}
