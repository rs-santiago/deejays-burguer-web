<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="cart.isHistoryOpen"
        class="fixed inset-0 bg-black/95 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-neutral-900 w-full max-w-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative">

          <button @click="cart.isHistoryOpen = false"
            class="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">✕</button>

          <div v-if="!cart.customerPhone" class="py-6">
            <h3 class="text-xl font-black uppercase italic mb-4 tracking-tighter">
              Acessar <span class="text-amber-500">Pedidos</span>
            </h3>
            <p class="text-neutral-500 text-[11px] uppercase tracking-widest font-bold mb-8 leading-relaxed">
              Digite seu WhatsApp para identificar seu histórico
            </p>

            <div class="space-y-4">
              <input v-model="localPhone" type="text" inputmode="numeric" placeholder="(00) 00000-0000" maxlength="15"
                class="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-white focus:border-amber-500/50 outline-none transition-colors font-mono" />
              <button @click="handleLogin"
                class="w-full py-5 rounded-2xl bg-amber-500 text-black font-black uppercase text-[10px] tracking-[0.2em] hover:bg-amber-400 transition-all active:scale-95 shadow-xl shadow-amber-500/5">
                Ver Meu Histórico
              </button>
            </div>
          </div>

          <div v-else>
            <h3 class="text-xl font-black uppercase italic mb-8 tracking-tighter">
              Meu <span class="text-amber-500">Histórico</span>
            </h3>

            <div v-if="cart.orderHistory.length > 0"
              class="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar space-y-4 text-left">
              <div v-for="order in cart.orderHistory" :key="order.id"
                class="bg-black/40 border border-white/5 rounded-[2rem] p-6">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <span class="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em] block mb-1">
                      {{ new Date(order.createdAt).toLocaleDateString('pt-BR') }}
                    </span>
                    <span class="text-white font-black text-sm uppercase leading-none">
                      {{ order.brand.name }} {{ order.brand.surname }}
                    </span>
                  </div>
                  <span
                    class="bg-amber-500 text-black text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter">
                    {{ order.status }}
                  </span>
                </div>

                <div class="border-t border-white/5 pt-4 mt-4 space-y-2">
                  <div v-for="item in order.items" :key="item.id"
                    class="text-neutral-400 text-[11px] flex justify-between font-sans">
                    <span>{{ item.quantity }}x {{ item.name }}</span>
                    <span>R$ {{ (item.price * item.quantity).toFixed(2) }}</span>
                  </div>

                  <div
                    class="flex justify-between mt-4 pt-4 border-t border-white/5 font-black text-white text-xs tracking-widest">
                    <span>TOTAL</span>
                    <span class="text-amber-500 text-sm italic">R$ {{ order.total.toFixed(2) }}</span>
                  </div>

                  <button @click="isStoreOpen ? cart.repeatOrder(order.items) : null" :disabled="!isStoreOpen" :class="[
                    'w-full mt-6 py-4 rounded-2xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all',
                    isStoreOpen
                      ? 'border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black cursor-pointer'
                      : 'border-neutral-800 text-neutral-600 cursor-not-allowed opacity-50'
                  ]">
                    <span v-if="isStoreOpen">Repetir este pedido ↺</span>
                    <span v-else>Loja fechada no momento</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="py-10 text-center">
              <p class="text-neutral-500 text-sm italic font-sans">Nenhum pedido vinculado a este número.</p>
            </div>

            <div class="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-3">
              <p class="text-neutral-600 text-[9px] uppercase tracking-[0.2em] font-black">
                Conectado: {{ cart.customerPhone }}
              </p>
              <button @click="handleLogout"
                class="text-red-500/40 hover:text-red-500 text-[9px] font-black uppercase tracking-widest transition-colors">
                Sair ou trocar de conta
              </button>
            </div>
          </div>

        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
const cart = useCartStore()

const props = defineProps({
  isStoreOpen: {
    type: Boolean,
    default: true
  }
})

// Variável local para não "sujar" o store durante a digitação
const localPhone = ref('')

// Função para aplicar máscara de telefone (ex: (21) 99429-5096)
const formatPhoneInput = (value) => {
  let val = value.replace(/\D/g, '') // Remove tudo que não é número
  if (val.length > 11) val = val.slice(0, 11) // Limita a 11 dígitos

  if (val.length > 10) {
    // Formato Celular: (00) 00000-0000
    return val.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (val.length > 5) {
    // Formato Fixo: (00) 0000-0000
    return val.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else if (val.length > 2) {
    return val.replace(/(\d{2})(\d{0,5})/, '($1) $2')
  } else if (val.length > 0) {
    return val.replace(/(\d{0,2})/, '($1')
  }
  return val
}

// Watcher para formatar enquanto o usuário digita
watch(localPhone, (newVal) => {
  localPhone.value = formatPhoneInput(newVal)
})

const handleLogin = async () => {
  const cleanPhone = localPhone.value.replace(/\D/g, '')

  // Validação: 
  // 1. Deve ter pelo menos 10 dígitos (DDD + 8 números) ou 11 (DDD + 9 números)
  // 2. Não pode ser sequências bobas como "0000000000"
  const invalidSequences = ['00000000000', '11111111111', '12345678901']

  if (cleanPhone.length < 10 || invalidSequences.includes(cleanPhone)) {
    alert("⚠️ Por favor, insira um número de WhatsApp válido com DDD.")
    return
  }

  // Se passou na validação, envia para o Store e busca o histórico
  cart.customerPhone = localPhone.value
  await cart.fetchHistory()
}

const handleLogout = () => {
  localPhone.value = '' // Limpa o rascunho local
  cart.logout()         // Limpa o store
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
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #262626;
  border-radius: 10px;
}
</style>