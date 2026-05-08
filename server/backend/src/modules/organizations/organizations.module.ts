import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { OrganizationRepository } from './repositories/organization.repository';
import { MemberRepository } from './repositories/member.repository';

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrganizationRepository, MemberRepository],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
