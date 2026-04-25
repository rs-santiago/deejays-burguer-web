// app.config.ts
import type { BrandConfig } from './types/brand'

export const brandConfig: BrandConfig = {
  name: 'Doce',
  surname: 'Melodia',
  tagline: 'Afeto • Confeitaria • Momentos',
  hero: {
    title: 'A Arte de',
    highlight: 'Adoçar a Vida',
    description: 'Bolos artesanais, doces finos e sobremesas feitas com ingredientes nobres e muito carinho.',
    image: '/img/hero-confeitaria.png' // Uma imagem de um bolo decorado ou vitrine de doces
  },
  about: {
    title: 'Nossa',
    highlight: 'Doçura',
    since: '2015',
    description: 'A Doce Melodia começou em uma cozinha pequena, movida pelo sonho de transformar receitas de família em celebrações inesquecíveis. Hoje, cada fatia carrega nossa história e dedicação.',
    subText: 'Localizados na Tijuca, somos especialistas em tornar seus eventos ainda mais especiais.',
    features: ['Ingredientes Nobres', 'Feito com Amor']
  },
  contact: {
    whatsapp: '5521977776666',
    whatsappDisplay: '(21) 97777-6666',
    instagram: '@docemelodia_confeitaria',
    instaLink: 'https://www.instagram.com/docemelodia',
    location: 'Tijuca • Rio de Janeiro'
  },
  colors: {
    primary: '#db2777', // Pink-600 (Um rosa vibrante mas sofisticado)
    primaryHover: '#be185d', // Pink-700
    bg: '#0f0a0a' // Um marrom café extremamente escuro (quase preto) - traz um contraste luxuoso com o rosa
  }
}