<template>
  <transition name="slide-up">
    <div v-if="cart.totalItems > 0 && !cart.isModalOpen" 
         class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#F59E0B] p-4 rounded-[2rem] flex justify-between items-center shadow-2xl z-50">
      
      <div class="flex flex-col ml-4">
        <span class="text-black font-black text-[10px] uppercase tracking-widest opacity-75">Sua sacola</span>
        <div class="flex items-center gap-2">
          <span class="text-black font-black text-xl leading-none">R$ {{ cart.totalPrice.toFixed(2) }}</span>
        </div>
      </div>

      <button 
        @click="cart.isModalOpen = true" 
        class="bg-black text-white px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-transform"
      >
        Revisar
      </button>
    </div>
  </transition>
</template>

<script setup>
const cart = useCartStore()
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translate(-50%, 100px); opacity: 0; }
</style>