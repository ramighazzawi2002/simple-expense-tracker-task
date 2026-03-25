import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async create(data: {
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    return this.repo.save(this.repo.create(data));
  }

  async findAll(): Promise<Notification[]> {
    return this.repo.find({ order: { createdAt: 'DESC' }, take: 50 });
  }

  async getUnreadCount(): Promise<number> {
    return this.repo.count({ where: { read: false } });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.repo.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`Notification "${id}" not found`);
    }
    notification.read = true;
    return this.repo.save(notification);
  }

  async markAllAsRead(): Promise<void> {
    await this.repo.update({ read: false }, { read: true });
  }
}
