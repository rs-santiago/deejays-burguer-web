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
      description: '2 Carnes, alface, tomate, cheddar, cebola, bacon, picles e molho especial.',
      price: 25.00,
      image: '/img/double-beat.jpg',
      categoryId: burgerCat.id // Relacionando com o ID real
    },
    {
      name: 'Beat Mirim',
      description: '1 Carne, alface, tomate, queijo, ketchup, mostarda e maionese.',
      price: 12.00,
      image: '/img/beat-mirim.jpeg',
      categoryId: burgerCat.id,
    },
    {
      name: 'Furacão 2000',
      description: '1 Carne, alface, tomate, milho, ovo, cheddar, cebola, bacon e molho especial.',
      price: 22.00,
      image: '/img/furacao-2000.jpeg',
      categoryId: burgerCat.id
    },
    {
      name: 'Big Fild',
      description: '3 Carnes, cheddar e bacon.',
      price: 27.00,
      image: '/img/big-fild.jpeg',
      categoryId: burgerCat.id
    },
    {
      name: 'Big Monster',
      description: '4 Carnes, cheddar e bacon, alface, tomate e molho billy jack.',
      price: 37.00,
      image: '/img/big-monster.jpeg',
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