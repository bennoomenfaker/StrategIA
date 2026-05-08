import { IsNotEmpty, IsString } from 'class-validator';

export class AssignPerimeterDto {
  @IsString()
  @IsNotEmpty()
  perimeterId: string;

  @IsString()
  @IsNotEmpty()
  hypothesisId: string;
}
