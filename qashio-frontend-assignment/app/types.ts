export interface Category {
  id: string;
  name: string;
}

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'Completed' | 'Pending' | 'Failed';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  categoryId: string;
  date: string;
  reference: string;
  counterparty: string;
  status: TransactionStatus;
  narration: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  category?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface CreateTransactionPayload {
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  reference?: string;
  counterparty?: string;
  status?: TransactionStatus;
  narration?: string;
}

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  byStatus: {
    Completed: number;
    Pending: number;
    Failed: number;
  };
}

export type BudgetPeriod = 'monthly' | 'weekly';

export interface Budget {
  id: string;
  category: Category;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
}

export interface BudgetWithSpent extends Budget {
  spent: number;
}

export interface CreateBudgetPayload {
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
}

export interface UpdateBudgetPayload {
  amount?: number;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
}

export type NotificationType = 'budget_exceeded' | 'large_expense';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

export interface TransactionFilters {
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  searchTerm: string;
} 