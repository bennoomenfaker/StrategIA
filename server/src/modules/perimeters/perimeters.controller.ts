import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PerimetersService } from './perimeters.service';
import { CreatePerimeterDto } from './dto/create-perimeter.dto';
import { UpdatePerimeterDto } from './dto/update-perimeter.dto';

@ApiTags('perimeters')
@Controller('perimeters')
export class PerimetersController {
  constructor(private service: PerimetersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create perimeter' })
  async create(@Body() dto: CreatePerimeterDto) { return this.service.create(dto); }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List perimeters' })
  async findAll(@Query('projectId') projectId?: string) { return this.service.findAll(projectId); }

  @Get('tree/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get perimeter tree' })
  async getTree(@Param('projectId') projectId: string) { return this.service.getTree(projectId); }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get perimeter' })
  async findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update perimeter' })
  async update(@Param('id') id: string, @Body() dto: UpdatePerimeterDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete perimeter' })
  async remove(@Param('id') id: string) { return this.service.remove(id); }
}
