import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OrganizationRepository {
  constructor(private prisma: PrismaService) {}
}
