import { PartialType } from '@nestjs/swagger';
import { CreateCollectionPlanDto } from './create-collection-plan.dto';

export class UpdateCollectionPlanDto extends PartialType(CreateCollectionPlanDto) {}
