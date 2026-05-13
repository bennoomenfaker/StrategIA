import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const projectId = request.params.id || request.params.projectId || request.body.projectId;

    if (!projectId) {
      return true;
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          include: {
            members: {
              where: { userId: user.id },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.deletedAt) {
      throw new NotFoundException('Project has been deleted');
    }

    const isOwner = project.ownerUserId === user.id;
    const isOrgMember = project.organization?.members && project.organization.members.length > 0;

    if (!isOwner && !isOrgMember) {
      throw new ForbiddenException('Access denied to this project');
    }

    request.project = project;
    return true;
  }
}
