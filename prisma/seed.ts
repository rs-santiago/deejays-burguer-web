import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

/**
 * Função auxiliar para gerar horários padrão (18h às 23h)
 * para todos os dias da semana.
 */
async function createDefaultSchedules(brandId: string) {
  const days = [0, 1, 2, 3, 4, 5, 6] // Domingo a Sábado
  
  const schedules = days.map(day => ({
    brandId: brandId,
    dayOfWeek: day,
    openTime: '18:00',
    closeTime: '23:00',
    closed: false
  }))

  await prisma.openingHours.createMany({
    data: schedules
  })
}

async function main() {
  console.log('🌱 Start seeding multi-tenant database...')
  
  // ==========================================
  // 1. LIMPEZA TOTAL (A ordem importa!)
  // ==========================================
  console.log('🧹 Limpando o banco de dados...')
  await prisma.userBrandAccess.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.user.deleteMany()

  const password = await bcrypt.hash('Mudar@123', 10)

  // ==========================================
  // 2. USUÁRIOS
  // ==========================================
  console.log('👤 Criando usuários...')
  
  // O Super Admin (Você - Acesso a tudo via código)
  const adminUser = await prisma.user.create({
    data: {
      email: 'rodrigo@menuflow.com',
      name: 'Rodrigo Santiago',
      password,
      role: 'SUPER_ADMIN',
    },
  })

  const deejaysUser = await prisma.user.create({
    data: {
      email: 'gleidson@menuflow.com',
      name: 'Gleidson Correia',
      password,
      role: 'ADMIN',
    },
  })

  const clientUser = await prisma.user.create({
    data: {
      email: 'franqueado@menuflow.com',
      name: 'João Franqueado',
      password,
      role: 'ADMIN',
    },
  })

  // ==========================================
  // 3. LOJA 1: Deejays Burguer
  // ==========================================
  const deejaysBrand = await prisma.brand.create({
    data: {
      slug: 'deejays-burguer',
      name: 'Deejays',
      surname: 'Burguer',
      tagline: 'Sabor • Qualidade • Atitude',
      isActive: true,
      heroTitle: 'O Beat',
      heroHighlight: 'Perfeito',
      heroDescription: 'Hambúrgueres artesanais com o ritmo que o seu paladar merece.',
      heroImage: '/img/hero-burger.png',
      aboutTitle: 'Nossa',
      aboutHighlight: 'Vibe',
      since: '2024',
      aboutDescription: 'O Deejays Burguer nasceu da união entre a precisão das batidas e a arte da culinária artesanal...',
      aboutSubText: 'Localizados em Guadalupe, trazemos a essência urbana...',
      features: ['100% Artesanal', 'Premium Ingredientes'],
      whatsapp: '5521994295096',
      whatsappDisplay: '(21) 99429-5096',
      instagram: '@deejaysburguer',
      instaLink: 'https://www.instagram.com/deejaysburg',
      location: 'Guadalupe • Rio de Janeiro',
      colorPrimary: '#f59e0b',
      colorPrimaryHover: '#d97706',
      colorBg: '#0a0a0a'
    }
  })
  
  await createDefaultSchedules(deejaysBrand.id)

  const burgerCat = await prisma.category.create({
    data: { name: 'Burguers', slug: 'burger', brandId: deejaysBrand.id }
  })

  const hotdogCat = await prisma.category.create({
    data: { name: 'Hot Dogs', slug: 'hotdog', brandId: deejaysBrand.id }
  })

  await prisma.product.createMany({
    data: [
      { name: 'Double Beat', description: '2 Carnes, alface, tomate, cheddar, cebola, bacon, picles e molho especial.', price: 25.00, image: '/img/double-beat.jpg', categoryId: burgerCat.id, brandId: deejaysBrand.id },
      { name: 'Beat Mirim', description: '1 Carne, alface, tomate, queijo, ketchup, mostarda e maionese.', price: 12.00, image: '/img/beat-mirim.jpeg', categoryId: burgerCat.id, brandId: deejaysBrand.id },
      { name: 'Furacão 2000', description: '1 Carne, alface, tomate, milho, ovo, cheddar, cebola, bacon e molho especial.', price: 22.00, image: '/img/furacao-2000.jpeg', categoryId: burgerCat.id, brandId: deejaysBrand.id },
      { name: 'Big Fild', description: '3 Carnes, cheddar e bacon.', price: 27.00, image: '/img/big-fild.jpeg', categoryId: burgerCat.id, brandId: deejaysBrand.id },
      { name: 'Big Monster', description: '4 Carnes, cheddar e bacon, alface, tomate e molho billy jack.', price: 37.00, image: '/img/big-monster.jpeg', categoryId: burgerCat.id, brandId: deejaysBrand.id },
      { name: 'Errejota', description: 'Hot dog gourmet completo com batata palha, molho especial e a atitude carioca.', price: 22.00, image: '/img/errejota.jpg', categoryId: hotdogCat.id, brandId: deejaysBrand.id }
    ]
  })

  // ==========================================
  // 4. LOJA 2: Bella Napoli
  // ==========================================
  const bellaNapoliBrand = await prisma.brand.create({
    data: {
      slug: 'bella-napoli',
      name: 'Bella',
      surname: 'Napoli',
      isActive: true,
      tagline: 'Tradição • Forno a Lenha • Amor',
      heroTitle: 'A Verdadeira',
      heroHighlight: 'Pizza Italiana',
      heroDescription: 'Massas de fermentação lenta e ingredientes selecionados.',
      heroImage: '/img/hero-pizza.png',
      aboutTitle: 'Nossa',
      aboutHighlight: 'Herança',
      since: '1998',
      aboutDescription: 'A Bella Napoli nasceu do desejo de trazer as receitas da nossa nonna...',
      aboutSubText: 'Localizados no coração de Copacabana.',
      features: ['Longa Fermentação', 'Forno a Lenha'],
      whatsapp: '5521988887777',
      whatsappDisplay: '(21) 98888-7777',
      instagram: '@bellanapoli_rj',
      instaLink: 'https://www.instagram.com/bellanapoli_rj',
      location: 'Copacabana • Rio de Janeiro',
      colorPrimary: '#e11d48',
      colorPrimaryHover: '#be123c',
      colorBg: '#0f172a'
    }
  })

  await createDefaultSchedules(bellaNapoliBrand.id)

  const pizzaCat = await prisma.category.create({
    data: { name: 'Pizzas Clássicas', slug: 'pizzas', brandId: bellaNapoliBrand.id }
  })

  // ==========================================
  // 4. LOJA 3: Doce Melodia
  // ==========================================
  const doceMelodiaBrand = await prisma.brand.create({
    data: {
      slug: 'doce-melodia',
      name: 'Doce',
      surname: 'Melodia',
      tagline: 'Afeto • Confeitaria • Momentos',
      isActive: true,
      heroTitle: 'A Arte de',
      heroHighlight: 'Adoçar a Vida',
      heroDescription: 'Bolos artesanais e doces finos feitos com carinho.',
      heroImage: '/img/hero-confeitaria.png',
      aboutTitle: 'Nossa',
      aboutHighlight: 'Doçura',
      since: '2015',
      aboutDescription: 'A Doce Melodia começou em uma cozinha pequena...',
      aboutSubText: 'Localizados na Tijuca.',
      features: ['Ingredientes Nobres', 'Feito com Amor'],
      whatsapp: '5521977776666',
      whatsappDisplay: '(21) 97777-6666',
      instagram: '@docemelodia_confeitaria',
      instaLink: 'https://www.instagram.com/docemelodia',
      location: 'Tijuca • Rio de Janeiro',
      colorPrimary: '#db2777',
      colorPrimaryHover: '#be185d',
      colorBg: '#0f0a0a'
    }
  })

  await createDefaultSchedules(doceMelodiaBrand.id)

  const cakeCat = await prisma.category.create({
    data: { name: 'Bolos Artesanais', slug: 'bolos', brandId: doceMelodiaBrand.id }
  })

  // ==========================================
  // 6. PERMISSÕES DE ACESSO
  // ==========================================
  console.log('🔗 Configurando permissões de acesso...')
  
  await prisma.userBrandAccess.createMany({
    data: [
      { userId: deejaysUser.id, brandId: deejaysBrand.id },
      { userId: clientUser.id, brandId: bellaNapoliBrand.id },
      { userId: clientUser.id, brandId: doceMelodiaBrand.id },
    ]
  })

  console.log('✅ Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })