import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import roleName from '../constants/role.constant'
import { RolesGuard } from '../guard/roles.guard'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: string[]) => {
  return applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(RolesGuard))
}

export const IsAdmin = () => Roles(roleName.Admin)
export const IsSeller = () => Roles(roleName.Seller)
export const IsClient = () => Roles(roleName.Client)
