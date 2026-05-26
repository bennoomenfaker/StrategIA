import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTrendDto } from './dto/create-trend.dto';
import { UpdateTrendDto } from './dto/update-trend.dto';

@Injectable()
export class TrendsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTrendDto) {
    return this.prisma.trend.create({
      data: {
        name: dto.name,
        description: dto.description,
        direction: dto.direction,
        momentum: dto.momentum,
        projectId: dto.projectId,
        category: dto.category,
        keywords: dto.keywords || [],
        relatedSignals: dto.relatedSignals || [],
        confidence: dto.confidence,
        tags: dto.tags || [],
        createdBy: dto.createdBy,
      },
      include: { project: true },
    });
  }

  async findByProject(projectId: string) {
    return this.prisma.trend.findMany({
      where: { projectId },
      orderBy: [{ momentum: 'desc' }, { lastDetected: 'desc' }],
    });
  }

  async findOne(id: string) {
    const trend = await this.prisma.trend.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!trend) throw new NotFoundException('Trend not found');
    return trend;
  }

  async update(id: string, dto: UpdateTrendDto) {
    await this.findOne(id);
    return this.prisma.trend.update({
      where: { id },
      data: { ...dto, lastDetected: new Date() },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.trend.delete({ where: { id } });
  }
}
