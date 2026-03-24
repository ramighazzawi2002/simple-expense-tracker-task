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

export interface TransactionFilters {
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  searchTerm: string;
} 