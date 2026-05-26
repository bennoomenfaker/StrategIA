import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { InsightsService } from './insights.service';
import { CreateInsightDto } from './dto/create-insight.dto';
import { UpdateInsightDto } from './dto/update-insight.dto';

@ApiTags('insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an insight from collected data' })
  create(@Body() dto: CreateInsightDto) {
    return this.insightsService.create(dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all insights for a project' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByProject(@Param('projectId') projectId: string, @Query() pagination: PaginationDto) {
    return this.insightsService.findByProject(projectId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get insight by id' })
  findOne(@Param('id') id: string) {
    return this.insightsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update insight' })
  update(@Param('id') id: string, @Body() dto: UpdateInsightDto) {
    return this.insightsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete insight' })
  remove(@Param('id') id: string) {
    return this.insightsService.remove(id);
  }
}
