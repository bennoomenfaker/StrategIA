import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CollectionPlansService } from './collection-plans.service';
import { CreateCollectionPlanDto, AddSourceDto, AddKeywordDto } from './dto/create-collection-plan.dto';
import { UpdateCollectionPlanDto } from './dto/update-collection-plan.dto';

@ApiTags('collection-plans')
@Controller('collection-plans')
export class CollectionPlansController {
  constructor(private service: CollectionPlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create collection plan' })
  async create(@Body() dto: CreateCollectionPlanDto) { return this.service.create(dto); }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List collection plans' })
  async findAll(@Query('hypothesisId') hypothesisId?: string) { return this.service.findAll(hypothesisId); }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get collection plan' })
  async findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update collection plan' })
  async update(@Param('id') id: string, @Body() dto: UpdateCollectionPlanDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete collection plan' })
  async remove(@Param('id') id: string) { return this.service.remove(id); }

  @Post(':id/sources')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add source to plan' })
  async addSource(@Param('id') id: string, @Body() dto: AddSourceDto) { return this.service.addSource(id, dto); }

  @Post(':id/keywords')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add keyword to plan' })
  async addKeyword(@Param('id') id: string, @Body() dto: AddKeywordDto) { return this.service.addKeyword(id, dto); }

  @Get(':id/results')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get collection results' })
  async getResults(@Param('id') id: string) { return this.service.getResults(id); }

  @Get(':id/jobs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get collection jobs' })
  async getJobs(@Param('id') id: string) { return this.service.getJobs(id); }
}
