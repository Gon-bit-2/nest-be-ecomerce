import { PrismaService } from 'src/shared/service/prisma.service'

const prisma = new PrismaService()
const addBrands = async () => {
  const brands = Array(10000)
    .fill(0)
    .map((_, index) => {
      return {
        logo: `logo ${index}`,
      }
    })
  try {
    const { count } = await prisma.brand.createMany({
      data: brands,
    })
    console.log(`added ${count} brands`)
  } catch (error) {
    console.log(error)
  }
}
addBrands()
