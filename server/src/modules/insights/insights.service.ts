import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '@/common/dto/pagination.dto';
import { CreateInsightDto } from './dto/create-insight.dto';
import { UpdateInsightDto } from './dto/update-insight.dto';

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInsightDto) {
    return this.prisma.insight.create({
      data: {
        title: dto.title,
        content: dto.content,
        type: dto.type,
        projectId: dto.projectId,
        hypothesisId: dto.hypothesisId,
        sourceItemId: dto.sourceItemId,
        tags: dto.tags || [],
        confidence: dto.confidence,
        impactScore: dto.impactScore,
        urgencyScore: dto.urgencyScore,
        createdBy: dto.createdBy,
      },
      include: {
        project: true,
        hypothesis: true,
      },
    });
  }

  async findByProject(projectId: string, pagination?: PaginationDto): Promise<PaginatedResult<any>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.insight.findMany({
        where: { projectId },
        include: {
          hypothesis: true,
          recommendations: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.insight.count({ where: { projectId } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const insight = await this.prisma.insight.findUnique({
      where: { id },
      include: {
        project: true,
        hypothesis: true,
        recommendations: true,
      },
    });
    if (!insight) throw new NotFoundException('Insight not found');
    return insight;
  }

  async update(id: string, dto: UpdateInsightDto) {
    await this.findOne(id);
    return this.prisma.insight.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.insight.delete({ where: { id } });
  }
}
