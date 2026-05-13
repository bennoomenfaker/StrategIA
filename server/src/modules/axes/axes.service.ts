import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateAxisDto } from './dto/create-axis.dto';
import { UpdateAxisDto } from './dto/update-axis.dto';

@Injectable()
export class AxesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAxisDto) {
    return this.prisma.axis.create({
      data: {
        name: dto.name,
        description: dto.description,
        priority: dto.priority || 1,
        objectiveId: dto.objectiveId,
      },
      include: { objective: true, hypotheses: true },
    });
  }

  async findAll(objectiveId?: string) {
    return this.prisma.axis.findMany({
      where: objectiveId ? { objectiveId } : {},
      include: { objective: true, hypotheses: true },
      orderBy: { priority: 'asc' },
    });
  }

  async findOne(id: string) {
    const axis = await this.prisma.axis.findUnique({
      where: { id },
      include: { objective: true, hypotheses: true },
    });
    if (!axis) throw new NotFoundException('Axis not found');
    return axis;
  }

  async update(id: string, dto: UpdateAxisDto) {
    await this.findOne(id);
    return this.prisma.axis.update({
      where: { id },
      data: dto,
      include: { objective: true, hypotheses: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.axis.delete({ where: { id } });
  }
}
