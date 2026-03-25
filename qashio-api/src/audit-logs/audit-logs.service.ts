import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditEntityType } from './audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async create(data: {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    payload?: Record<string, unknown>;
  }): Promise<AuditLog> {
    return this.repo.save(this.repo.create(data));
  }

  async findAll(query: { entityType?: string; entityId?: string; page?: number; limit?: number }) {
    const { entityType, entityId, page = 1, limit = 20 } = query;

    const qb = this.repo.createQueryBuilder('log').orderBy('log.createdAt', 'DESC');

    if (entityType) {
      qb.andWhere('log.entityType = :entityType', { entityType });
    }
    if (entityId) {
      qb.andWhere('log.entityId = :entityId', { entityId });
    }

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
