import { Module } from '@nestjs/common';
import { PerimetersService } from './perimeters.service';
import { PerimetersController } from './perimeters.controller';

@Module({
  controllers: [PerimetersController],
  providers: [PerimetersService],
  exports: [PerimetersService],
})
export class PerimetersModule {}
