import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/service/prisma.service'

@Injectable()
export class PaymentRepo {
  constructor(private readonly prismaService: PrismaService) {}
}
