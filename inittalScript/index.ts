import envConfig from 'src/shared/config'
import roleName from 'src/shared/constants/role.constant'
import { HashingService } from 'src/shared/service/hashing.service'
import { PrismaService } from 'src/shared/service/prisma.service'

const prisma = new PrismaService()
const hashingPassword = new HashingService()
const main = async () => {
  const roleCount = await prisma.role.count()
  if (roleCount > 0) {
    throw new Error('Roles Already Exit')
  }
  const roles = await prisma.role.createMany({
    data: [
      {
        name: roleName.Admin,
        description: 'Admin Role',
      },
      {
        name: roleName.Client,
        description: 'Client Role',
      },
      {
        name: roleName.Seller,
        description: 'Seller Role',
      },
    ],
  })

  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: roleName.Admin,
    },
  })
  const adminUser = await prisma.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: await hashingPassword.hash(envConfig.ADMIN_PASSWORD),
      name: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
      roleId: adminRole.id,
    },
  })
  return {
    createRoleCount: roles.count,
    adminUser,
  }
}
main()
  .then(({ adminUser, createRoleCount }) => {
    console.log(`Created ${createRoleCount} roles`)
    console.log(`Created Admin User: ${adminUser.email}`)
  })
  .catch((error) => {
    console.error('Error during initialization:', error)
  })
