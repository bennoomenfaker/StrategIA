import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsObject } from 'class-validator';
import { AISuggestionType } from '@prisma/client';

export class SaveSuggestionDto {
  @ApiProperty({ enum: AISuggestionType })
  @IsEnum(AISuggestionType)
  type: AISuggestionType;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isGenerated?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}
