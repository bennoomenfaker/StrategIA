import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';

@Injectable()
export class SignalsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSignalDto) {
    return this.prisma.signal.create({
      data: {
        title: dto.title,
        description: dto.description,
        strength: dto.strength,
        projectId: dto.projectId,
        hypothesisId: dto.hypothesisId,
        sourceItemId: dto.sourceItemId,
        category: dto.category,
        sourceUrl: dto.sourceUrl,
        tags: dto.tags || [],
        createdBy: dto.createdBy,
      },
      include: { project: true, hypothesis: true },
    });
  }

  async findByProject(projectId: string) {
    return this.prisma.signal.findMany({
      where: { projectId },
      include: { hypothesis: true },
      orderBy: [{ strength: 'desc' }, { firstDetected: 'desc' }],
    });
  }

  async findOne(id: string) {
    const signal = await this.prisma.signal.findUnique({
      where: { id },
      include: { project: true, hypothesis: true },
    });
    if (!signal) throw new NotFoundException('Signal not found');
    return signal;
  }

  async update(id: string, dto: UpdateSignalDto) {
    await this.findOne(id);
    return this.prisma.signal.update({
      where: { id },
      data: {
        ...dto,
        lastDetected: new Date(),
        ...(dto.strength ? { detectionCount: { increment: 1 } } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.signal.delete({ where: { id } });
  }
}
