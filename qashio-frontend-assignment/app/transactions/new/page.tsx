'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, Button, TextField, MenuItem, Typography, Alert,
  Snackbar, FormControl, InputLabel, Select, CircularProgress, FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useCreateTransaction } from '@/app/hooks/useTransactions';
import { useCategories } from '@/app/hooks/useCategories';
import { useSnackbar } from '@/app/hooks/useSnackbar';

const schema = z.object({
  amount: z.number({ error: 'Amount is required' }).positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().uuid('Select a category'),
  date: z.date({ error: 'Date is required' }),
  reference: z.string().optional(),
  counterparty: z.string().optional(),
  status: z.enum(['Completed', 'Pending', 'Failed']),
  narration: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewTransactionPage() {
  const router = useRouter();
  const { snackbar, showSuccess, showError, close: closeSnackbar } = useSnackbar();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createMutation = useCreateTransaction();

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'expense', status: 'Pending', date: new Date() },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(
      {
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        date: format(data.date, 'yyyy-MM-dd'),
        reference: data.reference || undefined,
        counterparty: data.counterparty || undefined,
        status: data.status,
        narration: data.narration || undefined,
      },
      {
        onSuccess: () => {
          showSuccess('Transaction created successfully');
          setTimeout(() => router.push('/transactions'), 1000);
        },
        onError: (err: Error) => {
          showError(err.message || 'Failed to create transaction');
        },
      },
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        New Transaction
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <TextField
              label="Amount"
              type="number"
              {...field}
              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
              error={!!errors.amount}
              helperText={errors.amount?.message}
              slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
            />
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <FormControl required error={!!errors.type}>
              <InputLabel>Type</InputLabel>
              <Select {...field} label="Type">
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
              {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
            </FormControl>
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <FormControl required error={!!errors.categoryId}>
              <InputLabel>Category</InputLabel>
              <Select {...field} label="Category" disabled={categoriesLoading}>
                {categories?.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
              {errors.categoryId && <FormHelperText>{errors.categoryId.message}</FormHelperText>}
            </FormControl>
          )}
        />

        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Date"
              value={field.value}
              onChange={field.onChange}
              slotProps={{
                textField: {
                  required: true,
                  error: !!errors.date,
                  helperText: errors.date?.message,
                },
              }}
            />
          )}
        />

        <TextField
          label="Reference"
          {...register('reference')}
          error={!!errors.reference}
          helperText={errors.reference?.message}
        />

        <TextField
          label="Counterparty"
          {...register('counterparty')}
          error={!!errors.counterparty}
          helperText={errors.counterparty?.message}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormControl error={!!errors.status}>
              <InputLabel>Status</InputLabel>
              <Select {...field} label="Status">
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
              </Select>
              {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
            </FormControl>
          )}
        />

        <TextField
          label="Narration"
          multiline
          rows={3}
          {...register('narration')}
          error={!!errors.narration}
          helperText={errors.narration?.message}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending}
            color="primary"
          >
            {createMutation.isPending ? <CircularProgress size={22} /> : 'Create Transaction'}
          </Button>
          <Button variant="text" onClick={() => router.push('/transactions')}>
            Cancel
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={closeSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
