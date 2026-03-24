'use client';

import { useState, useCallback } from 'react';
import { Box, Button, Typography, Alert, Skeleton } from '@mui/material';
import { DataGrid, GridColDef, GridSortModel, GridPaginationModel } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fetchTransactions } from '@/lib/api/transactions';
import { useTransactionStore } from '@/app/hooks/useTransactionStore';
import { useDebounce } from '@/app/hooks/useDebounce';
import type { Transaction, TransactionStatus, TransactionQueryParams } from '@/app/types';
import StatusBadge from '@/app/components/StatusBadge';
import TransactionFilters from '@/app/components/TransactionFilters';
import TransactionDetailDrawer from '@/app/components/TransactionDetailDrawer';

const ACCENT = '#0eb68d';

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
  { field: 'reference', headerName: 'Reference', width: 150 },
  { field: 'counterparty', headerName: 'Counterparty', flex: 1, minWidth: 160 },
  {
    field: 'amount',
    headerName: 'Amount',
    width: 140,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (value: number) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: (params) => <StatusBadge status={params.value as TransactionStatus} />,
  },
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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const debouncedSearch = useDebounce(filters.searchTerm);

  const queryParams: TransactionQueryParams = {
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    sortBy: sortModel[0]?.field || 'createdAt',
    order: (sortModel[0]?.sort?.toUpperCase() as 'ASC' | 'DESC') || 'DESC',
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    startDate: filters.dateRange.startDate
      ? format(filters.dateRange.startDate, 'yyyy-MM-dd')
      : undefined,
    endDate: filters.dateRange.endDate
      ? format(filters.dateRange.endDate, 'yyyy-MM-dd')
      : undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['transactions', queryParams],
    queryFn: () => fetchTransactions(queryParams),
  });

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
          px: 3,
          py: 1.5,
          minHeight: 68,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => router.push('/transactions/new')}
          sx={{
            color: ACCENT,
            borderColor: ACCENT,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { borderColor: ACCENT, bgcolor: `${ACCENT}08` },
          }}
        >
          New Transaction
        </Button>
      </Box>

      {/* Filters */}
      <TransactionFilters status={statusFilter} onStatusChange={setStatusFilter} />

      {/* Content */}
      <Box sx={{ flex: 1, px: 3, pb: 3 }}>
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
                bgcolor: '#f0f0f2',
                borderRadius: 0,
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
                fontSize: 13,
              },
              '& .MuiDataGrid-cell': {
                fontSize: 13,
                borderColor: '#e1e2e6',
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
