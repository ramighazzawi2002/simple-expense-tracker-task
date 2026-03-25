import { Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.entity';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List recent notifications' })
  @ApiResponse({ status: 200, description: 'List of recent notifications', type: [Notification] })
  findAll(): Promise<Notification[]> {
    return this.service.findAll();
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread notification count' })
  async getUnreadCount(): Promise<{ count: number }> {
    const count = await this.service.getUnreadCount();
    return { count };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  markAllAsRead(): Promise<void> {
    return this.service.markAllAsRead();
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', type: Notification })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  markAsRead(@Param('id', ParseUUIDPipe) id: string): Promise<Notification> {
    return this.service.markAsRead(id);
  }
}
