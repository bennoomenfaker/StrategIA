import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ObjectivesService } from './objectives.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';

@ApiTags('objectives')
@Controller('objectives')
export class ObjectivesController {
  constructor(private service: ObjectivesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create objective' })
  async create(@Body() dto: CreateObjectiveDto) { return this.service.create(dto); }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List objectives' })
  async findAll(@Query('projectId') projectId?: string) { return this.service.findAll(projectId); }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get objective' })
  async findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update objective' })
  async update(@Param('id') id: string, @Body() dto: UpdateObjectiveDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete objective' })
  async remove(@Param('id') id: string) { return this.service.remove(id); }
}
