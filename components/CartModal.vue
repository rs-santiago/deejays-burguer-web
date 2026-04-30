<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="cart.isModalOpen"
        class="fixed inset-0 bg-black/95 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
        <div
          class="bg-neutral-900 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative custom-scrollbar">

          <button @click="cart.isModalOpen = false"
            class="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors z-10">✕</button>

          <h3 class="text-xl font-black uppercase italic mb-8">Sacola <span :style="{ color: brand.colors.primary }">{{
              brand.name }}</span></h3>

          <div class="max-h-[30vh] overflow-y-auto mb-6 pr-2 custom-scrollbar">
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

          <div class="flex justify-between items-center mb-6 bg-black/40 p-5 rounded-2xl border border-white/5">
            <span class="text-neutral-500 font-bold text-[10px] uppercase tracking-widest">Subtotal</span>
            <span class="text-white font-black text-xl">R$ {{ cart.totalPrice.toFixed(2) }}</span>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="text-neutral-500 text-[9px] uppercase tracking-[0.3em] font-black mb-3 block">Nome</label>
              <input v-model="cart.customerName" type="text" placeholder="Seu nome"
                class="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-white/30 outline-none transition-colors" />
            </div>
            <div>
              <label
                class="text-neutral-500 text-[9px] uppercase tracking-[0.3em] font-black mb-3 block">WhatsApp</label>
              <input v-model="cart.customerPhone" type="tel" placeholder="(00) 00000-0000"
                class="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-white/30 outline-none transition-colors font-mono" />
            </div>
          </div>

          <div class="mb-6">
            <label class="text-neutral-500 text-[9px] uppercase tracking-[0.3em] font-black mb-3 block">Como deseja
              receber?</label>
            <div class="flex gap-3">
              <button @click="deliveryType = 'delivery'"
                class="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border"
                :style="deliveryType === 'delivery' ? { backgroundColor: brand.colors.primary, borderColor: brand.colors.primary, color: '#000' } : { backgroundColor: 'transparent', borderColor: '#333', color: '#888' }">
                Entrega
              </button>
              <button @click="deliveryType = 'pickup'"
                class="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border"
                :style="deliveryType === 'pickup' ? { backgroundColor: brand.colors.primary, borderColor: brand.colors.primary, color: '#000' } : { backgroundColor: 'transparent', borderColor: '#333', color: '#888' }">
                Retirada
              </button>
            </div>
          </div>

          <transition name="fade">
            <div v-if="deliveryType === 'delivery'" class="mb-6">
              <label class="text-neutral-500 text-[9px] uppercase tracking-[0.3em] font-black mb-3 block">Endereço
                Completo</label>
              <input v-model="address" type="text" placeholder="Rua, Número, Bairro, Referência"
                class="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-white/30 outline-none transition-colors" />
            </div>
          </transition>

          <div class="mb-8">
            <label class="text-neutral-500 text-[9px] uppercase tracking-[0.3em] font-black mb-3 block">Pagamento na
              entrega/retirada</label>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="method in ['PIX', 'CARTÃO', 'DINHEIRO']" :key="method" @click="paymentType = method"
                class="py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border"
                :style="paymentType === method ? { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: brand.colors.primary, color: brand.colors.primary } : { backgroundColor: 'transparent', borderColor: '#333', color: '#888' }">
                {{ method }}
              </button>
            </div>
          </div>

          <button @click="sendOrder" :disabled="isSubmitting || !isStoreOpen"
            class="w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all flex justify-center items-center shadow-2xl"
            :class="[
              isSubmitting ? 'opacity-70 cursor-not-allowed' : '',
              !isStoreOpen ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50' : 'active:scale-95'
            ]" :style="isStoreOpen ? { backgroundColor: brand.colors.primary, color: '#000' } : {}">
            <template v-if="isSubmitting">Processando...</template>
            <template v-else-if="!isStoreOpen">Loja Fechada</template>
            <template v-else>Finalizar Pedido</template>
          </button>

          <p v-if="!isStoreOpen" class="text-center text-red-500 text-[9px] font-black uppercase tracking-widest mt-4">
            Apenas consulta no momento
          </p>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  brand: Object,
  isStoreOpen: {
    type: Boolean,
    default: true
  }
})
const cart = useCartStore()

const deliveryType = ref('delivery') // 'delivery' ou 'pickup'
const paymentType = ref('PIX') // 'PIX', 'CARTÃO', 'DINHEIRO'
const address = ref('')
const isSubmitting = ref(false)

const sendOrder = async () => {

  if (!props.isStoreOpen) {
    return alert("Desculpe, a loja fechou enquanto você montava seu pedido.")
  }

  if (!cart.isPhoneValid || !cart.customerName) {
    return alert("Preencha nome e telefone corretamente.")
  }

  if (deliveryType.value === 'delivery' && address.value.trim().length < 5) {
    return alert("Por favor, preencha o endereço de entrega completo.")
  }

  isSubmitting.value = true

  // 1. Salva no Banco de Dados
  try {
    await $fetch('/api/order/create', {
      method: 'POST',
      body: {
        brandId: props.brand.id,
        customerName: cart.customerName,
        customerPhone: cart.customerPhone,
        items: cart.currentCartItems,
        total: cart.totalPrice,
        deliveryMethod: deliveryType.value,
        paymentMethod: paymentType.value,
        address: deliveryType.value === 'delivery' ? address.value : 'Retirada no Balcão'
      }
    })
  } catch (e) {
    console.error("Erro ao salvar pedido, mas seguindo para WhatsApp...")
  }

  // 2. Monta a Mensagem do WhatsApp
  let msg = `*PEDIDO - ${props.brand.name}*%0A`
  msg += `*Cliente:* ${cart.customerName}%0A`
  msg += `*Telefone:* ${cart.customerPhone}%0A`
  msg += `--------------------------%0A`
  cart.currentCartItems.forEach(i => {
    msg += `${i.quantity}x ${i.name} - R$ ${(i.price * i.quantity).toFixed(2)}%0A`
  })
  msg += `--------------------------%0A`
  msg += `*Subtotal:* R$ ${cart.totalPrice.toFixed(2)}%0A`

  // Adiciona as novas informações no zap
  msg += `%0A*MÉTODO DE ENTREGA:* ${deliveryType.value === 'delivery' ? 'Motoboy' : 'Vou Retirar'}%0A`
  if (deliveryType.value === 'delivery') {
    msg += `*Endereço:* ${address.value}%0A`
  }
  msg += `*PAGAMENTO:* ${paymentType.value}%0A`

  const cleanPhone = props.brand.contact.whatsapp.replace(/\D/g, '')
  window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank')

  cart.clearCurrentCart()
  isSubmitting.value = false
  cart.isModalOpen = false // Fecha o modal após enviar
}
</script>

<style scoped>
/* Mesmos estilos que você já tinha */
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