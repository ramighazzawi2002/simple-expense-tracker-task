'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Skeleton,
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/app/hooks/useCategories';
import { useSnackbar } from '@/app/hooks/useSnackbar';

const schema = z.object({ name: z.string().min(1, 'Name is required').max(50, 'Max 50 characters') });
type FormData = z.infer<typeof schema>;

export default function CategoriesPage() {
  const { snackbar, showSuccess, showError, close: closeSnackbar } = useSnackbar();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const { data: categories, isLoading, isError } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onCreateSubmit = (data: FormData) => {
    createMutation.mutate(data.name.trim(), {
      onSuccess: () => {
        reset();
        showSuccess('Category created');
      },
      onError: (err: Error) => {
        showError(err.message || 'Failed to create category');
      },
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        showSuccess('Category deleted');
        setDeleteTarget(null);
      },
      onError: (err: Error) => {
        showError(err.message || 'Failed to delete category');
        setDeleteTarget(null);
      },
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Categories
      </Typography>

      {/* Add form */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          Add Category
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onCreateSubmit)} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <TextField
            size="small"
            label="Category name"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            sx={{ flex: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending}
            color="primary"
          >
            {createMutation.isPending ? <CircularProgress size={20} /> : 'Add'}
          </Button>
        </Box>
      </Paper>

      {/* List */}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        {isError && (
          <Alert severity="error" sx={{ m: 2 }}>
            Failed to load categories
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={48} sx={{ my: 0.5 }} />
            ))}
          </Box>
        ) : !categories?.length ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CategoryIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No categories yet. Add one above.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {categories.map((cat, index) => (
              <Box key={cat.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={cat.name}
                    primaryTypographyProps={{ fontWeight: 500, fontSize: 14 }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                      disabled={deleteMutation.isPending}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Paper>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
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
    </Box>
  );
}
