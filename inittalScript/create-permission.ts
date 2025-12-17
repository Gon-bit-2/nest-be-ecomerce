/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// Source - https://stackoverflow.com/a/63333671
// Posted by oviniciusfeitosa, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-16, License - CC BY-SA 4.0

import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { PrismaService } from 'src/shared/service/prisma.service'
import roleName, { HTTPMethod } from 'src/shared/constants/role.constant'
const prisma = new PrismaService()
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
  const server = app.getHttpAdapter().getInstance()

  const router = server.router
  const permissionInDb = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
  })
  const availableRoutes: { path: string; method: keyof typeof HTTPMethod; name: string; module: string }[] =
    router.stack
      .map((layer) => {
        if (layer.route) {
          const path = layer.route.path
          const method = layer.route.stack[0].method.toUpperCase() as keyof typeof HTTPMethod
          const moduleName = path.split('/')[1]
          return {
            path,
            method,
            name: `${method} ${path}`,
            module: moduleName,
          }
        }
      })

      .filter((item) => item !== undefined)
  console.log(availableRoutes)

  //tạo obj permissionInDbMap với key là [method-path]
  const permissionInDbMap: Record<string, (typeof permissionInDb)[0]> = permissionInDb.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item
    return acc
  }, {})
  //tạo obj availableRoutesMap với key là [method-path]
  const availableRoutesMap: Record<string, (typeof availableRoutes)[0]> = availableRoutes.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item
    return acc
  }, {})

  //tìm permissionInDbMap không có trong availableRoutesMap
  const permissionToDelete = permissionInDb.filter((item) => !availableRoutesMap[`${item.method}-${item.path}`])

  //xóa permission không tồn tại trong availableRoutes
  if (permissionToDelete.length > 0) {
    const deleteResult = await prisma.permission.deleteMany({
      where: {
        id: {
          in: permissionToDelete.map((item) => item.id),
        },
      },
    })
    console.log('Deleted permission count:', deleteResult.count)
  } else {
    console.log('No permission to delete')
  }

  //tìm ruotes mà không tồn tại trong permissionInDb
  const permissionToCreate = availableRoutes.filter((item) => !permissionInDbMap[`${item.method}-${item.path}`])

  //thêm các route vào permission db
  if (permissionToCreate.length > 0) {
    const createResult = await prisma.permission.createMany({
      data: permissionToCreate,
      skipDuplicates: true,
    })
    console.log('Created permission count:', createResult.count)
  } else {
    console.log('No permission to create')
  }
  // lấy lại permission trong database
  const updatedPermissionInDb = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
  })

  //cập nhập permission trong admin role
  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: roleName.Admin,
      deletedAt: null,
    },
  })
  await prisma.role.update({
    where: {
      id: adminRole.id,
    },
    data: {
      permissions: {
        set: updatedPermissionInDb.map((item) => ({
          id: item.id,
        })),
      },
    },
  })
  process.exit(0)
}
bootstrap()
