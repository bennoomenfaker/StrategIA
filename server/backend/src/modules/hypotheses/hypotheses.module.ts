import { Module } from '@nestjs/common';
import { HypothesesService } from './hypotheses.service';
import { HypothesesController } from './hypotheses.controller';
import { HypothesisRepository } from './repositories/hypothesis.repository';

@Module({
  controllers: [HypothesesController],
  providers: [HypothesesService, HypothesisRepository],
  exports: [HypothesesService],
})
export class HypothesesModule {}
