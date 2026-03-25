import { apiFetch } from './client';
import type { AppNotification } from '@/app/types';

export function fetchNotifications(): Promise<AppNotification[]> {
  return apiFetch('/notifications');
}

export function fetchUnreadCount(): Promise<{ count: number }> {
  return apiFetch('/notifications/unread-count');
}

export function markNotificationRead(id: string): Promise<AppNotification> {
  return apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsRead(): Promise<void> {
  return apiFetch('/notifications/read-all', { method: 'PATCH' });
}
