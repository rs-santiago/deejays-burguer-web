<script setup>
import { ref, computed, watch } from 'vue'
import ProductCard from '../components/ProductCard.vue'

// Fetch dos produtos da nossa API Prisma
const [
  { data: products, pending: productsPending, error: productsError }, 
  { data: categoriesData, pending: catsPending, error: catsError }
] = await Promise.all([
  useFetch('/api/products'),
  useFetch('/api/categories')
])

// Criamos variáveis unificadas para o template não reclamar
const pending = computed(() => productsPending.value || catsPending.value)
const error = computed(() => productsError.value || catsError.value)

// Filtros
const selectedCategory = ref('all')

const categories = computed(() => {
  const dynamicCats = categoriesData.value?.map(c => ({ id: c.slug, name: c.name })) || []
  return [{ id: 'all', name: 'Todos' }, ...dynamicCats]
})

// Lógica de filtragem reativa
const filteredProducts = computed(() => {
  if (!products.value) return []
  if (selectedCategory.value === 'all') return products.value
  return products.value.filter(p => 
    p.category.slug.toLowerCase() === selectedCategory.value.toLowerCase()
  )
})

// Debug no console do navegador
watch(products, (val) => {
  if (val) console.log('🔥 Cardápio carregado:', val.length, 'itens encontrados.')
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-white font-sans scroll-smooth">
    
    <nav class="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
      <div class="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <h1 class="text-2xl font-black tracking-tighter uppercase">
          Deejays <span class="text-amber-500">Burguer</span>
        </h1>
        <div class="space-x-8 hidden md:flex font-medium text-sm uppercase tracking-widest">
          <a href="#menu" class="hover:text-amber-500 transition">Cardápio</a>
          <a href="#about" class="hover:text-amber-500 transition">Sobre</a>
          <a href="#contact" class="hover:text-amber-500 transition text-neutral-500">Contato</a>
        </div>
      </div>
    </nav>

    <header class="relative min-h-[80vh] flex items-center overflow-hidden">
      <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center z-10 py-20">
        <div class="space-y-6 text-center md:text-left">
          <span class="text-amber-500 font-bold tracking-[0.3em] uppercase text-sm">
            Sabor • Qualidade • Atitude
          </span>
          <h2 class="text-6xl md:text-8xl font-black leading-[0.9] uppercase">
            O Beat <br /> <span class="text-amber-500">Perfeito</span>
          </h2>
          <p class="text-neutral-400 text-lg max-w-md mx-auto md:mx-0">
            Hambúrgueres artesanais com o ritmo que o seu paladar merece.
          </p>
          <div class="pt-4">
            <a href="#menu" class="bg-amber-500 hover:bg-amber-600 text-black px-10 py-5 rounded-full font-black uppercase transition-all transform hover:scale-105 inline-block shadow-[0_10px_30px_rgba(245,158,11,0.3)]">
              Ver Cardápio
            </a>
          </div>
        </div>
        
        <div class="relative group justify-self-center">
          <NuxtImg 
            src="/img/hero-burger.png" 
            alt="Double Beat"
            format="webp"
            class="rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.15)] transform group-hover:rotate-1 transition-transform duration-700 w-full max-w-lg" 
            preload
          />
        </div>
      </div>
      <div class="absolute top-0 right-0 w-1/2 h-full bg-amber-500/5 blur-[120px] -z-0"></div>
    </header>

    <section id="menu" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
      <div class="text-center mb-12">
        <h2 class="text-4xl md:text-6xl font-black uppercase mb-4">
          Nosso <span class="text-amber-500">Cardápio</span>
        </h2>
        <p class="text-neutral-500 uppercase tracking-[0.2em] text-xs font-bold">As faixas mais pedidas da casa</p>
      </div>

      <div class="flex justify-center gap-3 mb-16">
        <button 
          v-for="cat in categories" 
          :key="cat.id"
          @click="selectedCategory = cat.id"
          :class="[
            'px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border',
            selectedCategory === cat.id 
              ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20' 
              : 'bg-transparent border-neutral-800 text-neutral-500 hover:border-neutral-600'
          ]"
        >
          {{ cat.name }}
        </button>
      </div>

      <div v-if="pending" class="flex justify-center py-20">
        <div class="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="error" class="text-center py-20 text-red-500">
        Erro ao conectar com a cozinha. Tente novamente!
      </div>

      <div v-else>
        <div v-if="filteredProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <ProductCard 
            v-for="item in filteredProducts" 
            :key="item.id" 
            :product="item"
          />
        </div>
        <div v-else class="text-center py-20 text-neutral-500 italic">
          Nenhum item encontrado nesta categoria.
        </div>
      </div>
    </section>

    <section id="about" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
      <div class="grid md:grid-cols-2 gap-16 items-center">
        <div class="relative">
          <NuxtImg 
            src="/img/hero-burger.png" 
            class="rounded-[3rem] grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl"
          />
          <div class="absolute -bottom-6 -right-6 bg-amber-500 p-8 rounded-2xl hidden md:block">
            <span class="text-black font-title text-4xl italic leading-none">Since<br/>2024</span>
          </div>
        </div>
        
        <div class="space-y-6">
          <h2 class="text-4xl md:text-6xl font-title uppercase italic leading-none">
            Nossa <span class="text-amber-500">Vibe</span>
          </h2>
          <p class="text-neutral-400 leading-relaxed text-lg">
            O <span class="text-white font-bold">Deejays Burguer</span> nasceu da união entre a precisão das batidas e a arte da culinária artesanal. Não fazemos apenas lanches, criamos experiências sensoriais onde cada ingrediente é uma nota no beat perfeito.
          </p>
          <p class="text-neutral-500">
            Localizados em Guadalupe, trazemos a essência urbana e o rigor da qualidade para o seu paladar. Se o som é bom, o sabor tem que ser inesquecível.
          </p>
          <div class="grid grid-cols-2 gap-4 pt-4">
            <div class="border border-white/10 p-4 rounded-xl">
              <span class="text-amber-500 font-black block text-2xl">100%</span>
              <span class="text-neutral-500 text-[10px] uppercase tracking-widest">Artesanal</span>
            </div>
            <div class="border border-white/10 p-4 rounded-xl">
              <span class="text-amber-500 font-black block text-2xl">Premium</span>
              <span class="text-neutral-500 text-[10px] uppercase tracking-widest">Ingredientes</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="contact" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
      <div class="bg-neutral-900/30 rounded-[3rem] p-8 md:p-16 border border-white/5 relative overflow-hidden">
        <div class="relative z-10 grid md:grid-cols-2 gap-12">
          <div>
            <h2 class="text-4xl font-title uppercase mb-6">Manda um <span class="text-amber-500">Salve</span></h2>
            <p class="text-neutral-400 mb-8">Dúvidas, eventos ou apenas quer bater um papo sobre o melhor beat da cidade?</p>
            
            <div class="space-y-6">
              <a href="https://wa.me/5521994295096" target="_blank" class="flex items-center gap-4 group">
                <div class="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                  <span class="text-amber-500 group-hover:text-black">WA</span>
                </div>
                <div>
                  <span class="block text-xs uppercase text-neutral-500 font-bold">WhatsApp</span>
                  <span class="text-white">(21) 99429-5096</span>
                </div>
              </a>

              <a href="https://www.instagram.com/deejaysburg" target="_blank" class="flex items-center gap-4 group">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                    <span class="text-amber-500 group-hover:text-black">IG</span>
                  </div>
                  <div>
                    <span class="block text-xs uppercase text-neutral-500 font-bold">Instagram</span>
                    <span class="text-white">@deejaysburguer</span>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div class="bg-neutral-950 rounded-[2rem] p-2 border border-white/5 h-64 md:h-full min-h-[300px]">
            <div class="w-full h-full rounded-[1.8rem] bg-neutral-900 flex items-center justify-center border border-white/5">
              <span class="text-neutral-600 font-title text-xs uppercase tracking-[0.3em]">Guadalupe • Rio de Janeiro</span>
            </div>
          </div>
        </div>
        
        <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full"></div>
      </div>
    </section>    

    <footer class="bg-neutral-900/50 border-t border-white/5 py-12">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <p class="text-neutral-500 text-xs font-mono">GUADALUPE • RJ</p>
        <p class="text-white font-black uppercase tracking-widest text-[10px]">
          Dev: Rodrigo Santiago | <span class="text-amber-500 italic">Fullstack Case</span>
        </p>
      </div>
    </footer>

  </div>
</template>

<style>
html { scroll-behavior: smooth; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>