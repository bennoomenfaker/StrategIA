import { PartialType } from '@nestjs/swagger';
import { CreateHypothesisDto } from './create-hypothesis.dto';

export class UpdateHypothesisDto extends PartialType(CreateHypothesisDto) {}
