import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { FeedService } from './feed.service';

@ApiTags('feed')
@Controller('feed')
export class FeedController {
  constructor(private service: FeedService) {}

  @Get('activities')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated activity feed' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getActivities(
    @Query('projectId') projectId?: string,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getActivities({
      projectId,
      entityType,
      startDate,
      endDate,
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @Get('raw-items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent raw items for feed' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getRecentRawItems(
    @Query('projectId') projectId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.service.getRecentRawItems({
      projectId,
      limit: limit ? +limit : undefined,
    });
  }
}
