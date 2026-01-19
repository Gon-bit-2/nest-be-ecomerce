import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { UserService } from './user.service'
import {
  CreateUserBodyDTO,
  CreateUserResDTO,
  GetUsersQueryDTO,
  GetUsersResDTO,
  UpdateUserBodyDTO,
  UpdateUserResDTO,
} from './dto/user.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { GetUserProfileResDTO } from 'src/shared/dtos/share-user.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ActiveRolePermission } from 'src/shared/decorators/active-role-permisstion.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ApiBearerAuth } from '@nestjs/swagger'

@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @ZodSerializerDto(GetUsersResDTO)
  async list(@Query() pagination: GetUsersQueryDTO) {
    return this.userService.list({
      page: pagination.page,
      limit: pagination.limit,
    })
  }
  @Get(':id')
  @ZodSerializerDto(GetUserProfileResDTO)
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id)
  }
  @Post()
  @ZodSerializerDto(CreateUserResDTO)
  async create(
    @Body() body: CreateUserBodyDTO,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermission('name') roleName: string,
  ) {
    return this.userService.create({
      data: body,
      createdById: userId,
      createdByRoleName: roleName,
    })
  }
  @Put(':id')
  @ZodSerializerDto(UpdateUserResDTO)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserBodyDTO,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermission('name') roleName: string,
  ) {
    return this.userService.update({
      id,
      data,
      updatedById: userId,
      updateByRoleName: roleName,
    })
  }
  @Delete(':id')
  @ZodSerializerDto(MessageResDTO)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermission('name') roleName: string,
  ) {
    return this.userService.delete({
      userId: id,
      deletedById: userId,
      deletedByRoleName: roleName,
    })
  }
}
