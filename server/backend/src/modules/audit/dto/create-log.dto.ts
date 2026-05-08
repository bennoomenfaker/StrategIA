import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateLogDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsNotEmpty()
  entityType: string;

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  ipAddress?: string;

  @IsOptional()
  userAgent?: string;
}
