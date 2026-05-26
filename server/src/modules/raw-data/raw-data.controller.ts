import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RawDataService } from './raw-data.service';
import { FilterRawDataDto } from './dto/filter-raw-data.dto';

@ApiTags('raw-data')
@Controller('raw-data')
export class RawDataController {
  constructor(private service: RawDataService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Query collected data' })
  async findAll(@Query() filters: FilterRawDataDto) {
    return this.service.findAll(filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get raw data item' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('stats/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get collection stats' })
  async getStats(@Param('projectId') projectId: string) {
    return this.service.getStats(projectId);
  }
}
