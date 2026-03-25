'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import { formatDistanceToNow } from 'date-fns';
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllRead,
} from '@/app/hooks/useNotifications';
import type { AppNotification } from '@/app/types';

function NotificationIcon({ type }: { type: AppNotification['type'] }) {
  if (type === 'budget_exceeded') {
    return <WarningAmberIcon fontSize="small" color="error" />;
  }
  return <MoneyOffIcon fontSize="small" color="warning" />;
}

export default function NotificationBell() {
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { data: notifications, isLoading } = useNotifications();
  const { data: unreadData } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  const unreadCount = unreadData?.count ?? 0;

  const handleOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
  }, [queryClient]);

  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error" max={9}>
          <NotificationsIcon fontSize="small" />
        </Badge>
      </IconButton>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: { width: 360, maxHeight: 420 } },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : !notifications?.length ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ overflowY: 'auto', maxHeight: 340 }}>
            {notifications.map((n) => (
              <ListItemButton
                key={n.id}
                onClick={() => {
                  if (!n.read) markRead.mutate(n.id);
                }}
                sx={{
                  bgcolor: n.read ? 'transparent' : 'action.hover',
                  alignItems: 'flex-start',
                  py: 1.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                  <NotificationIcon type={n.type} />
                </ListItemIcon>
                <ListItemText
                  primary={n.title}
                  secondary={
                    <>
                      <Typography variant="caption" component="span" display="block" color="text.secondary">
                        {n.message}
                      </Typography>
                      <Typography variant="caption" component="span" color="text.disabled">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </Typography>
                    </>
                  }
                  primaryTypographyProps={{ fontSize: 13, fontWeight: n.read ? 400 : 600 }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
