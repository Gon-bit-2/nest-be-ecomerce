import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common'

export const UserAlreadyExistsException = new UnprocessableEntityException({
  message: 'Error.UserAlreadyExistsException',
  path: 'email',
})

export const CannotUpdateAdminUserException = new ForbiddenException({
  message: 'Error.CannotUpdateAdminUserException',
})

export const CannotDeleteAdminUserException = new ForbiddenException({
  message: 'Error.CannotDeleteAdminUserException',
})

export const CannotSetAdminRoleToUserException = new ForbiddenException({
  message: 'Error.CannotSetAdminRoleToUserException',
})
export const RoleNotFoundException = new UnprocessableEntityException({
  message: 'Error.RoleNotFoundException',
  path: 'roleId',
})
//không thể xóa hoặc update chính mình
export const CannotUpdateOrDeleteYourselfException = new ForbiddenException({
  message: 'Error.CannotUpdateOrDeleteYourselfException',
})
