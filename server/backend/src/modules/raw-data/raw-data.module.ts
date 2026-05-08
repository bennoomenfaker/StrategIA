import { Module } from '@nestjs/common';
import { RawDataService } from './raw-data.service';
import { RawDataController } from './raw-data.controller';
import { RawItemRepository } from './repositories/raw-item.repository';

@Module({
  controllers: [RawDataController],
  providers: [RawDataService, RawItemRepository],
  exports: [RawDataService],
})
export class RawDataModule {}
