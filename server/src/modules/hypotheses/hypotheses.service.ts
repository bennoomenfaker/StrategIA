import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateHypothesisDto } from './dto/create-hypothesis.dto';
import { UpdateHypothesisDto } from './dto/update-hypothesis.dto';
import { HypothesisStatus } from '@prisma/client';

@Injectable()
export class HypothesesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHypothesisDto) {
    return this.prisma.hypothesis.create({
      data: {
        content: dto.content,
        priority: dto.priority || 1,
        status: dto.status || HypothesisStatus.OPEN,
        axisId: dto.axisId,
      },
      include: { axis: true, perimeters: true, collectionPlans: true },
    });
  }

  async findAll(axisId?: string) {
    return this.prisma.hypothesis.findMany({
      where: axisId ? { axisId } : {},
      include: { axis: true, perimeters: { include: { perimeter: true } }, collectionPlans: true },
      orderBy: { priority: 'asc' },
    });
  }

  async findOne(id: string) {
    const hyp = await this.prisma.hypothesis.findUnique({
      where: { id },
      include: { axis: true, perimeters: { include: { perimeter: true } }, collectionPlans: true },
    });
    if (!hyp) throw new NotFoundException('Hypothesis not found');
    return hyp;
  }

  async update(id: string, dto: UpdateHypothesisDto) {
    await this.findOne(id);
    return this.prisma.hypothesis.update({
      where: { id },
      data: dto,
      include: { axis: true, perimeters: true, collectionPlans: true },
    });
  }

  async validate(id: string, validatedBy: string) {
    return this.prisma.hypothesis.update({
      where: { id },
      data: {
        status: HypothesisStatus.VALIDATED,
        validatedAt: new Date(),
        validatedBy,
      },
      include: { axis: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.hypothesis.delete({ where: { id } });
  }
}
