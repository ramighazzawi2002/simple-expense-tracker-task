import { apiFetch } from './client';
import type { Category } from '@/app/types';

export function fetchCategories(): Promise<Category[]> {
  return apiFetch('/categories');
}

export function createCategory(name: string): Promise<Category> {
  return apiFetch('/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function deleteCategory(id: string): Promise<void> {
  return apiFetch(`/categories/${id}`, { method: 'DELETE' });
}