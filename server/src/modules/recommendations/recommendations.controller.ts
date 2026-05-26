import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';

@ApiTags('recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a recommendation from an insight' })
  create(@Body() dto: CreateRecommendationDto) {
    return this.recommendationsService.create(dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all recommendations for a project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.recommendationsService.findByProject(projectId);
  }

  @Get('insight/:insightId')
  @ApiOperation({ summary: 'Get recommendations for an insight' })
  findByInsight(@Param('insightId') insightId: string) {
    return this.recommendationsService.findByInsight(insightId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recommendation by id' })
  findOne(@Param('id') id: string) {
    return this.recommendationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update recommendation' })
  update(@Param('id') id: string, @Body() dto: UpdateRecommendationDto) {
    return this.recommendationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete recommendation' })
  remove(@Param('id') id: string) {
    return this.recommendationsService.remove(id);
  }
}
