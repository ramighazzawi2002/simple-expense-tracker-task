'use client';

import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTransactionStore } from '@/app/hooks/useTransactionStore';
import type { TransactionStatus } from '@/app/types';

interface TransactionFiltersProps {
  status: TransactionStatus | '';
  onStatusChange: (status: TransactionStatus | '') => void;
}

export default function TransactionFilters({
  status,
  onStatusChange,
}: TransactionFiltersProps) {
  const { filters, setSearchTerm, setDateRange } = useTransactionStore();

  const handleStatusChange = (e: SelectChangeEvent<string>) => {
    onStatusChange(e.target.value as TransactionStatus | '');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 3,
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
        sx={{ width: 300 }}
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
          textField: { size: 'small', sx: { width: 160 } },
        }}
      />
      <DatePicker
        label="End Date"
        value={filters.dateRange.endDate}
        onChange={(date) => setDateRange(filters.dateRange.startDate, date)}
        slotProps={{
          textField: { size: 'small', sx: { width: 160 } },
        }}
      />
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
    </Box>
  );
}
