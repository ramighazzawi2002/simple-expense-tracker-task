'use client';

import { Chip, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { TransactionStatus } from '@/app/types';

export default function StatusBadge({ status }: { status: TransactionStatus }) {
  const theme = useTheme();

  const STATUS_STYLES: Record<TransactionStatus, { bgcolor: string; color: string }> = {
    Completed: { bgcolor: alpha(theme.palette.success.main, 0.12), color: theme.palette.success.main },
    Pending: { bgcolor: alpha(theme.palette.info.main, 0.12), color: theme.palette.info.main },
    Failed: { bgcolor: alpha(theme.palette.error.main, 0.12), color: theme.palette.error.main },
  };

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
