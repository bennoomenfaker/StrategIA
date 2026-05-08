import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RawItemRepository {
  constructor(private prisma: PrismaService) {}
}
