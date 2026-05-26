import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';
import { InsightType } from '@prisma/client';

export class CreateInsightDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: InsightType, default: InsightType.INFORMATION })
  @IsOptional()
  @IsEnum(InsightType)
  type?: InsightType;

  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hypothesisId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceItemId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  confidence?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  impactScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  urgencyScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdBy?: string;
}
