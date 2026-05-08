import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsEnum, IsOptional } from 'class-validator';
import { HypothesisStatus } from '@prisma/client';

export class CreateHypothesisDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;

  @ApiProperty({ enum: HypothesisStatus, default: HypothesisStatus.OPEN })
  @IsOptional()
  @IsEnum(HypothesisStatus)
  status?: HypothesisStatus;

  @ApiProperty()
  @IsString()
  axisId: string;
}
