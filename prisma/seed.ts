import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // 1. Limpar o banco para evitar duplicados (opcional, mas recomendado no dev)
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // 2. Criar as Categorias primeiro
  // Usamos create para cada uma para pegarmos o objeto retornado com o ID
  const burgerCat = await prisma.category.create({
    data: { name: 'Burguers', slug: 'burger' }
  })

  const hotdogCat = await prisma.category.create({
    data: { name: 'Hot Dogs', slug: 'hotdog' }
  })

  // 3. Criar os Produtos usando o ID das categorias criadas acima
  const products = [
    {
      name: 'Double Beat',
      description: 'Dois hambúrgueres bovinos, queijo derretido, bacon crocante, cebola e tomate no pão com gergelim.',
      price: 38.00,
      image: '/img/double-beat.jpg',
      categoryId: burgerCat.id // Relacionando com o ID real
    },
    {
      name: 'Double Beat Mirim',
      description: 'A versão compacta do nosso campeão, com milho e todo o sabor do original.',
      price: 28.00,
      image: '/img/double-beat-mirim.jpg',
      categoryId: burgerCat.id
    },
    {
      name: 'Errejota',
      description: 'Hot dog gourmet completo com batata palha, molho especial e a atitude carioca.',
      price: 22.00,
      image: '/img/errejota.jpg',
      categoryId: hotdogCat.id
    }
  ]

  // 4. Inserir os produtos
  for (const p of products) {
    await prisma.product.create({
      data: p
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