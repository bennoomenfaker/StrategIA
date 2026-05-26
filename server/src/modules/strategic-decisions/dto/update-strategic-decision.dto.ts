import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsObject, IsDateString } from 'class-validator';
import { DecisionStatus } from '@prisma/client';

export class UpdateStrategicDecisionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: DecisionStatus })
  @IsOptional()
  @IsEnum(DecisionStatus)
  status?: DecisionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  selectedOption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rationale?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expectedOutcome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actualOutcome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  decisionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  reviewDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  options?: Record<string, unknown>;
}
