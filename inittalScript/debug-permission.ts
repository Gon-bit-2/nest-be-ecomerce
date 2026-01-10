import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- ROLES ---')
  const roles = await prisma.role.findMany()
  console.table(roles)

  console.log('\n--- PERMISSIONS FOR PROFILE ---')
  const profilePermissions = await prisma.permission.findMany({
    where: { module: 'PROFILE' },
  })
  console.table(profilePermissions)

  // Check permissions for Role ID 3
  console.log('\n--- PERMISSIONS assigned to ROLE ID 3 ---')
  const role3 = await prisma.role.findUnique({
    where: { id: 3 },
    include: { permissions: true },
  })

  if (role3) {
    console.log(`Role 3 Name: ${role3.name}`)
    console.log(`Permission Count: ${role3.permissions.length}`)
    // List a few to see
    console.table(role3.permissions.filter((p) => p.module === 'PROFILE'))
  } else {
    console.log('Role ID 3 not found')
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
