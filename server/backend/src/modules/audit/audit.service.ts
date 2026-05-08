import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: { userId: string; action: string; entityType: string; entityId: string; metadata?: any; ipAddress?: string; userAgent?: string }) {
    return this.prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
      include: { user: { select: { id: true, email: true, nom: true } } },
    });
  }

  async findAll(filters: { userId?: string; entityType?: string; entityId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const { userId, entityType, entityId, startDate, endDate, page = 1, limit = 50 } = filters;
    const where: any = {};

    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: { user: { select: { id: true, email: true, nom: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.activityLog.findMany({
      where: { entityType, entityId },
      include: { user: { select: { id: true, email: true, nom: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
