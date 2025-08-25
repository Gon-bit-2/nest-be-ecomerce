import { Injectable } from '@nestjs/common'
import roleName from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/service/prisma.service'

@Injectable()
export class RolesService {
  private clientRoleId: number | null = null
  constructor(private readonly prismaService: PrismaService) {}
  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }
    const role = await this.prismaService.role.findFirstOrThrow({
      where: {
        name: roleName.Client,
      },
    })
    this.clientRoleId = role.id
    return role.id
  }
}
