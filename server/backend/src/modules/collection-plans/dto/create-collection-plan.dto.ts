import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Frequency } from '@prisma/client';

export class CreateCollectionPlanDto {
  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty({ enum: Frequency, default: Frequency.DAILY })
  @IsOptional()
  @IsEnum(Frequency)
  frequency?: Frequency;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cronExpression?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  collectionStartDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  collectionEndDate?: string;

  @ApiProperty()
  @IsString()
  hypothesisId: string;
}

export class AddSourceDto {
  @ApiProperty({ enum: ['RSS', 'WEB', 'API', 'PDF'] })
  @IsEnum(['RSS', 'WEB', 'API', 'PDF'])
  sourceType: string;

  @ApiProperty()
  @IsString()
  sourceLabel: string;

  @ApiProperty()
  @IsString()
  sourceUrl: string;
}

export class AddKeywordDto {
  @ApiProperty()
  @IsString()
  keyword: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  keywordType?: string;
}
