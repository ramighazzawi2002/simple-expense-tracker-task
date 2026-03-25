import { apiFetch } from './client';
import type { BudgetWithSpent, CreateBudgetPayload, UpdateBudgetPayload } from '@/app/types';

export function fetchBudgets(): Promise<BudgetWithSpent[]> {
  return apiFetch('/budgets');
}

export function createBudget(data: CreateBudgetPayload): Promise<BudgetWithSpent> {
  return apiFetch('/budgets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateBudget(id: string, data: UpdateBudgetPayload): Promise<BudgetWithSpent> {
  return apiFetch(`/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteBudget(id: string): Promise<void> {
  return apiFetch(`/budgets/${id}`, { method: 'DELETE' });
}
