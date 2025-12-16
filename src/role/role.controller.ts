import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { RoleService } from './role.service'
import {
  CreateRoleBodyDto,
  GetRoleDetailResDto,
  GetRoleParamsDto,
  GetRoleQueryDto,
  GetRoleResDto,
  UpdateRoleBodyDto,
} from './dto/role.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ZodSerializerDto(GetRoleResDto)
  list(@Query() query: GetRoleQueryDto) {
    return this.roleService.list({
      page: query.page,
      limit: query.limit,
    })
  }

  @Get(':roleId')
  @ZodSerializerDto(GetRoleDetailResDto)
  findById(@Param() param: GetRoleParamsDto) {
    return this.roleService.findById(param.roleId)
  }

  @Post()
  @ZodSerializerDto(GetRoleResDto)
  create(@Body() body: CreateRoleBodyDto, @ActiveUser('userId') userId: number) {
    return this.roleService.create({
      data: body,
      createdById: userId,
    })
  }

  @Patch(':roleId')
  @ZodSerializerDto(GetRoleResDto)
  update(@Body() body: UpdateRoleBodyDto, @Param() param: GetRoleParamsDto, @ActiveUser('userId') userId: number) {
    return this.roleService.update({
      data: body,
      updatedById: userId,
      id: param.roleId,
    })
  }

  @Delete(':roleId')
  delete(@Param() param: GetRoleParamsDto, @ActiveUser('userId') userId: number) {
    return this.roleService.delete({
      id: param.roleId,
      deletedById: userId,
    })
  }
}
