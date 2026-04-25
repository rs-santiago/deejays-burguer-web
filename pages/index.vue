<script setup>
// Buscamos todas as marcas para mostrar como "Case de Sucesso"
const { data: brands, pending } = await useFetch('/api/brands')

useHead({
  title: 'MenuFlow | Cardápios Digitais de Alta Performance',
  meta: [
    { name: 'description', content: 'Leve seu restaurante para o próximo nível com a tecnologia MenuFlow.' }
  ]
})
</script>

<template>
  <div class="min-h-screen text-white font-sans selection:bg-amber-500 overflow-x-hidden"
       style="background-color: #0a0a0a;">
    
    <header class="relative pt-32 pb-24 px-6 overflow-hidden border-b border-white/5 flex flex-col items-center justify-center text-center">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full z-0 pointer-events-none"></div>

      <div class="max-w-5xl mx-auto space-y-8 relative z-10 flex flex-col items-center">
        <div class="inline-block px-4 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">
          Disponível para novos projetos
        </div>
        
        <h1 class="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white">
          Sua Marca merece um <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-200">
            Digital de Elite
          </span>
        </h1>
        
        <p class="text-amber-500 font-mono text-xs uppercase tracking-[0.3em] font-bold mt-4">
            MenuFlow: Faça o sabor fluir.
        </p>
        <p class="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
          Chega de cardápios em PDF pesados. Eu construo experiências de venda rápidas, 
          otimizadas para Google e focadas em conversão via WhatsApp.
        </p>

        <div class="flex flex-wrap justify-center gap-4 pt-8">
          <a href="https://wa.me/5521994295096" target="_blank" 
             class="bg-white text-black px-10 py-5 rounded-full font-black uppercase hover:scale-105 transition-transform shadow-2xl shadow-white/5">
            Solicitar Orçamento
          </a>
          <a href="#portfolio" class="px-10 py-5 rounded-full border border-white/10 font-black uppercase text-white hover:bg-white/5 transition-colors backdrop-blur-sm">
            Ver Demonstrações
          </a>
        </div>
      </div>
    </header>

    <section id="portfolio" class="py-24 px-6 max-w-7xl mx-auto">
      <div class="mb-16">
        <h2 class="text-3xl font-black uppercase italic tracking-tighter text-white">
          Projetos Ativos <span class="text-neutral-600 ml-2">(Demos)</span>
        </h2>
        <div class="h-1.5 w-20 bg-amber-500 mt-4 rounded-full"></div>
      </div>

      <div v-if="pending" class="text-neutral-600 font-mono italic">
        Sintonizando marcas...
      </div>

      <div v-else-if="!brands || brands.length === 0" class="text-neutral-600 font-mono italic p-8 bg-neutral-900 rounded-2xl border border-white/5">
        Nenhuma demonstração cadastrada no banco ainda. <br/>
        Rode o comando `npx prisma db seed` para popular.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <NuxtLink v-for="item in brands" :key="item.id" 
                  :to="`/${item.slug}`"
                  class="group relative aspect-[4/5] bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-amber-500/50 transition-all duration-500">
          
          <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent z-10"></div>
          
          <div class="absolute inset-0 flex flex-col justify-end p-8 z-20">
            <span class="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-2 transition-transform group-hover:-translate-y-1 inline-block">Visualizar Site</span>
            <h3 class="text-3xl font-black uppercase leading-[0.85] text-white">
              {{ item.name }}<br/>
              <span class="text-neutral-400 group-hover:text-white transition-colors">{{ item.surname }}</span>
            </h3>
            <p class="text-neutral-500 text-xs mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
              {{ item.tagline }}
            </p>
          </div>

          <NuxtImg v-if="item.heroImage" :src="item.heroImage" 
                   class="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
          <div v-else class="absolute inset-0 bg-neutral-800 flex items-center justify-center text-neutral-600 text-xs uppercase">Sem Imagem</div>
        </NuxtLink>
      </div>
    </section>

    <footer class="py-16 text-center border-t border-white/5">
      <div class="flex flex-col items-center md:items-end">
        <p class="text-white font-black uppercase tracking-widest text-[10px]">
            Desenvolvido por <span style="color: #f59e0b">Rodrigo Santiago</span>
        </p>
        <p class="text-neutral-600 text-[9px] font-mono uppercase tracking-[0.2em] mt-1">
            Powered by <span class="text-neutral-400">MenuFlow</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Garante que o scroll seja suave para os links internos */
html {
  scroll-behavior: smooth;
  background-color: #0a0a0a; /* Fallback global */
}
</style>