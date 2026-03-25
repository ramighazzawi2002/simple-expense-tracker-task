'use client';

import { useState, useCallback } from 'react';
import { Box, Button, Typography, Alert, Skeleton, Paper } from '@mui/material';
import { DataGrid, GridColDef, GridSortModel, GridPaginationModel } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useTransactions, useTransactionSummary } from '@/app/hooks/useTransactions';
import { useTransactionStore } from '@/app/hooks/useTransactionStore';
import { useDebounce } from '@/app/hooks/useDebounce';
import type { Transaction, TransactionStatus, TransactionType, TransactionQueryParams } from '@/app/types';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import StatusBadge from '@/app/components/StatusBadge';
import TransactionFilters from '@/app/components/TransactionFilters';
import TransactionDetailDrawer from '@/app/components/TransactionDetailDrawer';

const columns: GridColDef<Transaction>[] = [
  {
    field: 'date',
    headerName: 'Date',
    width: 130,
    valueFormatter: (value: string) => {
      try {
        return format(new Date(value), 'MMM dd, yyyy');
      } catch {
        return value;
      }
    },
  },
  { field: 'reference', headerName: 'Reference', width: 130 },
  { field: 'counterparty', headerName: 'Counterparty', flex: 1, minWidth: 130 },
  {
    field: 'type',
    headerName: 'Type',
    width: 100,
    valueFormatter: (value: string) => value?.charAt(0).toUpperCase() + value?.slice(1),
  },
  {
    field: 'category',
    headerName: 'Category',
    width: 140,
    valueGetter: (_value: unknown, row: Transaction) => row.category?.name ?? '',
  },
  {
    field: 'amount',
    headerName: 'Amount',
    width: 130,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (value: number) => formatCurrency(value),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => <StatusBadge status={params.value as TransactionStatus} />,
  },
  { field: 'narration', headerName: 'Narration', width: 150 },
];

export default function TransactionsPage() {
  const router = useRouter();
  const { filters } = useTransactionStore();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' },
  ]);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const debouncedSearch = useDebounce(filters.searchTerm);

  const queryParams: TransactionQueryParams = {
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    sortBy: sortModel[0]?.field || 'createdAt',
    order: (sortModel[0]?.sort?.toUpperCase() as 'ASC' | 'DESC') || 'DESC',
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    category: categoryFilter || undefined,
    startDate: filters.dateRange.startDate
      ? format(filters.dateRange.startDate, 'yyyy-MM-dd')
      : undefined,
    endDate: filters.dateRange.endDate
      ? format(filters.dateRange.endDate, 'yyyy-MM-dd')
      : undefined,
  };

  const { data, isLoading, isError, error } = useTransactions(queryParams);
  const { data: summary } = useTransactionSummary();

  const handleSortChange = useCallback((model: GridSortModel) => {
    setSortModel(model);
  }, []);

  const handlePaginationChange = useCallback((model: GridPaginationModel) => {
    setPaginationModel(model);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          px: { xs: 2, sm: 3 },
          py: 1.5,
          minHeight: 68,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => router.push('/transactions/new')}
          color="primary"
        >
          New Transaction
        </Button>
      </Box>

      {/* Filters */}
      <TransactionFilters
        status={statusFilter}
        onStatusChange={setStatusFilter}
        type={typeFilter}
        onTypeChange={setTypeFilter}
        categoryId={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* Summary Stats */}
      {summary && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
            px: { xs: 2, sm: 3 },
            pb: 2,
          }}
        >
          {[
            { label: 'Total Income', value: summary.totalIncome, color: 'success.main' },
            { label: 'Total Expense', value: summary.totalExpense, color: 'error.main' },
            { label: 'Net Balance', value: summary.netBalance, color: summary.netBalance >= 0 ? 'success.main' : 'error.main' },
          ].map(({ label, value, color }) => (
            <Paper
              key={label}
              variant="outlined"
              sx={{ px: 2.5, py: 1.5, borderRadius: 2 }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {label}
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color, mt: 0.25 }}>
                {formatCurrency(value)}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      {/* Content */}
      <Box sx={{ flex: 1, px: { xs: 2, sm: 3 }, pb: 3, overflow: 'auto' }}>
        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(error as Error).message || 'Failed to load transactions'}
          </Alert>
        )}

        {isLoading ? (
          <Box>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={56} sx={{ my: 0.5 }} />
            ))}
          </Box>
        ) : !data?.data.length ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No transactions found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Create your first transaction to get started.
            </Typography>
          </Box>
        ) : (
          <DataGrid
            rows={data.data}
            columns={columns}
            rowCount={data.pagination.total}
            paginationMode="server"
            sortingMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationChange}
            sortModel={sortModel}
            onSortModelChange={handleSortChange}
            pageSizeOptions={[10, 25, 50]}
            onRowClick={(params) => setSelectedTransaction(params.row)}
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'grey.100',
                borderRadius: 0,
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
                fontSize: 13,
              },
              '& .MuiDataGrid-cell': {
                fontSize: 13,
                borderColor: 'divider',
              },
              '& .MuiDataGrid-row:hover': {
                cursor: 'pointer',
              },
            }}
          />
        )}
      </Box>

      {/* Detail Drawer */}
      <TransactionDetailDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </Box>
  );
}
