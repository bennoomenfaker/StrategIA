import { Module } from '@nestjs/common';
import { AxesService } from './axes.service';
import { AxesController } from './axes.controller';
import { AxisRepository } from './repositories/axis.repository';

@Module({
  controllers: [AxesController],
  providers: [AxesService, AxisRepository],
  exports: [AxesService],
})
export class AxesModule {}
