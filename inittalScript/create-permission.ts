// Source - https://stackoverflow.com/a/63333671
// Posted by oviniciusfeitosa, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-16, License - CC BY-SA 4.0

import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { PrismaService } from 'src/shared/service/prisma.service'
import { HTTPMethod } from 'src/shared/constants/role.constant'
const prisma = new PrismaService()
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
  const server = app.getHttpAdapter().getInstance()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const router = server.router
  const permissionInDb = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const availableRoutes: { path: string; method: keyof typeof HTTPMethod; name: string }[] = router.stack
    .map((layer) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const path = layer.route?.path
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const method = layer.route?.stack[0].method.toUpperCase() as keyof typeof HTTPMethod
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (layer.route) {
        return {
          path,
          method,
          name: `${method} ${path}`,
        }
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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

  process.exit(0)
}
bootstrap()
