import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { VeilleType, ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/\s+/g, '-');
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        slug,
        veilleType: dto.veilleType || VeilleType.CUSTOM,
        status: dto.status || ProjectStatus.DRAFT,
        problematic: dto.problematic,
        context: dto.context,
        expectedDecision: dto.expectedDecision,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        organizationId: dto.organizationId,
        ownerUserId: dto.ownerUserId,
      },
      include: { organization: true, ownerUser: true },
    });
  }

  async findAll(organizationId?: string) {
    return this.prisma.project.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { organization: true, ownerUser: true },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        organization: true,
        ownerUser: true,
        objectives: true,
        perimeters: true,
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async findAllWithDetails() {
    const projects = await this.prisma.project.findMany({
      where: { deletedAt: null },
      include: {
        objectives: {
          include: {
            axes: {
              include: {
                hypotheses: true,
              },
            },
          },
        },
        perimeters: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: { organization: true, ownerUser: true },
    });
  }

  async changeStatus(id: string, status: ProjectStatus) {
    await this.findOne(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        status,
        ...(status === ProjectStatus.COMPLETED || status === ProjectStatus.ARCHIVED
          ? { closedAt: new Date() }
          : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
