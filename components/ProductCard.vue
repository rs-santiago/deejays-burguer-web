<template>
  <div class="group relative bg-neutral-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl">
    
    <!-- Badge visual: Mostra se o item já está no carrinho -->
    <div v-if="itemCount > 0" class="absolute top-4 left-4 z-20">
      <div class="bg-white text-black w-8 h-8 rounded-full font-black text-sm flex items-center justify-center shadow-xl border-2 border-neutral-900">
        {{ itemCount }}
      </div>
    </div>

    <div class="absolute top-4 right-4 z-20">
      <div class="bg-amber-500 text-black px-4 py-1.5 rounded-2xl font-title text-sm shadow-xl font-black flex items-center gap-1 transform group-hover:scale-110 transition-transform duration-500">
        <span class="text-[10px] opacity-70 font-sans">R$</span>
        <span>{{ formattedPrice }}</span>
      </div>
    </div>

    <div class="h-72 overflow-hidden relative">
      <NuxtImg 
        :src="props.product.image || '/img/default-product.png'"
        :alt="props.product.name"
        @error="(e) => e.target.src = '/img/default-product.png'"
        format="webp"
        class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent"></div>
    </div>

    <div class="p-8 -mt-10 relative z-10">
      <span class="text-amber-500/90 font-black uppercase text-[13px] tracking-[0.3em] mb-2 block">
        {{ props.product.category?.name || 'Geral' }}
      </span>

      <h3 class="text-2xl font-title uppercase italic tracking-tighter text-white mb-3 group-hover:text-amber-500 transition-colors leading-none">
        {{ props.product.name }}
      </h3>
      
      <p class="text-neutral-400 text-sm leading-relaxed mb-8 line-clamp-2 min-h-[40px] font-sans italic">
        {{ props.product.description }}
      </p>

      <div class="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
         <span class="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">Valor Un.</span>
         <span class="text-amber-500 font-title">R$ {{ formattedPrice }}</span>
      </div>

      <div class="h-14">
        <!-- O botão agora é puramente visual. O clique real acontece na raiz do componente lá na tela principal -->
        <button 
          :disabled="props.disabled"
          @mouseover="handleMouseOver"
          @mouseleave="handleMouseLeave"
          class="relative w-full h-full overflow-hidden rounded-2xl transition-all duration-500 border flex items-center justify-center gap-2 font-title uppercase text-[11px] tracking-[0.25em]"
          :class="[
            props.disabled 
              ? 'bg-neutral-800 border-neutral-700 cursor-not-allowed opacity-50 text-neutral-500' 
              : 'active:scale-95'
          ]"
          :style="buttonInitialStyle"
        >
          <span class="relative z-10">{{ props.disabled ? 'Indisponível' : 'Adicionar no Carrinho' }}</span>
          <span v-if="!props.disabled" class="relative z-10">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  product: Object,
  brand: Object,
  disabled: Boolean 
})

const cart = useCartStore()

// Nova lógica do itemCount: 
// Como o cliente pode pedir 2 hambúrgueres normais e 1 sem cebola,
// precisamos SOMAR todas as quantidades desse ID específico que estão no carrinho.
const itemCount = computed(() => {
  if (!cart.currentCartItems) return 0
  return cart.currentCartItems
    .filter(i => i.id === props.product.id)
    .reduce((total, item) => total + item.quantity, 0)
})

// Formatação segura de preço
const formattedPrice = computed(() => {
  return Number(props.product.price || 0).toFixed(2)
})

// Mantida a sua lógica de cores dinâmicas da marca
const isHovered = ref(false)

const buttonInitialStyle = computed(() => {
  if (props.disabled) return {}
  
  const primaryColor = props.brand?.colors?.primary || '#F59E0B'
  return {
    backgroundColor: isHovered.value ? primaryColor : `${primaryColor}1A`,
    borderColor: `${primaryColor}33`,
    color: isHovered.value ? '#000' : primaryColor
  }
})

const handleMouseOver = () => { isHovered.value = true }
const handleMouseLeave = () => { isHovered.value = false }
</script>