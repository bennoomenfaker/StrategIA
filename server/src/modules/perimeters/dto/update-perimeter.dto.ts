import { PartialType } from '@nestjs/swagger';
import { CreatePerimeterDto } from './create-perimeter.dto';

export class UpdatePerimeterDto extends PartialType(CreatePerimeterDto) {}
