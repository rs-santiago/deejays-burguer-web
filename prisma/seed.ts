import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding multi-tenant database...')

  // 1. Limpeza total (Cuidado: a ordem importa devido às FKs)
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()

  // 2. Criar a Marca Principal (Deejays Burguer)
  // Recomendo usar um ID fixo ou salvar o retorno para usar nos filhos
  const deejaysBrand = await prisma.brand.create({
    data: {
      slug: 'deejays-burguer',
      name: 'Deejays',
      surname: 'Burguer',
      tagline: 'Sabor • Qualidade • Atitude',
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
  console.log(`🏢 Brand created: ${deejaysBrand.name}`)

  // 3. Criar as Categorias vinculadas à Brand
  const burgerCat = await prisma.category.create({
    data: { 
      name: 'Burguers', 
      slug: 'burger',
      brandId: deejaysBrand.id // Vincular aqui
    }
  })

  const hotdogCat = await prisma.category.create({
    data: { 
      name: 'Hot Dogs', 
      slug: 'hotdog',
      brandId: deejaysBrand.id // Vincular aqui
    }
  })

  // 4. Lista de Produtos atualizada com brandId
  const products = [
    {
      name: 'Double Beat',
      description: '2 Carnes, alface, tomate, cheddar, cebola, bacon, picles e molho especial.',
      price: 25.00,
      image: '/img/double-beat.jpg',
      categoryId: burgerCat.id,
      brandId: deejaysBrand.id // Vincular aqui
    },
    {
      name: 'Beat Mirim',
      description: '1 Carne, alface, tomate, queijo, ketchup, mostarda e maionese.',
      price: 12.00,
      image: '/img/beat-mirim.jpeg',
      categoryId: burgerCat.id,
      brandId: deejaysBrand.id
    },
    {
      name: 'Furacão 2000',
      description: '1 Carne, alface, tomate, milho, ovo, cheddar, cebola, bacon e molho especial.',
      price: 22.00,
      image: '/img/furacao-2000.jpeg',
      categoryId: burgerCat.id,
      brandId: deejaysBrand.id
    },
    {
      name: 'Big Fild',
      description: '3 Carnes, cheddar e bacon.',
      price: 27.00,
      image: '/img/big-fild.jpeg',
      categoryId: burgerCat.id,
      brandId: deejaysBrand.id
    },
    {
      name: 'Big Monster',
      description: '4 Carnes, cheddar e bacon, alface, tomate e molho billy jack.',
      price: 37.00,
      image: '/img/big-monster.jpeg',
      categoryId: burgerCat.id,
      brandId: deejaysBrand.id
    },
    {
      name: 'Errejota',
      description: 'Hot dog gourmet completo com batata palha, molho especial e a atitude carioca.',
      price: 22.00,
      image: '/img/errejota.jpg',
      categoryId: hotdogCat.id,
      brandId: deejaysBrand.id
    }
  ]

  // 5. Inserir os produtos
  for (const p of products) {
    await prisma.product.create({
      data: p
    })
  }

  // Criar a Marca Bella Napoli (Pizzaria)
  const bellaNapoliBrand = await prisma.brand.create({
    data: {
      slug: 'bella-napoli',
      name: 'Bella',
      surname: 'Napoli',
      tagline: 'Tradição • Forno a Lenha • Amor',
      
      // Hero
      heroTitle: 'A Verdadeira',
      heroHighlight: 'Pizza Italiana',
      heroDescription: 'Massas de fermentação lenta e ingredientes selecionados para uma experiência gastronômica única.',
      heroImage: '/img/hero-pizza.png',
      
      // About
      aboutTitle: 'Nossa',
      aboutHighlight: 'Herança',
      since: '1998',
      aboutDescription: 'A Bella Napoli nasceu do desejo de trazer as receitas secretas da nossa "nonna" diretamente da Itália para o Rio de Janeiro. Cada pizza é aberta à mão e assada em forno a lenha a 450°C.',
      aboutSubText: 'Localizados no coração de Copacabana, somos referência em sabor e tradição há mais de duas décadas.',
      features: ['Longa Fermentação', 'Forno a Lenha'],
      
      // Contact
      whatsapp: '5521988887777',
      whatsappDisplay: '(21) 98888-7777',
      instagram: '@bellanapoli_rj',
      instaLink: 'https://www.instagram.com/bellanapoli_rj',
      location: 'Copacabana • Rio de Janeiro',
      
      // Colors
      colorPrimary: '#e11d48',
      colorPrimaryHover: '#be123c',
      colorBg: '#0f172a'
    }
  })

  console.log(`🏢 Brand created: ${bellaNapoliBrand.name} ${bellaNapoliBrand.surname}`)

  // Agora você pode criar as categorias para ela
  const pizzaCat = await prisma.category.create({
    data: { 
      name: 'Pizzas Clássicas', 
      slug: 'pizzas',
      brandId: bellaNapoliBrand.id 
    }
  })

  // 3. Criar a Marca Doce Melodia (Confeitaria)
  const doceMelodiaBrand = await prisma.brand.create({
    data: {
      slug: 'doce-melodia',
      name: 'Doce',
      surname: 'Melodia',
      tagline: 'Afeto • Confeitaria • Momentos',
      
      // Hero
      heroTitle: 'A Arte de',
      heroHighlight: 'Adoçar a Vida',
      heroDescription: 'Bolos artesanais, doces finos e sobremesas feitas com ingredientes nobres e muito carinho.',
      heroImage: '/img/hero-confeitaria.png',
      
      // About
      aboutTitle: 'Nossa',
      aboutHighlight: 'Doçura',
      since: '2015',
      aboutDescription: 'A Doce Melodia começou em uma cozinha pequena, movida pelo sonho de transformar receitas de família em celebrações inesquecíveis. Hoje, cada fatia carrega nossa história e dedicação.',
      aboutSubText: 'Localizados na Tijuca, somos especialistas em tornar seus eventos ainda mais especiais.',
      features: ['Ingredientes Nobres', 'Feito com Amor'],
      
      // Contact
      whatsapp: '5521977776666',
      whatsappDisplay: '(21) 97777-6666',
      instagram: '@docemelodia_confeitaria',
      instaLink: 'https://www.instagram.com/docemelodia',
      location: 'Tijuca • Rio de Janeiro',
      
      // Colors
      colorPrimary: '#db2777', // Pink-600
      colorPrimaryHover: '#be185d',
      colorBg: '#0f0a0a' // Café Escuro
    }
  })

  console.log(`🏢 Brand created: ${doceMelodiaBrand.name} ${doceMelodiaBrand.surname}`)

  // Criar categoria para a Confeitaria
  const cakeCat = await prisma.category.create({
    data: { 
      name: 'Bolos Artesanais', 
      slug: 'bolos',
      brandId: doceMelodiaBrand.id 
    }
  })

  // DICA: Você pode repetir o processo aqui para criar a "Bella Napoli"
  // e testar se os produtos não se misturam no seu front-end!

  console.log('✅ Seed finished successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })