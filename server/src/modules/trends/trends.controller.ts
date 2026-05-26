import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TrendsService } from './trends.service';
import { CreateTrendDto } from './dto/create-trend.dto';
import { UpdateTrendDto } from './dto/update-trend.dto';

@ApiTags('trends')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trends')
export class TrendsController {
  constructor(private readonly trendsService: TrendsService) {}

  @Post()
  @ApiOperation({ summary: 'Identify a trend from signals and data' })
  create(@Body() dto: CreateTrendDto) {
    return this.trendsService.create(dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all trends for a project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.trendsService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trend by id' })
  findOne(@Param('id') id: string) {
    return this.trendsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trend momentum or direction' })
  update(@Param('id') id: string, @Body() dto: UpdateTrendDto) {
    return this.trendsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete trend' })
  remove(@Param('id') id: string) {
    return this.trendsService.remove(id);
  }
}
