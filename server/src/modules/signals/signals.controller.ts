import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { SignalsService } from './signals.service';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';

@ApiTags('signals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post()
  @ApiOperation({ summary: 'Detect a weak signal or early indicator' })
  create(@Body() dto: CreateSignalDto) {
    return this.signalsService.create(dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all signals for a project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.signalsService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get signal by id' })
  findOne(@Param('id') id: string) {
    return this.signalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update signal strength or details' })
  update(@Param('id') id: string, @Body() dto: UpdateSignalDto) {
    return this.signalsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete signal' })
  remove(@Param('id') id: string) {
    return this.signalsService.remove(id);
  }
}
