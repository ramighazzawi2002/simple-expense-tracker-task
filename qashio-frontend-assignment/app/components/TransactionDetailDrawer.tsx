'use client';

import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import type { Transaction } from '@/app/types';
import StatusBadge from './StatusBadge';

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25 }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

export default function TransactionDetailDrawer({ transaction, onClose }: Props) {
  if (!transaction) return null;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(transaction.amount);

  return (
    <Drawer anchor="right" open={!!transaction} onClose={onClose}>
      <Box sx={{ width: 400, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Transaction Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Stack spacing={2.5}>
          <Field label="Amount" value={formattedAmount} />
          <Field
            label="Type"
            value={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
          />
          <Field label="Category" value={transaction.category?.name} />
          <Field
            label="Date"
            value={(() => {
              try {
                return format(new Date(transaction.date), 'MMMM dd, yyyy');
              } catch {
                return transaction.date;
              }
            })()}
          />
          <Field label="Reference" value={transaction.reference} />
          <Field label="Counterparty" value={transaction.counterparty} />
          <Field label="Status" value={<StatusBadge status={transaction.status} />} />
          <Field label="Narration" value={transaction.narration} />
          <Divider />
          <Field
            label="Created"
            value={format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
          />
          <Field
            label="Updated"
            value={format(new Date(transaction.updatedAt), 'MMM dd, yyyy HH:mm')}
          />
        </Stack>
      </Box>
    </Drawer>
  );
}