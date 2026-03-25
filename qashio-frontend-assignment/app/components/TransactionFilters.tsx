'use client';

import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
  Button,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTransactionStore } from '@/app/hooks/useTransactionStore';
import { useCategories } from '@/app/hooks/useCategories';
import { API_BASE } from '@/lib/api/client';
import type { TransactionStatus, TransactionType } from '@/app/types';

interface TransactionFiltersProps {
  status: TransactionStatus | '';
  onStatusChange: (status: TransactionStatus | '') => void;
  categoryId: string;
  onCategoryChange: (id: string) => void;
  type: TransactionType | '';
  onTypeChange: (type: TransactionType | '') => void;
}

export default function TransactionFilters({
  status,
  onStatusChange,
  categoryId,
  onCategoryChange,
  type,
  onTypeChange,
}: TransactionFiltersProps) {
  const { filters, setSearchTerm, setDateRange } = useTransactionStore();

  const { data: categories } = useCategories();

  const handleStatusChange = (e: SelectChangeEvent<string>) => {
    onStatusChange(e.target.value as TransactionStatus | '');
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${API_BASE}/transactions/export`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently handled — user sees no download
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: { xs: 2, sm: 3 },
        py: 2,
        bgcolor: 'background.paper',
        flexWrap: 'wrap',
      }}
    >
      <TextField
        size="small"
        placeholder="Search..."
        value={filters.searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ width: { xs: '100%', sm: 260 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
      />
      <DatePicker
        label="Start Date"
        value={filters.dateRange.startDate}
        onChange={(date) => setDateRange(date, filters.dateRange.endDate)}
        slotProps={{
          textField: { size: 'small', sx: { width: 150 } },
        }}
      />
      <DatePicker
        label="End Date"
        value={filters.dateRange.endDate}
        onChange={(date) => setDateRange(filters.dateRange.startDate, date)}
        slotProps={{
          textField: { size: 'small', sx: { width: 150 } },
        }}
      />
      <FormControl size="small" sx={{ minWidth: 130 }}>
        <Select
          displayEmpty
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          sx={{ fontSize: 13 }}
        >
          <MenuItem value="">Category</MenuItem>
          {categories?.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 110 }}>
        <Select
          displayEmpty
          value={type}
          onChange={(e) => onTypeChange(e.target.value as TransactionType | '')}
          sx={{ fontSize: 13 }}
        >
          <MenuItem value="">Type</MenuItem>
          <MenuItem value="income">Income</MenuItem>
          <MenuItem value="expense">Expense</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          displayEmpty
          value={status}
          onChange={handleStatusChange}
          sx={{ fontSize: 13 }}
        >
          <MenuItem value="">Status</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Failed">Failed</MenuItem>
        </Select>
      </FormControl>
      <Tooltip title="Export as CSV">
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon fontSize="small" />}
          onClick={handleExport}
          sx={{ ml: 'auto' }}
        >
          Export
        </Button>
      </Tooltip>
    </Box>
  );
}
