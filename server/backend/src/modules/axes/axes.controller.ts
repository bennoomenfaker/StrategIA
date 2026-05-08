import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AxesService } from './axes.service';
import { CreateAxisDto } from './dto/create-axis.dto';
import { UpdateAxisDto } from './dto/update-axis.dto';

@ApiTags('axes')
@Controller('axes')
export class AxesController {
  constructor(private service: AxesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create axis' })
  async create(@Body() dto: CreateAxisDto) { return this.service.create(dto); }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List axes' })
  async findAll(@Query('objectiveId') objectiveId?: string) { return this.service.findAll(objectiveId); }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get axis' })
  async findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update axis' })
  async update(@Param('id') id: string, @Body() dto: UpdateAxisDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete axis' })
  async remove(@Param('id') id: string) { return this.service.remove(id); }
}
