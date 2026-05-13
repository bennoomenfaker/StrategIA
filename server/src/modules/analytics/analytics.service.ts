import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getStats(organizationId?: string) {
    const projectWhere = organizationId ? { organizationId } : {};

    const [
      totalProjects,
      totalObjectives,
      totalAxes,
      totalHypotheses,
      activeCollectionPlans,
      totalRawItems,
      rawItemsByMonth,
      topSources,
      jobsStats,
    ] = await Promise.all([
      this.prisma.project.count({ where: { ...projectWhere, deletedAt: null } }),
      this.prisma.objective.count({ where: { project: projectWhere } }),
      this.prisma.axis.count({ where: { objective: { project: projectWhere } } }),
      this.prisma.hypothesis.count({ where: { axis: { objective: { project: projectWhere } } } }),
      this.prisma.collectionPlan.count({ where: { isActive: true, hypothesis: { axis: { objective: { project: projectWhere } } } } }),
      this.prisma.rawItem.count({ where: { project: projectWhere } }),
      this.getRawItemsByMonth(projectWhere),
      this.getTopSources(projectWhere),
      this.getJobsStats(projectWhere),
    ]);

    return {
      totalProjects,
      totalObjectives,
      totalAxes,
      totalHypotheses,
      activeCollectionPlans,
      totalRawItems,
      rawItemsByMonth,
      topSources,
      jobsStats,
    };
  }

  private async getRawItemsByMonth(projectWhere: any) {
    const items = await this.prisma.rawItem.findMany({
      where: { project: projectWhere },
      select: { fetchedAt: true },
      orderBy: { fetchedAt: 'asc' },
    });

    const monthMap: Record<string, number> = {};
    for (const item of items) {
      const key = item.fetchedAt.toISOString().slice(0, 7);
      monthMap[key] = (monthMap[key] || 0) + 1;
    }

    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }

  private async getTopSources(projectWhere: any) {
    const sources = await this.prisma.rawItem.groupBy({
      by: ['sourceType'],
      where: { project: projectWhere },
      _count: { sourceType: true },
    });

    const total = sources.reduce((sum, s) => sum + s._count.sourceType, 0) || 1;

    return sources.map((s) => ({
      name: s.sourceType,
      value: Math.round((s._count.sourceType / total) * 100),
      count: s._count.sourceType,
    }));
  }

  private async getJobsStats(projectWhere: any) {
    const jobs = await this.prisma.collectionJob.findMany({
      where: { collectionPlan: { hypothesis: { axis: { objective: { project: projectWhere } } } } },
      select: { status: true },
    });

    const total = jobs.length;
    const succeeded = jobs.filter((j) => j.status === 'COMPLETED').length;
    const failed = jobs.filter((j) => j.status === 'FAILED').length;

    return {
      total,
      succeeded,
      failed,
      successRate: total > 0 ? Math.round((succeeded / total) * 100) : 0,
    };
  }
}
