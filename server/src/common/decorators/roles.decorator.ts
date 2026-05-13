import { SetMetadata } from '@nestjs/common';
import { OrganizationRole } from '../enums/organization-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: OrganizationRole[]) => SetMetadata(ROLES_KEY, roles);
