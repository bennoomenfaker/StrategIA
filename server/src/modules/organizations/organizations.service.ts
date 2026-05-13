import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddMemberDto } from './dto/create-organization.dto';
import { OrganizationRole, MemberStatus } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateOrganizationDto) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    return this.prisma.organization.create({
      data: {
        name: dto.name,
        slug,
        ownerId,
        logo: dto.logo,
        website: dto.website,
      },
      include: { owner: true, members: { include: { user: true } } },
    });
  }

  async findAll() {
    return this.prisma.organization.findMany({
      include: { owner: true, members: { include: { user: true } } },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { owner: true, members: { include: { user: true } } },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id);
    return this.prisma.organization.update({
      where: { id },
      data: dto,
      include: { owner: true, members: { include: { user: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.organization.delete({ where: { id } });
  }

  async addMember(orgId: string, dto: AddMemberDto) {
    await this.findOne(orgId);
    return this.prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId: dto.userId,
        role: dto.role,
        status: MemberStatus.ACTIVE,
      },
      include: { user: true },
    });
  }

  async removeMember(orgId: string, userId: string) {
    return this.prisma.organizationMember.delete({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });
  }
}
