import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class MemberRepository {
  constructor(private prisma: PrismaService) {}
}
