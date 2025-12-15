import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { PermissionService } from './permission.service'
import {
  CreatePermissionBodyDTO,
  GetPermissionDetailResDTO,
  GetPermissionParamsDTO,
  GetPermissionResDTO,
  GetPermissionsQueryDTO,
  UpdatePermissionBodyDTO,
} from './dto/permission.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}
  @Get()
  @ZodSerializerDto(GetPermissionResDTO)
  list(@Query() query: GetPermissionsQueryDTO) {
    return this.permissionService.list({
      page: query.page,
      limit: query.limit,
    })
  }

  @Get(':permissionId')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  findById(@Param() params: GetPermissionParamsDTO) {
    return this.permissionService.findById(params.permissionId)
  }

  @Post()
  @ZodSerializerDto(GetPermissionDetailResDTO)
  create(@Body() body: CreatePermissionBodyDTO, @ActiveUser('userId') userId: number) {
    return this.permissionService.create({
      data: body,
      createdById: userId,
    })
  }

  @Patch(':permissionId')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  update(
    @Param() params: GetPermissionParamsDTO,
    @Body() body: UpdatePermissionBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.permissionService.update({
      id: params.permissionId,
      data: body,
      updatedById: userId,
    })
  }

  @Delete(':permissionId')
  remove(@Param() params: GetPermissionParamsDTO, @ActiveUser('userId') userId: number) {
    return this.permissionService.delete({
      id: params.permissionId,
      deletedById: userId,
    })
  }
}
