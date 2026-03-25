import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { Budget } from '../budgets/budget.entity';
import { Transaction } from './transaction.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionEventsListener } from './transaction-events.listener';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Budget]), CategoriesModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionEventsListener],
})
export class TransactionsModule {}
