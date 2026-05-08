import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectRepository } from './repositories/project.repository';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectRepository],
  exports: [ProjectsService],
})
export class ProjectsModule {}
