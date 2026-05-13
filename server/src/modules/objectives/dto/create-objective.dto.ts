import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateObjectiveDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;

  @ApiProperty()
  @IsString()
  projectId: string;
}
