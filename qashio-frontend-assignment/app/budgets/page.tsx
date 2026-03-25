'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  Skeleton,
  Stack,
  Chip,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/app/hooks/useBudgets';
import { useCategories } from '@/app/hooks/useCategories';
import { useSnackbar } from '@/app/hooks/useSnackbar';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import type { BudgetPeriod, BudgetWithSpent } from '@/app/types';


type EditState = { amount: string; period: BudgetPeriod; startDate: Date | null; endDate: Date | null };

function BudgetCard({
  budget,
  onDelete,
  onUpdate,
  isDeleting,
}: {
  budget: BudgetWithSpent;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: EditState) => void;
  isDeleting: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditState>({
    amount: String(budget.amount),
    period: budget.period,
    startDate: new Date(budget.startDate),
    endDate: new Date(budget.endDate),
  });

  const pct = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
  const over = budget.spent > budget.amount;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(budget.id, editForm);
    setEditing(false);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: editing ? 2 : 1.5 }}>
        <Box>
          <Typography fontWeight={600} fontSize={15}>
            {budget.category?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {budget.startDate} → {budget.endDate}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {!editing && (
            <Box sx={{ textAlign: 'right', mr: 1 }}>
              <Chip label={budget.period} size="small" sx={{ textTransform: 'capitalize', mb: 0.5 }} />
              <Typography variant="body2" color="text.secondary" display="block">
                {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
              </Typography>
            </Box>
          )}
          <IconButton size="small" onClick={() => setEditing((v) => !v)} title={editing ? 'Cancel' : 'Edit'}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteOpen(true)} disabled={isDeleting}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={editing}>
        <Box
          component="form"
          onSubmit={handleSave}
          sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}
        >
          <TextField
            size="small"
            label="Amount"
            type="number"
            required
            value={editForm.amount}
            onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
            slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
          />
          <FormControl size="small" required>
            <InputLabel>Period</InputLabel>
            <Select
              value={editForm.period}
              label="Period"
              onChange={(e) => setEditForm((f) => ({ ...f, period: e.target.value as BudgetPeriod }))}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
            </Select>
          </FormControl>
          <DatePicker
            label="Start date"
            value={editForm.startDate}
            onChange={(d) => setEditForm((f) => ({ ...f, startDate: d }))}
            slotProps={{ textField: { size: 'small', required: true } }}
          />
          <DatePicker
            label="End date"
            value={editForm.endDate}
            onChange={(d) => setEditForm((f) => ({ ...f, endDate: d }))}
            slotProps={{ textField: { size: 'small', required: true } }}
          />
          <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 1 }}>
            <Button
              type="submit"
              size="small"
              variant="contained"
              color="primary"
            >
              Save
            </Button>
            <Button size="small" variant="text" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Collapse>

      {!editing && (
        <>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.300',
              '& .MuiLinearProgress-bar': { bgcolor: over ? 'error.main' : 'primary.main', borderRadius: 4 },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
            <Typography variant="caption" color={over ? 'error' : 'text.secondary'}>
              {over
                ? `${formatCurrency(budget.spent - budget.amount)} over budget`
                : `${formatCurrency(budget.amount - budget.spent)} remaining`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {pct.toFixed(0)}%
            </Typography>
          </Box>
        </>
      )}

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Budget</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the budget for &quot;{budget.category?.name}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onDelete(budget.id);
              setDeleteOpen(false);
            }}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={18} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default function BudgetsPage() {
  const [form, setForm] = useState<{
    categoryId: string;
    amount: string;
    period: BudgetPeriod;
    startDate: Date | null;
    endDate: Date | null;
  }>({ categoryId: '', amount: '', period: 'monthly', startDate: null, endDate: null });

  const { snackbar, showSuccess, showError, close: closeSnackbar } = useSnackbar();
  const { data: budgets, isLoading, isError } = useBudgets();
  const { data: categories } = useCategories();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId || !form.amount || !form.startDate || !form.endDate) return;
    createMutation.mutate(
      {
        categoryId: form.categoryId,
        amount: parseFloat(form.amount),
        period: form.period,
        startDate: format(form.startDate, 'yyyy-MM-dd'),
        endDate: format(form.endDate, 'yyyy-MM-dd'),
      },
      {
        onSuccess: () => {
          setForm({ categoryId: '', amount: '', period: 'monthly', startDate: null, endDate: null });
          showSuccess('Budget created');
        },
        onError: (err: Error) => {
          showError(err.message || 'Failed to create budget');
        },
      },
    );
  };

  const handleUpdate = (id: string, data: EditState) => {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      showError('Amount must be a positive number');
      return;
    }
    updateMutation.mutate(
      {
        id,
        data: {
          amount,
          period: data.period,
          startDate: data.startDate ? format(data.startDate, 'yyyy-MM-dd') : undefined,
          endDate: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : undefined,
        },
      },
      {
        onSuccess: () => showSuccess('Budget updated'),
        onError: (err: Error) => showError(err.message || 'Failed to update budget'),
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => showSuccess('Budget deleted'),
      onError: (err: Error) => showError(err.message || 'Failed to delete budget'),
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Budgets
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
          Set Budget
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <FormControl required size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={form.categoryId}
              label="Category"
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            >
              {categories?.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Budget amount"
            type="number"
            required
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
          />
          <FormControl size="small" required>
            <InputLabel>Period</InputLabel>
            <Select
              value={form.period}
              label="Period"
              onChange={(e) => setForm((f) => ({ ...f, period: e.target.value as BudgetPeriod }))}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
            </Select>
          </FormControl>
          <Box />
          <DatePicker
            label="Start date"
            value={form.startDate}
            onChange={(d) => setForm((f) => ({ ...f, startDate: d }))}
            slotProps={{ textField: { size: 'small', required: true } }}
          />
          <DatePicker
            label="End date"
            value={form.endDate}
            onChange={(d) => setForm((f) => ({ ...f, endDate: d }))}
            slotProps={{ textField: { size: 'small', required: true } }}
          />
          <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending}
              color="primary"
              sx={{color: 'white'}}
            >
              {createMutation.isPending ? <CircularProgress size={20} /> : 'Set Budget'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Failed to load budgets</Alert>}

      {isLoading ? (
        <Stack spacing={2}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={100} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      ) : !budgets?.length ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No budgets set yet.</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </Stack>
      )}

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
