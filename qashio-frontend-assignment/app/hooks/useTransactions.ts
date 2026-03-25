'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTransactions,
  fetchTransactionSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/lib/api/transactions';
import type {
  TransactionQueryParams,
  CreateTransactionPayload,
  UpdateTransactionPayload,
} from '@/app/types';

export function useTransactions(params: TransactionQueryParams) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => fetchTransactions(params),
  });
}

export function useTransactionSummary() {
  return useQuery({
    queryKey: ['transactions-summary'],
    queryFn: fetchTransactionSummary,
  });
}

function invalidateAfterTransactionChange(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
  queryClient.invalidateQueries({ queryKey: ['transactions-summary'] });
  queryClient.invalidateQueries({ queryKey: ['budgets'] });
  queryClient.invalidateQueries({ queryKey: ['audit-logs'] });

  // Notifications are created asynchronously via events, so delay their refetch
  setTimeout(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
  }, 1000);
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionPayload) => createTransaction(data),
    retry: false,
    onSuccess: () => invalidateAfterTransactionChange(queryClient),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionPayload }) =>
      updateTransaction(id, data),
    retry: false,
    onSuccess: () => invalidateAfterTransactionChange(queryClient),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    retry: false,
    onSuccess: () => invalidateAfterTransactionChange(queryClient),
  });
}