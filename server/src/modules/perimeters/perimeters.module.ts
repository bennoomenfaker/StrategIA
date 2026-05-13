import { Module } from '@nestjs/common';
import { PerimetersService } from './perimeters.service';
import { PerimetersController } from './perimeters.controller';
import { PerimeterRepository } from './repositories/perimeter.repository';

@Module({
  controllers: [PerimetersController],
  providers: [PerimetersService, PerimeterRepository],
  exports: [PerimetersService],
})
export class PerimetersModule {}
