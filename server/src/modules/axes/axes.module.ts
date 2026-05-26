import { Module } from '@nestjs/common';
import { AxesService } from './axes.service';
import { AxesController } from './axes.controller';

@Module({
  controllers: [AxesController],
  providers: [AxesService],
  exports: [AxesService],
})
export class AxesModule {}
