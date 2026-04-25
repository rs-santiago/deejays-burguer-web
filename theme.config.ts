// theme.config.ts
import type { BrandConfig } from './types/brand'

export const brandConfig: BrandConfig = {
  name: 'Deejays',
  surname: 'Burguer',
  tagline: 'Sabor • Qualidade • Atitude',
  hero: {
    title: 'O Beat',
    highlight: 'Perfeito',
    description: 'Hambúrgueres artesanais com o ritmo que o seu paladar merece.',
    image: '/img/hero-burger.png'
  },
  about: {
    title: 'Nossa',
    highlight: 'Vibe',
    since: '2024',
    description: 'O Deejays Burguer nasceu da união entre a precisão das batidas e a arte da culinária artesanal...',
    subText: 'Localizados em Guadalupe, trazemos a essência urbana...',
    features: ['100% Artesanal', 'Premium Ingredientes']
  },
  contact: {
    whatsapp: '5521994295096',
    whatsappDisplay: '(21) 99429-5096',
    instagram: '@deejaysburguer',
    instaLink: 'https://www.instagram.com/deejaysburg',
    location: 'Guadalupe • Rio de Janeiro'
  },
  colors: {
    primary: '#f59e0b', // Amber-500
    primaryHover: '#d97706', // Amber-600
    bg: '#0a0a0a' // Neutral-950
  }
}