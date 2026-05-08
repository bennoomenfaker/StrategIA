import { IsNotEmpty, IsEnum } from 'class-validator';
import { OrganizationRole } from '../../../common/enums/organization-role.enum';

export class UpdateMemberRoleDto {
  @IsEnum(OrganizationRole)
  @IsNotEmpty()
  role: OrganizationRole;
}
