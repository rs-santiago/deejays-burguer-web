<script setup>
import { ref, computed } from 'vue'
import ProductCard from '../components/ProductCard.vue'
const route = useRoute()
const slug = route.params.slug
// const slug = 'deejays-burguer'

// 1. Busca os dados da Marca (Aguardamos a resposta)
const { data: brand, pending: brandPending, error } = await useFetch(`/api/brand/${slug}`, { 
  key: `brand-${slug}`, // Chave única para evitar cache cruzado
  watch: [slug] 
})

if (!brand.value || error.value) {
  // O 'replace: true' evita que o usuário consiga voltar para a página de erro ao clicar no botão 'voltar' do navegador
  await navigateTo('/', { replace: true })
}

// 2. SEO Dinâmico (Corrigido para ser 100% reativo)
useHead({
  title: computed(() => brand.value ? `${brand.value.name} ${brand.value.surname} - ${brand.value.tagline}` : 'Carregando...'),
  meta: [
    { 
      name: 'description', 
      content: computed(() => brand.value?.hero.description) 
    }
  ]
})

useSeoMeta({
  title: () => brand.value ? `${brand.value.name} ${brand.value.surname} - ${brand.value.tagline}` : 'Carregando...',
  ogTitle: () => brand.value ? `${brand.value.name} ${brand.value.surname} - ${brand.value.tagline}` : 'Carregando...',
  description: () => brand.value?.hero.description,
  ogDescription: () => brand.value?.heroDescription,
  ogImage: () => brand.value?.hero.image,
  twitterCard: 'summary_large_image',
})

// 3. Busca de Produtos e Categorias em paralelo usando o ID da marca carregada
const [
  { data: products, pending: productsPending }, 
  { data: categoriesData, pending: catsPending }
] = await Promise.all([
  useFetch('/api/products', { 
    query: { brandId: computed(() => brand.value?.id) }, // Computed aqui é a chave!
    watch: [brand] 
  }), 
  useFetch('/api/categories', { 
    query: { brandId: computed(() => brand.value?.id) }, 
    watch: [brand] 
  })
])

const pending = computed(() => productsPending.value || catsPending.value)
const selectedCategory = ref('all')

const categories = computed(() => {
  const dynamic = categoriesData.value?.map(c => ({ id: c.slug, name: c.name })) || []
  return [{ id: 'all', name: 'Todos' }, ...dynamic]
})

const filteredProducts = computed(() => {
  if (!products.value) return []
  if (selectedCategory.value === 'all') return products.value
  return products.value.filter(p => p.category.slug.toLowerCase() === selectedCategory.value.toLowerCase())
})
</script>

<template>
  <div v-if="brand" class="min-h-screen text-white font-sans scroll-smooth" :style="{ backgroundColor: brand.colors.bg }">
    
    <nav class="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div class="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <h1 class="text-2xl font-black tracking-tighter uppercase">
          {{ brand.name }} <span :style="{ color: brand.colors.primary }">{{ brand.surname }}</span>
        </h1>
        <div class="space-x-8 hidden md:flex font-medium text-sm uppercase tracking-widest">
          <a href="#menu" class="hover:opacity-80 transition">Cardápio</a>
          <a href="#about" class="hover:opacity-80 transition">Sobre</a>
          <a href="#contact" class="text-neutral-500 hover:text-white transition">Contato</a>
        </div>
      </div>
    </nav>

    <header class="relative min-h-[80vh] flex items-center overflow-hidden">
      <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center z-10 py-20">
        <div class="space-y-6 text-center md:text-left">
          <span class="font-bold tracking-[0.3em] uppercase text-sm" :style="{ color: brand.colors.primary }">
            {{ brand.tagline }}
          </span>
          <h2 class="text-6xl md:text-8xl font-black leading-[0.9] uppercase">
            {{ brand.hero.title }} <br /> 
            <span :style="{ color: brand.colors.primary }">{{ brand.hero.highlight }}</span>
          </h2>
          <p class="text-neutral-400 text-lg max-w-md mx-auto md:mx-0">{{ brand.hero.description }}</p>
          <div class="pt-4">
            <a href="#menu" 
               class="text-black px-10 py-5 rounded-full font-black uppercase transition-all transform hover:scale-105 inline-block"
               :style="{ backgroundColor: brand.colors.primary, boxShadow: `0 10px 30px ${brand.colors.primary}4D` }">
              Ver Cardápio
            </a>
          </div>
        </div>
        <div class="relative group justify-self-center">
          <NuxtImg :src="brand.hero.image" class="rounded-2xl transform group-hover:rotate-1 transition-transform duration-700 w-full max-lg shadow-2xl" preload />
        </div>
      </div>
      <div class="absolute top-0 right-0 w-1/2 h-full opacity-10 blur-[120px] -z-0" :style="{ backgroundColor: brand.colors.primary }"></div>
    </header>

    <section id="menu" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
      <div class="text-center mb-12">
        <h2 class="text-4xl md:text-6xl font-black uppercase mb-4">
          Nosso <span :style="{ color: brand.colors.primary }">Cardápio</span>
        </h2>
        <p class="text-neutral-500 uppercase tracking-[0.2em] text-xs font-bold text-center">As faixas mais pedidas da casa</p>
      </div>

      <div class="flex flex-wrap justify-center gap-3 mb-16">
        <button v-for="cat in categories" :key="cat.id" @click="selectedCategory = cat.id"
          :class="['px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border']"
          :style="selectedCategory === cat.id 
            ? { backgroundColor: brand.colors.primary, borderColor: brand.colors.primary, color: '#000' } 
            : { backgroundColor: 'transparent', borderColor: '#262626', color: '#737373' }">
          {{ cat.name }}
        </button>
      </div>

      <div v-if="pending" class="flex justify-center py-20">
        <div class="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" :style="{ borderColor: brand.colors.primary, borderTopColor: 'transparent' }"></div>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <ProductCard v-for="item in filteredProducts" :key="item.id" :product="item" :brand="brand" :themeColor="brand.colors.primary" />
      </div>
    </section>

    <section id="about" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
      <div class="grid md:grid-cols-2 gap-16 items-center">
        <div class="relative">
          <NuxtImg :src="brand.hero.image" class="rounded-[3rem] grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl" />
          <div class="absolute -bottom-6 -right-6 p-8 rounded-2xl hidden md:block text-black" :style="{ backgroundColor: brand.colors.primary }">
            <span class="font-title text-4xl italic leading-none font-bold">Since<br/>{{ brand.about.since }}</span>
          </div>
        </div>
        <div class="space-y-6">
          <h2 class="text-4xl md:text-6xl font-black uppercase italic leading-none">
            {{ brand.about.title }} <span :style="{ color: brand.colors.primary }">{{ brand.about.highlight }}</span>
          </h2>
          <p class="text-neutral-400 leading-relaxed text-lg">{{ brand.about.description }}</p>
          <p class="text-neutral-500">{{ brand.about.subText }}</p>
          <div class="grid grid-cols-2 gap-4 pt-4">
            <div v-for="feat in brand.about.features" :key="feat" class="border border-white/10 p-4 rounded-xl text-center">
              <span class="font-black block text-2xl" :style="{ color: brand.colors.primary }">TOP</span>
              <span class="text-neutral-500 text-[10px] uppercase tracking-widest">{{ feat }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="contact" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
      <div class="bg-neutral-900/30 rounded-[3rem] p-8 md:p-16 border border-white/5 relative overflow-hidden">
        <div class="relative z-10 grid md:grid-cols-2 gap-12">
          
          <div>
            <h2 class="text-4xl font-black uppercase mb-6">
              Manda um <span :style="{ color: brand.colors.primary }">Salve</span>
            </h2>
            <p class="text-neutral-400 mb-8">
              Dúvidas, eventos ou apenas quer bater um papo sobre o melhor sabor da cidade?
            </p>
            
            <div class="space-y-6">
              <a :href="`https://wa.me/${brand.contact.whatsapp}`" 
                target="_blank" 
                class="flex items-center gap-4 group"
                :style="{ '--brand-primary': brand.colors.primary }"> <div class="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center transition-all duration-300
                            group-hover:bg-[var(--brand-primary)]"> <span class="text-xs font-bold transition-colors duration-300 group-hover:text-black" 
                        :style="{ color: brand.colors.primary }">
                    WA
                  </span>
                </div>

                <div>
                  <span class="block text-xs uppercase text-neutral-500 font-bold tracking-widest">WhatsApp</span>
                  <span class="text-white text-lg font-medium">{{ brand.contact.whatsappDisplay }}</span>
                </div>
              </a>

              <a :href="brand.contact.instaLink" 
                 target="_blank" 
                 class="flex items-center gap-4 group">
                <div class="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center transition-colors group-hover:bg-[var(--hover-bg)]"
                     :style="`--hover-bg: ${brand.colors.primary}`">
                  <span class="text-xs font-bold group-hover:text-black" :style="{ color: brand.colors.primary }">IG</span>
                </div>
                <div>
                  <span class="block text-xs uppercase text-neutral-500 font-bold tracking-widest">Instagram</span>
                  <span class="text-white text-lg font-medium">{{ brand.contact.instagram }}</span>
                </div>
              </a>
            </div>
          </div>

          <div class="bg-neutral-950 rounded-[2rem] p-2 border border-white/5 h-64 md:h-auto min-h-[300px] flex flex-col items-center justify-center text-center">
            <div class="w-full h-full rounded-[1.8rem] bg-neutral-900/50 flex flex-col items-center justify-center border border-white/5 p-6">
              <div class="w-10 h-10 mb-4 rounded-full flex items-center justify-center" :style="{ backgroundColor: `${brand.colors.primary}20` }">
                 <span :style="{ color: brand.colors.primary }">📍</span>
              </div>
              <span class="text-neutral-400 font-bold text-xs uppercase tracking-[0.3em] leading-relaxed">
                {{ brand.contact.location }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="absolute -bottom-20 -left-20 w-64 h-64 blur-[100px] rounded-full opacity-20" 
             :style="{ backgroundColor: brand.colors.primary }"></div>
      </div>
    </section>    

    <footer class="bg-neutral-900/50 border-t border-white/5 py-12">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <p class="text-neutral-500 text-[10px] font-mono tracking-widest uppercase">
          {{ brand.contact.location.split('•')[0] }} • RJ
        </p>
        <div class="flex flex-col items-center md:items-end">
          <p class="text-white font-black uppercase tracking-widest text-[10px]">
            Desenvolvido por <span :style="{ color: brand.colors.primary }">Rodrigo Santiago</span>
          </p>
          <p class="text-neutral-600 text-[9px] font-mono uppercase tracking-[0.2em] mt-1">
            Powered by <span class="text-neutral-400">MenuFlow</span>
          </p>
        </div>
      </div>
    </footer>

    </div>
</template>

<style>
html { scroll-behavior: smooth; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>