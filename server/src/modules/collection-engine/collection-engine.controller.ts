import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CollectionEngineService } from './collection-engine.service';

@ApiTags('collection-engine')
@Controller('collection-engine')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CollectionEngineController {
  constructor(private engineService: CollectionEngineService) {}

  @Post('trigger/:planId')
  @ApiOperation({ summary: 'Trigger collection for a plan (background)' })
  async triggerManual(@Param('planId') planId: string) {
    return this.engineService.triggerCollection(planId, false);
  }

  @Post('run/:planId')
  @ApiOperation({ summary: 'Run collection synchronously' })
  async runNow(@Param('planId') planId: string) {
    return this.engineService.triggerCollection(planId, true);
  }

  @Post('trigger-all')
  @ApiOperation({ summary: 'Trigger all active plans' })
  async triggerAll() {
    return { message: 'All active plans will be checked shortly' };
  }
}
