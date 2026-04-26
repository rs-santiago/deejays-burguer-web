<script setup>
import { ref, computed } from 'vue'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const slug = route.params.slug
const showScheduleModal = ref(false)

// 1. Busca os dados da Marca
const { data: brand, pending: brandPending, error } = await useFetch(`/api/brand/${slug}`, { 
  key: `brand-${slug}`,
  watch: [slug] 
})

if (!brand.value || error.value) {
  await navigateTo('/', { replace: true })
}

// --- LÓGICA DE HORÁRIOS REVISADA (COM PRIORIDADE PARA FLAG CLOSED) ---
const isStoreOpen = computed(() => {
  if (!brand.value?.schedules || brand.value.schedules.length === 0) return true
  const now = new Date()
  const dayOfWeek = now.getDay()
  // Tempo atual formatado (ex: 16:05 vira 1605)
  const currentTime = now.getHours() * 100 + now.getMinutes()

  const today = brand.value.schedules.find(s => s.dayOfWeek === dayOfWeek)
  
  
  // PRIORIDADE 1: Se não houver configuração para hoje ou a flag 'closed' for TRUE
  if (!today || today.closed === true || today.closed === "true") {
    return false
  }

  // PRIORIDADE 2: Validação por horário
  const open = parseInt(today.openTime.replace(':', ''), 10)
  const close = parseInt(today.closeTime.replace(':', ''), 10)

  // Tratamento para horários que cruzam a meia-noite (ex: 18:00 às 02:00)
  if (close < open) {
    return currentTime >= open || currentTime <= close
  }

  return currentTime >= open && currentTime <= close
})

const getDayName = (dayIndex) => {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  return days[dayIndex]
}
// ----------------------------------

// 2. SEO Dinâmico
useHead({
  title: computed(() => brand.value ? `${brand.value.name} ${brand.value.surname} - ${brand.value.tagline}` : 'Carregando...'),
})

useSeoMeta({
  title: () => brand.value ? `${brand.value.name} ${brand.value.surname} - ${brand.value.tagline}` : 'Carregando...',
  description: () => brand.value?.hero.description,
  ogImage: () => brand.value?.hero.image,
})

// 3. Busca de Produtos e Categorias
const [{ data: products, pending: productsPending }, { data: categoriesData, pending: catsPending }] = await Promise.all([
  useFetch('/api/products', { 
    query: { brandId: computed(() => brand.value?.id) },
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
    
    <div v-if="!isStoreOpen" class="bg-red-600 text-center py-2 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-[70] shadow-2xl">
      Loja fechada no momento • Apenas consulta
    </div>

    <nav class="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div class="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div class="flex items-center gap-4">
          <div v-if="brand.logoUrl" class="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-neutral-900 shadow-inner">
            <img :src="brand.logoUrl" class="w-full h-full object-cover" />
          </div>
          <div>
            <h1 class="text-xl font-black tracking-tighter uppercase leading-none">
              {{ brand.name }} <span :style="{ color: brand.colors.primary }">{{ brand.surname }}</span>
            </h1>
            <button @click="showScheduleModal = true" class="flex items-center gap-2 mt-1 group">
              <span :class="isStoreOpen ? 'text-green-500' : 'text-red-500'" class="text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-current" :class="isStoreOpen && 'animate-pulse'"></span>
                {{ isStoreOpen ? 'Aberto' : 'Fechado' }}
              </span>
              <span class="text-neutral-600 text-[9px]">—</span>
              <span class="text-neutral-500 text-[9px] font-bold uppercase underline decoration-white/10 group-hover:text-white transition-colors">Ver horários</span>
            </button>
          </div>
        </div>
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
            <a href="#menu" class="text-black px-10 py-5 rounded-full font-black uppercase transition-all transform hover:scale-105 inline-block"
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
        <h2 class="text-4xl md:text-6xl font-black uppercase mb-4">Nosso <span :style="{ color: brand.colors.primary }">Cardápio</span></h2>
        <p class="text-neutral-500 uppercase tracking-[0.2em] text-xs font-bold text-center">As faixas mais pedidas da casa</p>
      </div>
      <div class="flex flex-wrap justify-center gap-3 mb-16">
        <button v-for="cat in categories" :key="cat.id" @click="selectedCategory = cat.id"
          class="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border"
          :style="selectedCategory === cat.id ? { backgroundColor: brand.colors.primary, borderColor: brand.colors.primary, color: '#000' } : { backgroundColor: 'transparent', borderColor: '#262626', color: '#737373' }">
          {{ cat.name }}
        </button>
      </div>
      <div v-if="pending" class="flex justify-center py-20">
        <div class="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" :style="{ borderColor: brand.colors.primary }"></div>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <ProductCard v-for="item in filteredProducts" :key="item.id" :product="item" :brand="brand" :themeColor="brand.colors.primary" :disabled="!isStoreOpen" />
      </div>
    </section>

    <section id="about" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
      <div class="grid md:grid-cols-2 gap-16 items-center">
        <div class="relative">
          <NuxtImg :src="brand.hero.image" class="rounded-[3rem] grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl" />
          <div class="absolute -bottom-6 -right-6 p-8 rounded-2xl hidden md:block text-black font-black" :style="{ backgroundColor: brand.colors.primary }">
            <span class="text-4xl italic leading-none">Since<br/>{{ brand.about.since }}</span>
          </div>
        </div>
        <div class="space-y-6">
          <h2 class="text-4xl md:text-6xl font-black uppercase italic leading-none">
            {{ brand.about.title }} <span :style="{ color: brand.colors.primary }">{{ brand.about.highlight }}</span>
          </h2>
          <p class="text-neutral-400 leading-relaxed text-lg">{{ brand.about.description }}</p>
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
            <h2 class="text-4xl font-black uppercase mb-6">Manda um <span :style="{ color: brand.colors.primary }">Salve</span></h2>
            <div class="space-y-6">
              <a :href="`https://wa.me/${brand.contact.whatsapp}`" target="_blank" class="flex items-center gap-4 group">
                <div class="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center transition-all group-hover:bg-white/10">
                  <span class="text-xs font-bold" :style="{ color: brand.colors.primary }">WA</span>
                </div>
                <div><span class="block text-xs uppercase text-neutral-500 font-bold tracking-widest">WhatsApp</span><span class="text-white text-lg font-medium">{{ brand.contact.whatsappDisplay }}</span></div>
              </a>
              <a :href="brand.contact.instaLink" target="_blank" class="flex items-center gap-4 group">
                <div class="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center transition-all group-hover:bg-white/10">
                  <span class="text-xs font-bold" :style="{ color: brand.colors.primary }">IG</span>
                </div>
                <div><span class="block text-xs uppercase text-neutral-500 font-bold tracking-widest">Instagram</span><span class="text-white text-lg font-medium">{{ brand.contact.instagram }}</span></div>
              </a>
            </div>
          </div>
          <div class="bg-neutral-950 rounded-[2rem] p-8 border border-white/5 flex flex-col items-center justify-center text-center">
             <span class="text-neutral-400 font-bold text-xs uppercase tracking-[0.3em] leading-relaxed">{{ brand.contact.location }}</span>
          </div>
        </div>
      </div>
    </section>

    <footer class="bg-neutral-900/50 border-t border-white/5 py-12">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <p class="text-neutral-500 text-[10px] font-mono tracking-widest uppercase">
          {{ brand.contact.location.split('•')[0] }} • MenuFlow
        </p>
        <div class="flex flex-col items-center md:items-end">
          <p class="text-white font-black uppercase tracking-widest text-[10px]">Desenvolvido por <span :style="{ color: brand.colors.primary }">Rodrigo Santiago</span></p>
        </div>
      </div>
    </footer>

    <Transition name="fade">
      <div v-if="showScheduleModal" class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
        <div class="bg-neutral-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
          <button @click="showScheduleModal = false" class="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">✕</button>
          <h3 class="text-xl font-black uppercase italic mb-8">Horários de <span :style="{ color: brand.colors.primary }">Funcionamento</span></h3>
          <div class="space-y-1">
            <div v-for="s in brand.schedules.sort((a,b) => a.dayOfWeek - b.dayOfWeek)" :key="s.dayOfWeek" 
                 class="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
              <span class="font-bold uppercase text-[11px] tracking-[0.2em]" :class="new Date().getDay() === s.dayOfWeek ? 'text-white' : 'text-neutral-500'">{{ getDayName(s.dayOfWeek) }}</span>
              <div v-if="s.closed" class="text-[9px] font-black bg-red-500/10 text-red-500 px-3 py-1 rounded-lg uppercase">Fechado</div>
              <div v-else class="text-xs font-mono font-bold text-neutral-300">{{ s.openTime }} — {{ s.closeTime }}</div>
            </div>
          </div>
          <button @click="showScheduleModal = false" class="w-full mt-8 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em]" :style="{ backgroundColor: brand.colors.primary, color: '#000' }">Fechar</button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
html { scroll-behavior: smooth; }
</style>