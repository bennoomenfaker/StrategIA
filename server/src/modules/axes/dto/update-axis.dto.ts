import { PartialType } from '@nestjs/swagger';
import { CreateAxisDto } from './create-axis.dto';

export class UpdateAxisDto extends PartialType(CreateAxisDto) {}
