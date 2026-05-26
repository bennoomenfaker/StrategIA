import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { StrategicDecisionsService } from './strategic-decisions.service';
import { CreateStrategicDecisionDto } from './dto/create-strategic-decision.dto';
import { UpdateStrategicDecisionDto } from './dto/update-strategic-decision.dto';

@ApiTags('strategic-decisions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('strategic-decisions')
export class StrategicDecisionsController {
  constructor(private readonly decisionsService: StrategicDecisionsService) {}

  @Post()
  @ApiOperation({ summary: 'Record a strategic decision based on recommendations' })
  create(@Body() dto: CreateStrategicDecisionDto) {
    return this.decisionsService.create(dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all decisions for a project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.decisionsService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get decision by id' })
  findOne(@Param('id') id: string) {
    return this.decisionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update decision status or outcome' })
  update(@Param('id') id: string, @Body() dto: UpdateStrategicDecisionDto) {
    return this.decisionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete decision' })
  remove(@Param('id') id: string) {
    return this.decisionsService.remove(id);
  }
}
