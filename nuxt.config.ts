export default defineNuxtConfig({
  compatibilityDate: '2026-04-24',
  modules: [
    '@nuxtjs/tailwindcss', 
    '@nuxt/image', 
    '@nuxt/fonts',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  pinia: {
    storesDirs: ['./stores/**'],
  },
  typescript: {
    strict: true
  },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;700;900&display=swap' }
      ]
    }
  },
  devtools: { enabled: true },
  nitro: {
    routeRules: {
      // Libera todas as rotas da API para o seu painel Web conseguir logar
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
        },
      },
    },
  },
})