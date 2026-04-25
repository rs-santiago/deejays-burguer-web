<template>
  <div class="group relative bg-neutral-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl">
    
    <div class="absolute top-4 right-4 z-20">
      <div class="bg-amber-500 text-black px-4 py-1.5 rounded-2xl font-title text-sm shadow-xl font-black flex items-center gap-1 transform group-hover:scale-110 transition-transform duration-500">
        <span class="text-[10px] opacity-70 font-sans">R$</span>
        <span>{{ typeof product.price === 'number' ? product.price.toFixed(2) : product.price }}</span>
      </div>
    </div>

    <div class="h-72 overflow-hidden">
      <NuxtImg 
        :src="product.image" 
        :alt="product.name"
        format="webp"
        class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent"></div>
    </div>

    <div class="p-8 -mt-10 relative z-10">
      <span class="text-amber-500/90 font-black uppercase text-[13px] tracking-[0.3em] mb-2 block">
        {{ product.category.name }}
      </span>

      <h3 class="text-2xl font-title uppercase italic tracking-tighter text-white mb-3 group-hover:text-amber-500 transition-colors leading-none">
        {{ product.name }}
      </h3>
      
      <p class="text-neutral-400 text-sm leading-relaxed mb-8 line-clamp-2 min-h-[40px] font-sans italic">
        {{ product.description }}
      </p>
      <div class="flex items-center justify-between mb-4">
         <span class="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">Valor Un.</span>
         <span class="text-amber-500 font-title">R$ {{ product.price }}</span>
      </div>
      <button 
        @click="orderNow(product.name, brand)"
        class="group/btn relative w-full overflow-hidden py-4 rounded-2xl transition-all duration-500 active:scale-95"
        :style="{ 
          backgroundColor: `${brand.colors.primary}1A`, // 1A adiciona 10% de opacidade no hex
          borderColor: `${brand.colors.primary}33`   // 33 adiciona 20% de opacidade
        }"
        @mouseover="(e) => e.currentTarget.style.backgroundColor = brand.colors.primary"
        @mouseleave="(e) => e.currentTarget.style.backgroundColor = `${brand.colors.primary}1A`"
      >
        <div class="relative z-10 flex items-center justify-center gap-2 font-title uppercase text-[11px] tracking-[0.25em] group-hover/btn:text-black"
            :style="{ color: brand.colors.primary }">
          <span>Lançar Pedido</span>
          <span>→</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps(['product', 'brand'])

const orderNow = (productName, brand) => {
  const phone = brand.contact.whatsapp
  const greeting = `Olá, ${brand.name} ${brand.surname}!`
  const msg = encodeURIComponent(`${greeting} Gostaria de pedir: ${productName}`)
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
}
</script>

<style scoped>
/* Keyframes mantidos para futuras animações de brilho se desejar */
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
</style>