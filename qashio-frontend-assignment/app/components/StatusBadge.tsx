'use client';

import { Chip } from '@mui/material';
import type { TransactionStatus } from '@/app/types';

const STATUS_STYLES: Record<TransactionStatus, { bgcolor: string; color: string }> = {
  Completed: { bgcolor: '#e6f9f1', color: '#00c48c' },
  Pending: { bgcolor: '#f0ecf9', color: '#7b61ff' },
  Failed: { bgcolor: '#fde8e8', color: '#e53935' },
};

export default function StatusBadge({ status }: { status: TransactionStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: style.bgcolor,
        color: style.color,
        fontWeight: 600,
        fontSize: 12,
        height: 24,
        borderRadius: 1.5,
      }}
    />
  );
}