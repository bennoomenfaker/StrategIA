import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CollectionEngineService } from './collection-engine.service';

@ApiTags('collection-engine')
@Controller('collection-engine')
export class CollectionEngineController {
  constructor(private engineService: CollectionEngineService) {}

  @Post('trigger/:planId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger collection for a plan' })
  async triggerManual(@Param('planId') planId: string) {
    return this.engineService.triggerCollection(planId);
  }

  @Post('trigger-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger all active plans' })
  async triggerAll() {
    // Will be picked up by the cron job
    return { message: 'All active plans will be checked shortly' };
  }
}
