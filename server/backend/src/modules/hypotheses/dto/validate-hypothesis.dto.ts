import { IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { HypothesisStatus } from '../../../common/enums/hypothesis-status.enum';

export class ValidateHypothesisDto {
  @IsEnum(HypothesisStatus)
  @IsNotEmpty()
  status: HypothesisStatus;

  @IsNumber()
  @IsOptional()
  validationScore?: number;
}
