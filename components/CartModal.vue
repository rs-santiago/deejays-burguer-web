<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="cart.isModalOpen"
        class="fixed inset-0 bg-black/95 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
        <div
          class="bg-neutral-900 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative custom-scrollbar">

          <button @click="cart.isModalOpen = false"
            class="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors z-10">✕</button>

          <h3 class="text-xl font-black uppercase italic mb-8">Sacola <span :style="{ color: brand.colors.primary }">{{ brand.name }}</span></h3>

          <!-- AVISO VISUAL DE MESA -->
          <div v-if="cart.mesa" class="mb-6 flex items-center justify-center py-3 rounded-xl border border-amber-500/30 bg-amber-500/10">
            <span class="text-amber-500 font-black uppercase tracking-[0.2em] text-[11px]">
              📍 Atendimento na Mesa {{ cart.mesa }}
            </span>
          </div>

          <div class="max-h-[30vh] overflow-y-auto mb-6 pr-2 custom-scrollbar">
            <div v-for="item in cart.currentCartItems" :key="item.cartItemId"
              class="flex justify-between items-start py-4 border-b border-white/5">
              
              <div class="flex flex-col flex-1 pr-4">
                <span class="text-white font-bold text-sm">{{ item.quantity }}x {{ item.name }}</span>
                <!-- Exibe a observação se existir -->
                <span v-if="item.observation" class="receipt-observation">
                  Obs: {{ item.observation }}
                </span>
                <span class="text-neutral-500 text-[10px] uppercase mt-1">
                  R$ {{ (item.price * item.quantity).toFixed(2) }}
                </span>
              </div>
              
              <button @click="cart.removeFromCart(item.cartItemId)"
                class="text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase px-2 py-1 mt-1 transition-colors">
                Remover
              </button>
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
              <label class="text-neutral-500 text-[9px] uppercase tracking-[0.3em] font-black mb-3 block">WhatsApp</label>
              <input v-model="cart.customerPhone" type="tel" placeholder="(00) 00000-0000"
                class="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-white/30 outline-none transition-colors font-mono" />
            </div>
          </div>

          <!-- SÓ EXIBE ENTREGA/RETIRADA SE NÃO ESTIVER EM UMA MESA -->
          <template v-if="!cart.mesa">
            <div class="mb-6">
              <label class="text-neutral-500 text-[9px] uppercase tracking-[0.3em] font-black mb-3 block">Como deseja receber?</label>
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
                <label class="text-neutral-500 text-[9px] uppercase tracking-[0.3em] font-black mb-3 block">Endereço Completo</label>
                <input v-model="cart.customerAddress" type="text" placeholder="Rua, Número, Bairro, Referência"
                  class="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-white/30 outline-none transition-colors" />
              </div>
            </transition>
          </template>

          <!-- PAGAMENTO ADAPTADO PARA MESA -->
          <div class="mb-8">
            <label class="text-neutral-500 text-[9px] uppercase tracking-[0.3em] font-black mb-3 block">
              {{ cart.mesa ? 'Forma de Pagamento' : 'Pagamento na entrega/retirada' }}
            </label>
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
import { useCartStore } from '~/stores/cart' // Ajuste o caminho se necessário
import { FetchError } from 'ofetch'


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
const isSubmitting = ref(false)

const sendOrder = async () => {

  if (!props.isStoreOpen) {
    return alert("Desculpe, a loja fechou enquanto você montava seu pedido.")
  }

  if (!cart.isPhoneValid || !cart.customerName) {
    return alert("Preencha nome e telefone corretamente.")
  }

  // Só valida o endereço se NÃO for mesa e for delivery
  if (!cart.mesa && deliveryType.value === 'delivery' && cart.customerAddress.trim().length < 10) {
    return alert("Por favor, preencha o endereço de entrega completo (rua, número, bairro).")
  }

  isSubmitting.value = true

  // 1. Tenta salvar o pedido no banco de dados (com validação de distância)
  try {
    // Prepara o corpo da requisição
    const orderPayload = {
      brandId: props.brand?.id || props.brand?.brandId,
      customerName: cart.customerName,
      customerPhone: cart.customerPhone.replace(/\D/g, ''),
      items: cart.currentCartItems,
      total: cart.totalPrice,
      paymentMethod: paymentType.value,
      // Campos que dependem do tipo de atendimento
      deliveryMethod: cart.mesa ? 'MESA' : deliveryType.value,
      customerAddress: deliveryType.value === 'delivery' ? cart.customerAddress : null,
      mesa: cart.mesa || null
    }

    await $fetch('/api/orders/create', {
      method: 'POST',
      body: orderPayload
    })

  } catch (error) {
    isSubmitting.value = false
    if (error instanceof FetchError) {
      console.error("Erro ao criar pedido:", error.data)

      // Se o erro for de validação de distância (403) ou endereço não encontrado (400),
      // exibe a mensagem específica vinda do backend.
      if ((error.statusCode === 403 || error.statusCode === 400) && error.data?.message) {
        return alert(error.data.message)
      }
    } else {
      console.error("Erro inesperado:", error)
    }

  // Para outros erros, exibe uma mensagem genérica.
  return alert('Ocorreu um erro inesperado ao processar seu pedido. Por favor, tente novamente.')
}

  // 2. Se o pedido foi salvo com sucesso, monta a Mensagem do WhatsApp
  let msg = `*PEDIDO - ${props.brand.name}*%0A`
  msg += `*Cliente:* ${cart.customerName}%0A`
  msg += `*Telefone:* ${cart.customerPhone.replace(/\D/g, '')}%0A`
  msg += `--------------------------%0A`
  cart.currentCartItems.forEach(i => {
    msg += `*${i.quantity}x ${i.name}* - R$ ${(i.price * i.quantity).toFixed(2)}%0A`
    if (i.observation) {
      msg += `> _Obs: ${i.observation}_%0A`
    }
  })
  msg += `--------------------------%0A`
  msg += `*Subtotal:* R$ ${cart.totalPrice.toFixed(2)}%0A%0A`

  // Adapta o texto do WhatsApp para a mesa
  if (cart.mesa) {
    msg += `📍 *ATENDIMENTO:* Mesa ${cart.mesa}%0A`
  } else {
    msg += `*MÉTODO DE ENTREGA:* ${deliveryType.value === 'delivery' ? 'Motoboy' : 'Vou Retirar'}%0A`
    if (deliveryType.value === 'delivery') {
      msg += `*Endereço:* ${cart.customerAddress}%0A`
    }
  }
  msg += `*PAGAMENTO:* ${paymentType.value}%0A`

  const cleanPhone = props.brand.contact.whatsapp.replace(/\D/g, '')
  window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank')

  cart.clearCurrentCart()
  isSubmitting.value = false
  cart.isModalOpen = false
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

@media print {
  /* 1. Zera todas as margens da página do navegador */
  @page {
    size: 72mm auto; /* Força a largura para 72mm */
    margin: 0 !important;
  }

  html, body {
    width: 72mm !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    color: #000 !important;
    font-family: monospace, 'Courier New', sans-serif; /* Fontes monospace alinham melhor em térmicas */
  }

  /* 2. Container Principal ocupa 100% da largura útil */
  .receipt-container {
    width: 100% !important;
    max-width: 72mm !important;
    padding: 4px 0 !important; /* Mínimo recuo interno */
    margin: 0 !important;
    box-sizing: border-box;
  }
}

/* --- ESTILOS VISUAIS DO CUPOM --- */

/* Observação bem destacada em caixa preta com texto branco ou negrito grande */
.receipt-observation {
  display: block;
  font-size: 14px !important;
  font-weight: 900 !important;
  text-transform: uppercase;
  background-color: #000 !important;
  color: #fff !important;
  padding: 3px 6px !important;
  margin-top: 4px !important;
  margin-bottom: 6px !important;
  border-radius: 4px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
</style>