import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FilterRawDataDto } from './dto/filter-raw-data.dto';

@Injectable()
export class RawDataService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: FilterRawDataDto) {
    const {
      projectId,
      collectionPlanId,
      sourceType,
      keyword,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;

    // Convert limit to number if it's a string
    const limitNum = typeof limit === 'string' ? parseInt(limit as string, 10) : limit;

    const where: any = {
      isDuplicate: false,
    };

    if (projectId) where.projectId = projectId;
    if (collectionPlanId) where.collectionPlanId = collectionPlanId;
    if (sourceType) where.sourceType = sourceType;
    
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { contentCleaned: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    
    if (startDate || endDate) {
      where.publishedAt = {};
      if (startDate) where.publishedAt.gte = new Date(startDate);
      if (endDate) where.publishedAt.lte = new Date(endDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.rawItem.findMany({
        where,
        include: { project: true, collectionPlan: true },
        orderBy: { fetchedAt: 'desc' },
        skip: (page - 1) * limitNum,
        take: limitNum,
      }),
      this.prisma.rawItem.count({ where }),
    ]);

    return { items, total, page, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
  }

  async findOne(id: string) {
    const item = await this.prisma.rawItem.findUnique({
      where: { id },
      include: { project: true, collectionPlan: true },
    });
    if (!item) throw new NotFoundException('Raw item not found');
    return item;
  }

  async getStats(projectId: string) {
    const [total, bySourceType, recentCount] = await Promise.all([
      this.prisma.rawItem.count({ where: { projectId } }),
      this.prisma.rawItem.groupBy({
        by: ['sourceType'],
        where: { projectId },
        _count: { sourceType: true },
      }),
      this.prisma.rawItem.count({
        where: {
          projectId,
          fetchedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      total,
      bySourceType: bySourceType.map((item) => ({
        sourceType: item.sourceType,
        count: item._count.sourceType,
      })),
      recentCount,
    };
  }
}
