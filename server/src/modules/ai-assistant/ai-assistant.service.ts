import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { GenerateSuggestionDto } from './dto/generate-suggestion.dto';
import { SaveSuggestionDto } from './dto/save-suggestion.dto';

@Injectable()
export class AiAssistantService {
  constructor(private prisma: PrismaService) {}

  async generateSuggestions(dto: GenerateSuggestionDto) {
    const snippets = await this.prisma.snippetTemplate.findMany({
      where: {
        type: dto.type,
        isActive: true,
        ...(dto.category ? { category: dto.category } : {}),
      },
      orderBy: { usageCount: 'desc' },
      take: dto.limit || 5,
    });

    return snippets;
  }

  async saveSuggestion(dto: SaveSuggestionDto) {
    const suggestion = await this.prisma.aISuggestion.create({
      data: {
        type: dto.type,
        content: dto.content,
        projectId: dto.projectId,
        context: (dto.context || {}) as Prisma.InputJsonValue,
        isGenerated: dto.isGenerated ?? true,
      },
    });

    if (dto.templateId) {
      await this.prisma.snippetTemplate.update({
        where: { id: dto.templateId },
        data: { usageCount: { increment: 1 } },
      });
    }

    return suggestion;
  }

  async getSnippetsByType(type: string) {
    return this.prisma.snippetTemplate.findMany({
      where: { type: type as any, isActive: true },
      orderBy: { usageCount: 'desc' },
    });
  }

  async getAllSnippets() {
    return this.prisma.snippetTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ type: 'asc' }, { usageCount: 'desc' }],
    });
  }

  async markSuggestionUsed(id: string) {
    const suggestion = await this.prisma.aISuggestion.findUnique({
      where: { id },
    });
    if (!suggestion) throw new NotFoundException('Suggestion not found');

    return this.prisma.aISuggestion.update({
      where: { id },
      data: { isUsed: true },
    });
  }

  async getProjectSuggestions(projectId: string) {
    return this.prisma.aISuggestion.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
