import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePerimeterDto } from './dto/create-perimeter.dto';
import { UpdatePerimeterDto } from './dto/update-perimeter.dto';
import { PerimeterType } from '@prisma/client';

@Injectable()
export class PerimetersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePerimeterDto) {
    const data: any = {
      name: dto.name,
      type: dto.type,
    };
    
    if (dto.projectId) {
      data.projectId = dto.projectId;
    }
    
    if (dto.parentId) {
      data.parentId = dto.parentId;
    }
    
    if (dto.description) {
      data.description = dto.description;
    }
    
    return this.prisma.perimeter.create({
      data,
      include: { parent: true, children: true, project: true },
    });
  }

  async findAll(projectId?: string) {
    return this.prisma.perimeter.findMany({
      where: projectId ? { projectId } : {},
      include: { parent: true, children: true, project: true },
    });
  }

  async findOne(id: string) {
    const perim = await this.prisma.perimeter.findUnique({
      where: { id },
      include: { parent: true, children: true, project: true, hypothesisLinks: { include: { hypothesis: true } } },
    });
    if (!perim) throw new NotFoundException('Perimeter not found');
    return perim;
  }

  async update(id: string, dto: UpdatePerimeterDto) {
    await this.findOne(id);
    return this.prisma.perimeter.update({
      where: { id },
      data: dto,
      include: { parent: true, children: true, project: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.perimeter.delete({ where: { id } });
  }

  async getTree(projectId: string) {
    return this.prisma.perimeter.findMany({
      where: { projectId, parentId: null },
      include: { children: { include: { children: true } } },
    });
  }
}
