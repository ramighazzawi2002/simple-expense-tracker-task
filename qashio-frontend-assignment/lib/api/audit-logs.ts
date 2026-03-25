import { apiFetch } from './client';
import type { AuditLog, PaginatedResponse } from '@/app/types';

export function fetchAuditLogs(params?: {
  entityType?: string;
  entityId?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<AuditLog>> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, String(value));
    });
  }
  return apiFetch(`/audit-logs?${query}`);
}
