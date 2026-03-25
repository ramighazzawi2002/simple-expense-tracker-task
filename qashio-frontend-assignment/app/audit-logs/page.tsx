'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Alert,
  TablePagination,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { formatDistanceToNow } from 'date-fns';
import { useAuditLogs } from '@/app/hooks/useAuditLogs';

const actionColors: Record<string, 'success' | 'info' | 'error' | 'warning'> = {
  'transaction.created': 'success',
  'transaction.updated': 'info',
  'transaction.deleted': 'error',
  'budget.exceeded': 'warning',
};

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [entityType, setEntityType] = useState('');
  const limit = 20;

  const { data, isLoading, isError } = useAuditLogs({
    entityType: entityType || undefined,
    page: page + 1,
    limit,
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Audit Logs
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            displayEmpty
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(0);
            }}
            sx={{ fontSize: 13 }}
          >
            <MenuItem value="">All types</MenuItem>
            <MenuItem value="transaction">Transaction</MenuItem>
            <MenuItem value="budget">Budget</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Failed to load audit logs</Alert>}

      {isLoading ? (
        <Box>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={48} sx={{ my: 0.5 }} />
          ))}
        </Box>
      ) : !data?.data.length ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <HistoryIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No audit logs yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Logs are created automatically when transactions are processed via Kafka.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Entity</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Entity ID</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Details</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Chip
                      label={log.action}
                      size="small"
                      color={actionColors[log.action] ?? 'default'}
                      sx={{ fontSize: 12 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, textTransform: 'capitalize' }}>
                    {log.entityType}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, fontFamily: 'monospace', color: 'text.secondary' }}>
                    {log.entityId.slice(0, 8)}...
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, maxWidth: 300 }}>
                    {log.payload && (
                      <Typography variant="caption" color="text.secondary" noWrap component="span">
                        {log.entityType === 'transaction'
                          ? `${(log.payload as Record<string, unknown>).type} $${(log.payload as Record<string, unknown>).amount}${(log.payload as Record<string, unknown>).counterparty ? ` — ${(log.payload as Record<string, unknown>).counterparty}` : ''}`
                          : `Spent $${(log.payload as Record<string, unknown>).spent} / $${(log.payload as Record<string, unknown>).budgetAmount}`}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={data.pagination.total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={limit}
            rowsPerPageOptions={[20]}
          />
        </TableContainer>
      )}
    </Box>
  );
}
