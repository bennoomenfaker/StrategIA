import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { PerimeterType } from '@prisma/client';

export class CreatePerimeterDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: PerimeterType })
  @IsEnum(PerimeterType)
  type: PerimeterType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
