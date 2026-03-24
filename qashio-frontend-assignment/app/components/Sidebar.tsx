'use client';

import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ACCENT = '#a78f65';

export default function Sidebar() {
  const pathname = usePathname();
  const isTransactions = pathname?.startsWith('/transactions');

  return (
    <Box
      component="nav"
      sx={{
        width: 260,
        minHeight: '100vh',
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Company
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        <ListItemButton
          component={Link}
          href="/transactions"
          selected={isTransactions}
          sx={{
            borderRadius: 2,
            mx: 1,
            '&.Mui-selected': {
              bgcolor: ACCENT,
              color: '#fff',
              '&:hover': { bgcolor: ACCENT },
              '& .MuiListItemIcon-root': { color: '#fff' },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <ReceiptLongIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Transactions"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
          />
        </ListItemButton>
      </List>
    </Box>
  );
}
