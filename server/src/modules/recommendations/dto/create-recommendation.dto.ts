import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsDateString } from 'class-validator';
import { RecommendationPriority } from '@prisma/client';

export class CreateRecommendationDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: RecommendationPriority, default: RecommendationPriority.MEDIUM })
  @IsOptional()
  @IsEnum(RecommendationPriority)
  priority?: RecommendationPriority;

  @ApiProperty()
  @IsString()
  insightId: string;

  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expectedImpact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resourcesNeeded?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  risks?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdBy?: string;
}
