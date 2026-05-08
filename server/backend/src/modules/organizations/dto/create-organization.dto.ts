import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { OrganizationRole } from '@prisma/client';

export class CreateOrganizationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string;
}

export class AddMemberDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ enum: OrganizationRole, default: OrganizationRole.TEAM_MEMBER })
  @IsEnum(OrganizationRole)
  role: OrganizationRole;
}
