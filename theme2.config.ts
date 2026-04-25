// theme.config.ts
import type { BrandConfig } from './types/brand'

export const brandConfig: BrandConfig = {
  name: 'Bella',
  surname: 'Napoli',
  tagline: 'Tradição • Forno a Lenha • Amor',
  hero: {
    title: 'A Verdadeira',
    highlight: 'Pizza Italiana',
    description: 'Massas de fermentação lenta e ingredientes selecionados para uma experiência gastronômica única.',
    image: '/img/hero-pizza.png' // Lembre de trocar a imagem para uma pizza bem suculenta
  },
  about: {
    title: 'Nossa',
    highlight: 'Herança',
    since: '1998',
    description: 'A Bella Napoli nasceu do desejo de trazer as receitas secretas da nossa "nonna" diretamente da Itália para o Rio de Janeiro. Cada pizza é aberta à mão e assada em forno a lenha a 450°C.',
    subText: 'Localizados no coração de Copacabana, somos referência em sabor e tradição há mais de duas décadas.',
    features: ['Longa Fermentação', 'Forno a Lenha']
  },
  contact: {
    whatsapp: '5521988887777', // Exemplo de novo número
    whatsappDisplay: '(21) 98888-7777',
    instagram: '@bellanapoli_rj',
    instaLink: 'https://www.instagram.com/bellanapoli_rj',
    location: 'Copacabana • Rio de Janeiro'
  },
  colors: {
    primary: '#e11d48', // Rose-600 (Um vermelho clássico de pizzaria, mas moderno)
    primaryHover: '#be123c', // Rose-700
    bg: '#0f172a' // Slate-900 (Um azul quase preto, que contrasta melhor com o vermelho da pizza)
  }
}