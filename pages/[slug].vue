<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import ProductCard from '../components/ProductCard.vue'
import CartSummary from '../components/CartSummary.vue'
import CartModal from '../components/CartModal.vue'
import CustomerHistory from '../components/CustomerHistory.vue'

const route = useRoute()
const slug = route.params.slug
const cart = useCartStore()
const showScheduleModal = ref(false)

// CONTROLE DE ABAS E MENU
const activeTab = ref('menu') 
const isMobileMenuOpen = ref(false)

const setTab = (tab) => {
  activeTab.value = tab
  isMobileMenuOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// VALIDAÇÃO DE HORÁRIO DA CATEGORIA
const isCategoryOpen = (activeTime) => {
  if (!activeTime || !Array.isArray(activeTime) || activeTime.length === 0) return true
  const now = new Date()
  const dayOfWeek = now.getDay()
  const currentTime = now.getHours() * 100 + now.getMinutes()
  const today = activeTime.find(item => item.day === dayOfWeek)
  if (!today) return false
  const open = parseInt(today.open.replace(':', ''), 10)
  const close = parseInt(today.close.replace(':', ''), 10)
  if (close < open) return currentTime >= open || currentTime <= close
  return currentTime >= open && currentTime <= close
}

// 1. Busca os dados da Marca
const { data: brand, pending: brandPending, error } = await useFetch(`/api/brand/${slug}`, {
  key: `brand-${slug}`,
  watch: [slug]
})

watch(brand, (newVal) => {
  if (newVal?.id) cart.setActiveBrand(newVal.id)
}, { immediate: true })

if (!brand.value || error.value) {
  await navigateTo('/', { replace: true })
}

// LÓGICA DE HORÁRIOS DA LOJA
const isStoreOpen = computed(() => {
  if (!brand.value?.schedules || brand.value.schedules.length === 0) return true
  const now = new Date()
  const dayOfWeek = now.getDay()
  const currentTime = now.getHours() * 100 + now.getMinutes()
  const today = brand.value.schedules.find(s => s.dayOfWeek === dayOfWeek)
  if (!today || today.closed === true || today.closed === "true") return false
  const open = parseInt(today.openTime.replace(':', ''), 10)
  const close = parseInt(today.closeTime.replace(':', ''), 10)
  if (close < open) return currentTime >= open || currentTime <= close
  return currentTime >= open && currentTime <= close
})

const getDayName = (dayIndex) => {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  return days[dayIndex]
}

const handleAuthAction = () => {
  if (cart.customerPhone) cart.fetchHistory()
  cart.isHistoryOpen = true
}

// Busca de Produtos e Categorias
const [{ data: products, pending: productsPending }, { data: categoriesData, pending: catsPending }] = await Promise.all([
  useFetch('/api/products', { query: { brandId: computed(() => brand.value?.id) }, watch: [brand] }),
  useFetch('/api/categories', { query: { brandId: computed(() => brand.value?.id) }, watch: [brand] })
])

const pending = computed(() => productsPending.value || catsPending.value)

// AGRUPAMENTO DE PRODUTOS POR CATEGORIA
const menuByCategories = computed(() => {
  if (!products.value || !categoriesData.value) return []
  const activeCats = categoriesData.value.filter(c => c.isActive && isCategoryOpen(c.activeTime))
  return activeCats.map(cat => ({
    ...cat,
    products: products.value.filter(p => p.categoryId === cat.id)
  })).filter(cat => cat.products.length > 0)
})

onUnmounted(() => { 
  cart.isModalOpen = false 
  cart.isHistoryOpen = false
})
</script>

<template>
  <div v-if="brand" class="min-h-screen text-white font-sans scroll-smooth flex flex-col overflow-x-hidden" :style="{ backgroundColor: brand.colors.bg }">
    
    <CartSummary />
    <CartModal :brand="brand" :isStoreOpen="isStoreOpen" />
    <CustomerHistory :isStoreOpen="isStoreOpen" />
    
    <div v-if="!isStoreOpen" class="bg-red-600 text-center py-2 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-[70] shadow-2xl">
      Loja fechada no momento • Apenas consulta
    </div>

    <!-- Navegação -->
    <nav class="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div class="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <div class="flex items-center gap-4">
          <div v-if="brand.logoUrl" class="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-neutral-900 shadow-inner">
            <img :src="brand.logoUrl" class="w-full h-full object-cover" />
          </div>
          <div>
            <h1 class="text-xl font-black tracking-tighter uppercase leading-none">
              {{ brand.name }} <span :style="{ color: brand.colors.primary }">{{ brand.surname }}</span>
            </h1>
            <button @click="showScheduleModal = true" class="text-neutral-500 text-[9px] font-bold uppercase underline mt-1">Ver horários</button>
          </div>
        </div>

        <!-- Botão Mobile -->
        <div class="md:hidden">
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="p-2 text-neutral-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!isMobileMenuOpen" d="M4 6h16M4 12h16M4 18h16" stroke-width="2" stroke-linecap="round"/>
              <path v-else d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="hidden md:flex items-center space-x-8 font-bold text-xs uppercase tracking-widest">
          <button @click="setTab('menu')" :class="activeTab === 'menu' ? 'text-white' : 'text-neutral-500'">Cardápio</button>
          <button @click="setTab('info')" :class="activeTab === 'info' ? 'text-white' : 'text-neutral-500'">Sobre & Contato</button>
          <button @click="handleAuthAction" class="text-amber-500 border border-white/10 px-4 py-2 rounded-full bg-white/5">Pedidos</button>
        </div>
      </div>

      <!-- Mobile Dropdown -->
      <Transition name="fade">
        <div v-if="isMobileMenuOpen" class="md:hidden bg-neutral-950 p-8 space-y-6 flex flex-col items-center">
          <button @click="setTab('menu')" class="text-lg font-black uppercase italic" :class="activeTab === 'menu' ? 'text-white' : 'text-neutral-500'">Cardápio</button>
          <button @click="setTab('info')" class="text-lg font-black uppercase italic" :class="activeTab === 'info' ? 'text-white' : 'text-neutral-500'">Sobre & Contato</button>
          <button @click="handleAuthAction(); isMobileMenuOpen = false" class="w-full bg-white/5 border border-white/10 py-4 rounded-full text-amber-500 font-black text-xs">Meus Pedidos</button>
        </div>
      </Transition>
    </nav>

    <main class="flex-1 w-full overflow-x-hidden">
      
      <!-- ABA 1: CARDÁPIO -->
      <div v-if="activeTab === 'menu'">
        <header class="relative min-h-[60vh] flex items-center overflow-hidden">
          <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center z-10 py-20 w-full">
            <div class="space-y-6 text-center md:text-left">
              <span class="font-bold tracking-[0.3em] uppercase text-sm" :style="{ color: brand.colors.primary }">{{ brand.tagline }}</span>
              <h2 class="text-5xl md:text-8xl font-black leading-[0.9] uppercase break-words">
                {{ brand.hero.title }} <br />
                <span :style="{ color: brand.colors.primary }">{{ brand.hero.highlight }}</span>
              </h2>
              <p class="text-neutral-400 text-lg max-w-md mx-auto md:mx-0">{{ brand.hero.description }}</p>
            </div>
            <div class="justify-self-center w-full max-w-[320px] md:max-w-md">
              <NuxtImg :src="brand.hero.image" class="rounded-2xl w-full shadow-2xl" preload />
            </div>
          </div>
          <div class="absolute top-0 right-0 w-1/2 h-full opacity-10 blur-[120px] -z-0" :style="{ backgroundColor: brand.colors.primary }"></div>
        </header>

        <div v-if="pending" class="flex justify-center py-20">
             <div class="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" :style="{ borderColor: brand.colors.primary }"></div>
        </div>
        
        <div v-else class="max-w-7xl mx-auto px-6 pb-24 space-y-24 w-full">
          <section v-for="category in menuByCategories" :key="category.id" :id="category.slug" class="scroll-mt-32">
            <div class="flex items-center gap-4 mb-10 border-b border-white/5 pb-4">
              <span v-if="category.icon" class="text-3xl">{{ category.icon }}</span>
              <h2 class="text-3xl md:text-5xl font-black uppercase italic">{{ category.name }}</h2>
              <div class="flex-1 h-[2px] bg-white/5"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <ProductCard v-for="product in category.products" :key="product.id" :product="product" :brand="brand" :themeColor="brand.colors.primary" :disabled="!isStoreOpen" />
            </div>
          </section>
        </div>
      </div>

      <!-- ABA 2: INFO (SOBRE E CONTATO RESTAURADOS) -->
      <div v-if="activeTab === 'info'" class="w-full">
        <!-- SEÇÃO SOBRE -->
        <section class="max-w-7xl mx-auto px-6 py-24">
          <div class="grid md:grid-cols-2 gap-16 items-center">
            <div class="relative">
              <NuxtImg :src="brand.hero.image" class="rounded-[3rem] grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl w-full" />
              <div class="absolute -bottom-6 -right-6 p-8 rounded-2xl hidden md:block text-black font-black" :style="{ backgroundColor: brand.colors.primary }">
                <span class="text-4xl italic leading-none">Since<br />{{ brand.about.since }}</span>
              </div>
            </div>
            <div class="space-y-6">
              <h2 class="text-4xl md:text-6xl font-black uppercase italic leading-none">
                {{ brand.about.title }} <span :style="{ color: brand.colors.primary }">{{ brand.about.highlight }}</span>
              </h2>
              <p class="text-neutral-400 leading-relaxed text-lg">{{ brand.about.description }}</p>
              <div class="grid grid-cols-2 gap-4 pt-4">
                <div v-for="feat in brand.about.features" :key="feat" class="border border-white/10 p-4 rounded-xl text-center">
                  <span class="font-black block text-2xl uppercase" :style="{ color: brand.colors.primary }">TOP</span>
                  <span class="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">{{ feat }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SEÇÃO CONTATO -->
        <section class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 w-full">
          <div class="bg-neutral-900/30 rounded-[3rem] p-8 md:p-16 border border-white/5 relative overflow-hidden">
            <div class="relative z-10 grid md:grid-cols-2 gap-12 text-center md:text-left">
              <div>
                <h2 class="text-4xl font-black uppercase mb-6 text-white">Manda um <span :style="{ color: brand.colors.primary }">Salve</span></h2>
                <div class="space-y-6 flex flex-col items-center md:items-start">
                  <a :href="`https://wa.me/${brand.contact.whatsapp}`" target="_blank" class="flex items-center gap-4 group">
                    <div class="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center font-bold" :style="{ color: brand.colors.primary }">WA</div>
                    <div>
                      <span class="block text-xs uppercase text-neutral-500 font-bold tracking-widest">WhatsApp</span>
                      <span class="text-white text-lg font-medium">{{ brand.contact.whatsappDisplay }}</span>
                    </div>
                  </a>
                  <a :href="brand.contact.instaLink" target="_blank" class="flex items-center gap-4 group">
                    <div class="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center font-bold" :style="{ color: brand.colors.primary }">IG</div>
                    <div>
                      <span class="block text-xs uppercase text-neutral-500 font-bold tracking-widest">Instagram</span>
                      <span class="text-white text-lg font-medium">{{ brand.contact.instagram }}</span>
                    </div>
                  </a>
                </div>
              </div>
              <div class="bg-neutral-950 rounded-[2rem] p-8 border border-white/5 flex flex-col items-center justify-center text-center">
                <span class="text-neutral-400 font-bold text-xs uppercase tracking-[0.3em] leading-relaxed italic">{{ brand.contact.location }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

    </main>

    <footer class="bg-neutral-900/50 border-t border-white/5 py-12 mt-auto">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <p class="text-white font-black uppercase tracking-widest text-[10px]">Desenvolvido por <span :style="{ color: brand.colors.primary }">Rodrigo Santiago</span></p>
      </div>
    </footer>

    <!-- MODAL DE HORÁRIOS -->
    <Transition name="fade">
      <div v-if="showScheduleModal" class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
        <div class="bg-neutral-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
          <button @click="showScheduleModal = false" class="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">✕</button>
          <h3 class="text-xl font-black uppercase italic mb-8">Horários</h3>
          <div class="space-y-1">
            <div v-for="s in brand.schedules.sort((a, b) => a.dayOfWeek - b.dayOfWeek)" :key="s.dayOfWeek" class="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
              <span class="font-bold uppercase text-[11px] tracking-[0.2em]" :class="new Date().getDay() === s.dayOfWeek ? 'text-white' : 'text-neutral-500'">{{ getDayName(s.dayOfWeek) }}</span>
              <div v-if="s.closed" class="text-[9px] font-black bg-red-500/10 text-red-500 px-3 py-1 rounded-lg uppercase">Fechado</div>
              <div v-else class="text-xs font-mono font-bold text-neutral-300">{{ s.openTime }} — {{ s.closeTime }}</div>
            </div>
          </div>
          <button @click="showScheduleModal = false" class="w-full mt-8 py-5 rounded-2xl font-black uppercase text-xs" :style="{ backgroundColor: brand.colors.primary, color: '#000' }">Fechar</button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>