<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="cart.isModalOpen"
        class="fixed inset-0 bg-black/95 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-neutral-900 w-full max-w-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative">

          <button @click="cart.isModalOpen = false"
            class="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">✕</button>

          <h3 class="text-xl font-black uppercase italic mb-8">Sacola <span :style="{ color: brand.colors.primary }">{{
              brand.name }}</span></h3>

          <div class="max-h-[40vh] overflow-y-auto mb-8 pr-2 custom-scrollbar">
            <div v-for="item in cart.currentCartItems" :key="item.id"
              class="flex justify-between items-center py-4 border-b border-white/5">
              <div class="flex flex-col">
                <span class="text-white font-bold text-sm">{{ item.quantity }}x {{ item.name }}</span>
                <span class="text-neutral-500 text-[10px] uppercase">R$ {{ (item.price * item.quantity).toFixed(2)
                  }}</span>
              </div>
              <button @click="cart.removeFromCart(item.id)"
                class="text-red-500/50 text-[10px] font-black uppercase px-2">Remover</button>
            </div>
          </div>

          <div class="flex justify-between items-center mb-8 bg-black/40 p-5 rounded-2xl border border-white/5">
            <span class="text-neutral-500 font-bold text-[10px] uppercase tracking-widest">Subtotal</span>
            <span class="text-white font-black text-xl">R$ {{ cart.totalPrice.toFixed(2) }}</span>
          </div>

          <div class="mb-4">
            <label class="text-neutral-500 text-[9px] uppercase tracking-[0.3em] font-black mb-3 block">Seu Nome</label>
            <input v-model="cart.customerName" type="text" placeholder="Como te chamamos?"
              class="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-white focus:border-white/30 outline-none transition-colors" />
          </div>

          <div class="mb-8">
            <label class="text-neutral-500 text-[9px] uppercase tracking-[0.3em] font-black mb-3 block">Confirme seu
              WhatsApp</label>
            <input v-model="cart.customerPhone" type="tel" placeholder="(00) 00000-0000"
              class="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-white focus:border-white/30 outline-none transition-colors font-mono" />
          </div>

          <button @click="sendOrder"
            class="w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all active:scale-95 shadow-2xl"
            :style="{ backgroundColor: brand.colors.primary, color: '#000' }">
            Finalizar Pedido
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({ brand: Object })
const cart = useCartStore()

const sendOrder = async () => {
  if (!cart.isPhoneValid || !cart.customerName) {
    return alert("Preencha nome e telefone corretamente.")
  }

  // 1. Salva no Banco de Dados primeiro
  try {
    await $fetch('/api/order/create', {
      method: 'POST',
      body: {
        brandId: props.brand.id,
        customerName: cart.customerName,
        customerPhone: cart.customerPhone,
        items: cart.currentCartItems,
        total: cart.totalPrice
      }
    })
  } catch (e) {
    console.error("Erro ao salvar pedido, mas seguindo para WhatsApp...")
  }

  let msg = `*PEDIDO - ${props.brand.name}*%0A`
  msg += `*Cliente:* ${cart.customerName}%0A`
  msg += `*Telefone:* ${cart.customerPhone}%0A`
  msg += `--------------------------%0A`
  cart.currentCartItems.forEach(i => {
    msg += `${i.quantity}x ${i.name} - R$ ${(i.price * i.quantity).toFixed(2)}%0A`
  })
  msg += `--------------------------%0A`
  msg += `*TOTAL: R$ ${cart.totalPrice.toFixed(2)}*`

  const cleanPhone = props.brand.contact.whatsapp.replace(/\D/g, '')
  window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank')
  cart.clearCurrentCart()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 10px;
}
</style>