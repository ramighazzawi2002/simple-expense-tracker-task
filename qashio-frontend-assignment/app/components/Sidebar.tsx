'use client';

import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/api/auth';
import NotificationBell from './NotificationBell';

export const SIDEBAR_WIDTH = 260;

const navItems = [
  { label: 'Transactions', href: '/transactions', icon: <ReceiptLongIcon fontSize="small" /> },
  { label: 'Categories', href: '/categories', icon: <CategoryIcon fontSize="small" /> },
  { label: 'Budgets', href: '/budgets', icon: <AccountBalanceWalletIcon fontSize="small" /> },
  { label: 'Audit Logs', href: '/audit-logs', icon: <HistoryIcon fontSize="small" /> },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout().catch(() => {});
    router.push('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Company
        </Typography>
      </Box>
      <List sx={{ px: 1, flex: 1 }}>
        {navItems.map(({ label, href, icon }) => {
          const selected = pathname?.startsWith(href);
          return (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              selected={selected}
              onClick={onNavigate}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'secondary.main',
                  color: 'common.white',
                  '&:hover': { bgcolor: 'secondary.main' },
                  '& .MuiListItemIcon-root': { color: 'common.white' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
        <NotificationBell />
        <Tooltip title="Sign out">
          <IconButton size="small" onClick={handleLogout}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  if (isDesktop) {
    return (
      <Box
        component="nav"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          minHeight: '100vh',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <SidebarContent />
      </Box>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onMobileClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <SidebarContent onNavigate={onMobileClose} />
    </Drawer>
  );
}
