import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { HypothesesService } from './hypotheses.service';
import { CreateHypothesisDto } from './dto/create-hypothesis.dto';
import { UpdateHypothesisDto } from './dto/update-hypothesis.dto';

@ApiTags('hypotheses')
@Controller('hypotheses')
export class HypothesesController {
  constructor(private service: HypothesesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create hypothesis' })
  async create(@Body() dto: CreateHypothesisDto) { return this.service.create(dto); }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List hypotheses' })
  async findAll(@Query('axisId') axisId?: string) { return this.service.findAll(axisId); }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get hypothesis' })
  async findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hypothesis' })
  async update(@Param('id') id: string, @Body() dto: UpdateHypothesisDto) { return this.service.update(id, dto); }

  @Patch(':id/validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate hypothesis' })
  async validate(@Param('id') id: string, @Body('validatedBy') validatedBy: string) { return this.service.validate(id, validatedBy); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete hypothesis' })
  async remove(@Param('id') id: string) { return this.service.remove(id); }
}
