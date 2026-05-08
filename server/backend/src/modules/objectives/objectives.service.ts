import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';

@Injectable()
export class ObjectivesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateObjectiveDto) {
    return this.prisma.objective.create({
      data: {
        content: dto.content,
        priority: dto.priority || 1,
        projectId: dto.projectId,
      },
      include: { project: true, axes: true },
    });
  }

  async findAll(projectId?: string) {
    return this.prisma.objective.findMany({
      where: projectId ? { projectId } : {},
      include: { project: true, axes: true },
      orderBy: { priority: 'asc' },
    });
  }

  async findOne(id: string) {
    const obj = await this.prisma.objective.findUnique({
      where: { id },
      include: { project: true, axes: true },
    });
    if (!obj) throw new NotFoundException('Objective not found');
    return obj;
  }

  async update(id: string, dto: UpdateObjectiveDto) {
    await this.findOne(id);
    return this.prisma.objective.update({
      where: { id },
      data: dto,
      include: { project: true, axes: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.objective.delete({ where: { id } });
  }
}
