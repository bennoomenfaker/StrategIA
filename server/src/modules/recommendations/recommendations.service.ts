import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRecommendationDto) {
    return this.prisma.recommendation.create({
      data: {
        title: dto.title,
        content: dto.content,
        priority: dto.priority,
        insightId: dto.insightId,
        projectId: dto.projectId,
        expectedImpact: dto.expectedImpact,
        resourcesNeeded: dto.resourcesNeeded,
        risks: dto.risks,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        tags: dto.tags || [],
        createdBy: dto.createdBy,
      },
      include: { insight: true, project: true },
    });
  }

  async findByProject(projectId: string) {
    return this.prisma.recommendation.findMany({
      where: { projectId },
      include: { insight: true, decision: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByInsight(insightId: string) {
    return this.prisma.recommendation.findMany({
      where: { insightId },
      include: { decision: true },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id },
      include: { insight: true, project: true, decision: true },
    });
    if (!recommendation) throw new NotFoundException('Recommendation not found');
    return recommendation;
  }

  async update(id: string, dto: UpdateRecommendationDto) {
    await this.findOne(id);
    return this.prisma.recommendation.update({
      where: { id },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.recommendation.delete({ where: { id } });
  }
}
