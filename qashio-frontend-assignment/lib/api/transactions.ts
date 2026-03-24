import { apiFetch } from './client';
import type {
  Transaction,
  PaginatedResponse,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  TransactionQueryParams,
} from '@/app/types';

export function fetchTransactions(
  params: TransactionQueryParams,
): Promise<PaginatedResponse<Transaction>> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  return apiFetch(`/transactions?${query}`);
}

export function fetchTransaction(id: string): Promise<Transaction> {
  return apiFetch(`/transactions/${id}`);
}

export function createTransaction(
  data: CreateTransactionPayload,
): Promise<Transaction> {
  return apiFetch('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateTransaction(
  id: string,
  data: UpdateTransactionPayload,
): Promise<Transaction> {
  return apiFetch(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteTransaction(id: string): Promise<void> {
  return apiFetch(`/transactions/${id}`, { method: 'DELETE' });
}
