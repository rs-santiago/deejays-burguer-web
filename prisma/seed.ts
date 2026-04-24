import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const products = [
    {
      name: 'Double Beat',
      description: 'Dois hambúrgueres bovinos, queijo derretido, bacon crocante, cebola e tomate no pão com gergelim.',
      price: 38.00,
      image: '/img/double-beat.jpg',
      category: 'burger'
    },
    {
      name: 'Double Beat Mirim',
      description: 'A versão compacta do nosso campeão, com milho e todo o sabor do original.',
      price: 28.00,
      image: '/img/double-beat-mirim.jpg',
      category: 'burger'
    },
    {
      name: 'Errejota',
      description: 'Hot dog gourmet completo com batata palha, molho especial e a atitude carioca.',
      price: 22.00,
      image: '/img/errejota.jpg',
      category: 'hotdog'
    }
  ]

  console.log('🌱 Start seeding...')
  
  for (const p of products) {
    await prisma.product.upsert({
      where: { name: p.name }, // Adicione @unique no campo 'name' no seu schema.prisma se quiser usar upsert
      update: {},
      create: p,
    })
  }

  console.log('✅ Seed finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })