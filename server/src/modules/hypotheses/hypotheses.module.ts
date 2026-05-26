import { Module } from '@nestjs/common';
import { HypothesesService } from './hypotheses.service';
import { HypothesesController } from './hypotheses.controller';

@Module({
  controllers: [HypothesesController],
  providers: [HypothesesService],
  exports: [HypothesesService],
})
export class HypothesesModule {}
