import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async getActivities(filters: {
    projectId?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { projectId, entityType, startDate, endDate, page = 1, limit = 20 } = filters;
    const where: any = {};

    if (projectId) {
      where.OR = [
        { entityType: 'project', entityId: projectId },
      ];
    }
    if (entityType) where.entityType = entityType;
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

    return { items: logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getRecentRawItems(filters: {
    projectId?: string;
    limit?: number;
  }) {
    const { projectId, limit = 30 } = filters;
    const where: any = { isDuplicate: false };
    if (projectId) where.projectId = projectId;

    const items = await this.prisma.rawItem.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        collectionPlan: { select: { id: true, question: true } },
      },
      orderBy: { fetchedAt: 'desc' },
      take: limit,
    });

    return { items, total: items.length };
  }
}
