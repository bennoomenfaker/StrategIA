import { PartialType } from '@nestjs/swagger';
import { CreateTrendDto } from './create-trend.dto';

export class UpdateTrendDto extends PartialType(CreateTrendDto) {}
