'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '@/lib/api/audit-logs';

export function useAuditLogs(params?: {
  entityType?: string;
  entityId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => fetchAuditLogs(params),
  });
}
