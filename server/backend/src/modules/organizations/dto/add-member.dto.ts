import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { OrganizationRole } from '../../../common/enums/organization-role.enum';

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(OrganizationRole)
  @IsNotEmpty()
  role: OrganizationRole;
}
