import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { VeilleType } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ enum: VeilleType, default: VeilleType.CUSTOM })
  @IsOptional()
  @IsEnum(VeilleType)
  veilleType?: VeilleType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ownerUserId?: string;
}
