'use client';

import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { useUpdateTransaction, useDeleteTransaction } from '@/app/hooks/useTransactions';
import { useCategories } from '@/app/hooks/useCategories';
import { useSnackbar } from '@/app/hooks/useSnackbar';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import type { Transaction, TransactionStatus, TransactionType } from '@/app/types';
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
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { snackbar, showSuccess, showError, close: closeSnackbar } = useSnackbar();

  const [editForm, setEditForm] = useState({
    amount: '',
    type: 'expense' as TransactionType,
    categoryId: '',
    date: null as Date | null,
    reference: '',
    counterparty: '',
    status: 'Pending' as TransactionStatus,
    narration: '',
  });

  const { data: categories } = useCategories(mode === 'edit');

  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;
    const amount = parseFloat(editForm.amount);
    if (isNaN(amount) || amount <= 0) {
      showError('Amount must be a positive number');
      return;
    }
    updateMutation.mutate(
      {
        id: transaction.id,
        data: {
          amount,
          type: editForm.type,
          categoryId: editForm.categoryId,
          date: editForm.date ? format(editForm.date, 'yyyy-MM-dd') : undefined,
          reference: editForm.reference || undefined,
          counterparty: editForm.counterparty || undefined,
          status: editForm.status,
          narration: editForm.narration || undefined,
        },
      },
      {
        onSuccess: () => {
          showSuccess('Transaction updated');
          setMode('view');
          onClose();
        },
        onError: (err: Error) => {
          showError(err.message || 'Update failed');
        },
      },
    );
  };

  const handleDelete = () => {
    if (!transaction) return;
    deleteMutation.mutate(transaction.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        onClose();
      },
      onError: (err: Error) => {
        showError(err.message || 'Delete failed');
        setDeleteOpen(false);
      },
    });
  };

  useEffect(() => {
    setMode('view');
  }, [transaction?.id]);

  if (!transaction) return null;

  const formattedAmount = formatCurrency(transaction.amount);

  const handleEditStart = () => {
    setEditForm({
      amount: String(transaction.amount),
      type: transaction.type,
      categoryId: transaction.category?.id || transaction.categoryId,
      date: transaction.date ? new Date(transaction.date) : null,
      reference: transaction.reference || '',
      counterparty: transaction.counterparty || '',
      status: transaction.status,
      narration: transaction.narration || '',
    });
    setMode('edit');
  };

  const handleClose = () => {
    setMode('view');
    onClose();
  };

  return (
    <>
      <Drawer anchor="right" open={!!transaction} onClose={handleClose}>
        <Box sx={{ width: 420, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {mode === 'edit' ? 'Edit Transaction' : 'Transaction Details'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {mode === 'view' && (
                <>
                  <IconButton size="small" onClick={handleEditStart} title="Edit">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setDeleteOpen(true)} title="Delete" color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </>
              )}
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* View mode */}
          {mode === 'view' && (
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
                value={(() => {
                  try { return format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm'); }
                  catch { return transaction.createdAt; }
                })()}
              />
              <Field
                label="Updated"
                value={(() => {
                  try { return format(new Date(transaction.updatedAt), 'MMM dd, yyyy HH:mm'); }
                  catch { return transaction.updatedAt; }
                })()}
              />
            </Stack>
          )}

          {/* Edit mode */}
          {mode === 'edit' && (
            <Box
              component="form"
              onSubmit={handleUpdate}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}
            >
              <TextField
                label="Amount"
                type="number"
                required
                value={editForm.amount}
                onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
              />

              <FormControl required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={editForm.type}
                  label="Type"
                  onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value as TransactionType }))}
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>

              <FormControl required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editForm.categoryId}
                  label="Category"
                  onChange={(e) => setEditForm((f) => ({ ...f, categoryId: e.target.value }))}
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
                value={editForm.date}
                onChange={(d) => setEditForm((f) => ({ ...f, date: d }))}
                slotProps={{ textField: { required: true } }}
              />

              <TextField
                label="Reference"
                value={editForm.reference}
                onChange={(e) => setEditForm((f) => ({ ...f, reference: e.target.value }))}
              />

              <TextField
                label="Counterparty"
                value={editForm.counterparty}
                onChange={(e) => setEditForm((f) => ({ ...f, counterparty: e.target.value }))}
              />

              <FormControl>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editForm.status}
                  label="Status"
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as TransactionStatus }))}
                >
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Narration"
                multiline
                rows={3}
                value={editForm.narration}
                onChange={(e) => setEditForm((f) => ({ ...f, narration: e.target.value }))}
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 'auto', pt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updateMutation.isPending}
                  color="primary"
                >
                  {updateMutation.isPending ? <CircularProgress size={20} /> : 'Save Changes'}
                </Button>
                <Button
                  variant="text"
                  onClick={() => setMode('view')}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={18} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
}
