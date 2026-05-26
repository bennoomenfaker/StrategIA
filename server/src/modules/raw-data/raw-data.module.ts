import { Module } from '@nestjs/common';
import { RawDataService } from './raw-data.service';
import { RawDataController } from './raw-data.controller';

@Module({
  controllers: [RawDataController],
  providers: [RawDataService],
  exports: [RawDataService],
})
export class RawDataModule {}
