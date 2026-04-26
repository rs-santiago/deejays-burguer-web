<template>
  <div class="group relative bg-neutral-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl">
    
    <div class="absolute top-4 right-4 z-20">
      <div class="bg-amber-500 text-black px-4 py-1.5 rounded-2xl font-title text-sm shadow-xl font-black flex items-center gap-1 transform group-hover:scale-110 transition-transform duration-500">
        <span class="text-[10px] opacity-70 font-sans">R$</span>
        <span>{{ typeof props.product.price === 'number' ? props.product.price.toFixed(2) : props.product.price }}</span>
      </div>
    </div>

    <div class="h-72 overflow-hidden">
      <NuxtImg 
        :src="props.product.image || '/img/default-props.product.png'"
        :alt="props.product.name"
        @error="(e) => e.target.src = '/img/default-props.product.png'"
        format="webp"
        class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent"></div>
    </div>

    <div class="p-8 -mt-10 relative z-10">
      <span class="text-amber-500/90 font-black uppercase text-[13px] tracking-[0.3em] mb-2 block">
        {{ props.product.category.name }}
      </span>

      <h3 class="text-2xl font-title uppercase italic tracking-tighter text-white mb-3 group-hover:text-amber-500 transition-colors leading-none">
        {{ props.product.name }}
      </h3>
      
      <p class="text-neutral-400 text-sm leading-relaxed mb-8 line-clamp-2 min-h-[40px] font-sans italic">
        {{ props.product.description }}
      </p>
      <div class="flex items-center justify-between mb-4">
         <span class="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">Valor Un.</span>
         <span class="text-amber-500 font-title">R$ {{ props.product.price }}</span>
      </div>
      <button 
        :disabled="disabled"
        @click="orderNow(props.product.name, brand)"
        class="group/btn relative w-full overflow-hidden py-4 rounded-2xl transition-all duration-500 active:scale-95"
        :style="buttonStyle"
        @mouseover="handleMouseOver"
        @mouseleave="handleMouseLeave"
      >
        <div class="relative z-10 flex items-center justify-center gap-2 font-title uppercase text-[11px] tracking-[0.25em] group-hover/btn:text-black"
            :style="{ color: props.brand.colors.primary }">
          <span>Lançar Pedido</span>
          <span>→</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
// defineProps(['product', 'brand', 'disabled'])
const props = defineProps({
  product: Object,
  brand: Object,
  disabled: Boolean // Recebe o estado isStoreOpen invertido
})
const buttonStyle = computed(() => {
  if (props.disabled) {
    return { backgroundColor: '#262626', borderColor: '#333', borderWidth: '1px' }
  }
  return { 
    backgroundColor: `${props.brand.colors.primary}1A`, 
    borderColor: `${props.brand.colors.primary}33`,
    borderWidth: '1px'
  }
})

const handleMouseOver = (e) => {
  if (!props.disabled) {
    e.currentTarget.style.backgroundColor = props.brand.colors.primary
  }
}

const handleMouseLeave = (e) => {
  if (!props.disabled) {
    e.currentTarget.style.backgroundColor = `${props.brand.colors.primary}1A`
  }
}

const orderNow = (productName, brand) => {
  if (props.disabled) return

  const phone = props.brand.contact.whatsapp
  const greeting = `Olá, ${props.brand.name} ${props.brand.surname}!`
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