'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { createTransaction } from '@/lib/api/transactions';
import { fetchCategories } from '@/lib/api/categories';
import type { CreateTransactionPayload, TransactionStatus, TransactionType } from '@/app/types';

export default function NewTransactionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [reference, setReference] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('Pending');
  const [narration, setNarration] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setSnackbar({ open: true, message: 'Transaction created successfully', severity: 'success' });
      setTimeout(() => router.push('/transactions'), 1000);
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message || 'Failed to create transaction', severity: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !date) return;

    const payload: CreateTransactionPayload = {
      amount: parseFloat(amount),
      type,
      categoryId,
      date: format(date, 'yyyy-MM-dd'),
      reference: reference || undefined,
      counterparty: counterparty || undefined,
      status,
      narration: narration || undefined,
    };
    mutation.mutate(payload);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        New Transaction
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Amount"
          type="number"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
        />

        <FormControl required>
          <InputLabel>Type</InputLabel>
          <Select value={type} label="Type" onChange={(e) => setType(e.target.value as TransactionType)}>
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </Select>
        </FormControl>

        <FormControl required>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryId}
            label="Category"
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={categoriesLoading}
          >
            {categories?.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DatePicker
          label="Date"
          value={date}
          onChange={setDate}
          slotProps={{ textField: { required: true } }}
        />

        <TextField
          label="Reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />

        <TextField
          label="Counterparty"
          value={counterparty}
          onChange={(e) => setCounterparty(e.target.value)}
        />

        <FormControl>
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value as TransactionStatus)}>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Failed">Failed</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Narration"
          multiline
          rows={3}
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {mutation.isPending ? <CircularProgress size={22} /> : 'Create Transaction'}
          </Button>
          <Button
            variant="text"
            onClick={() => router.push('/transactions')}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
