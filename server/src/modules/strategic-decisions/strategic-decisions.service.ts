import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateStrategicDecisionDto } from './dto/create-strategic-decision.dto';
import { UpdateStrategicDecisionDto } from './dto/update-strategic-decision.dto';

@Injectable()
export class StrategicDecisionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStrategicDecisionDto) {
    return this.prisma.strategicDecision.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        options: dto.options as Prisma.InputJsonValue,
        tags: dto.tags || [],
        createdBy: dto.createdBy,
        ...(dto.recommendationIds?.length
          ? {
              recommendations: {
                connect: dto.recommendationIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: { project: true, recommendations: true },
    });
  }

  async findByProject(projectId: string) {
    return this.prisma.strategicDecision.findMany({
      where: { projectId },
      include: { recommendations: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const decision = await this.prisma.strategicDecision.findUnique({
      where: { id },
      include: { project: true, recommendations: true },
    });
    if (!decision) throw new NotFoundException('Strategic decision not found');
    return decision;
  }

  async update(id: string, dto: UpdateStrategicDecisionDto) {
    await this.findOne(id);
    const { decisionDate, reviewDate, options, ...rest } = dto;
    return this.prisma.strategicDecision.update({
      where: { id },
      data: {
        ...rest,
        options: options as Prisma.InputJsonValue | undefined,
        decisionDate: decisionDate ? new Date(decisionDate) : undefined,
        reviewDate: reviewDate ? new Date(reviewDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.strategicDecision.delete({ where: { id } });
  }
}
