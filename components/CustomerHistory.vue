<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="cart.isHistoryOpen"
        class="fixed inset-0 bg-black/95 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-neutral-900 w-full max-w-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative flex flex-col max-h-[90vh]">

          <button @click="cart.isHistoryOpen = false"
            class="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">✕</button>

          <!-- ESTADO: DESLOGADO -->
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

          <!-- ESTADO: LOGADO -->
          <div v-else class="flex flex-col h-full overflow-hidden">
            <h3 class="text-xl font-black uppercase italic mb-6 tracking-tighter">
              Meu <span class="text-amber-500">Histórico</span>
            </h3>

            <div v-if="cart.orderHistory.length > 0" class="overflow-y-auto pr-2 custom-scrollbar space-y-8 text-left">
              
              <!-- SEÇÃO: EM ANDAMENTO (Pulse animado para indicar atividade) -->
              <div v-if="activeOrders.length > 0" class="space-y-4">
                <div class="flex items-center gap-3 ml-2">
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Em andamento</h4>
                </div>
                
                <div v-for="order in activeOrders" :key="order.id" class="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <span class="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em] block mb-1">
                        {{ new Date(order.createdAt).toLocaleDateString('pt-BR') }}
                      </span>
                      <span class="text-white font-black text-sm uppercase leading-none">
                        {{ order.brand.name }} {{ order.brand.surname }}
                      </span>
                    </div>
                    <span :style="{ backgroundColor: getStatusConfig(order.status).bg, color: getStatusConfig(order.status).color }"
                      class="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter transition-colors">
                      {{ getStatusConfig(order.status).label }}
                    </span>
                  </div>

                  <div class="border-t border-white/5 pt-4 mt-4 space-y-2">
                    <div v-for="item in order.items" :key="item.id" class="text-neutral-400 text-[11px] flex justify-between font-sans">
                      <span>{{ item.quantity }}x {{ item.name }}</span>
                      <span>R$ {{ (item.price * item.quantity).toFixed(2) }}</span>
                    </div>

                    <div class="flex justify-between mt-4 pt-4 border-t border-white/5 font-black text-white text-xs tracking-widest">
                      <span>TOTAL</span>
                      <span class="text-amber-500 text-sm italic">R$ {{ order.total.toFixed(2) }}</span>
                    </div>

                    <button @click="isStoreOpen ? cart.repeatOrder(order.items) : null" :disabled="!isStoreOpen" 
                      :class="['w-full mt-6 py-4 rounded-2xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all', 
                      isStoreOpen ? 'border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black cursor-pointer' : 'border-neutral-800 text-neutral-600 cursor-not-allowed opacity-50']">
                      <span v-if="isStoreOpen">Repetir este pedido ↺</span>
                      <span v-else>Loja fechada no momento</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- SEÇÃO: ANTERIORES (Opacidade reduzida para hierarquia) -->
              <div v-if="completedOrders.length > 0" class="space-y-4">
                <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-700 ml-2">Anteriores</h4>
                
                <div v-for="order in completedOrders" :key="order.id" class="bg-black/40 border border-white/5 rounded-[2rem] p-6 opacity-70">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <span class="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em] block mb-1">
                        {{ new Date(order.createdAt).toLocaleDateString('pt-BR') }}
                      </span>
                      <span class="text-white font-black text-sm uppercase leading-none">
                        {{ order.brand.name }} {{ order.brand.surname }}
                      </span>
                    </div>
                    <span :style="{ backgroundColor: getStatusConfig(order.status).bg, color: getStatusConfig(order.status).color }"
                      class="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter opacity-80">
                      {{ getStatusConfig(order.status).label }}
                    </span>
                  </div>

                  <div class="border-t border-white/5 pt-4 mt-4 space-y-2">
                    <div v-for="item in order.items" :key="item.id" class="text-neutral-500 text-[11px] flex justify-between font-sans">
                      <span>{{ item.quantity }}x {{ item.name }}</span>
                    </div>

                    <div class="flex justify-between mt-4 pt-4 border-t border-white/5 font-black text-neutral-400 text-[10px] tracking-widest">
                      <span>TOTAL</span>
                      <span class="italic">R$ {{ order.total.toFixed(2) }}</span>
                    </div>

                    <button @click="isStoreOpen ? cart.repeatOrder(order.items) : null" :disabled="!isStoreOpen"
                      class="w-full mt-6 py-4 rounded-2xl border border-white/5 text-neutral-600 text-[9px] font-black uppercase tracking-[0.2em] hover:border-amber-500/20 hover:text-amber-500 transition-all">
                      Repetir este pedido ↺
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- VAZIO -->
            <div v-else class="py-10 text-center">
              <p class="text-neutral-500 text-sm italic font-sans">Nenhum pedido vinculado a este número.</p>
            </div>

            <!-- FOOTER -->
            <div class="mt-auto pt-6 border-t border-white/5 flex flex-col items-center gap-3">
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
import { ref, watch, computed } from 'vue'
const cart = useCartStore()

const props = defineProps({
  isStoreOpen: {
    type: Boolean,
    default: true
  }
})

// AGRUPAMENTO DE PEDIDOS
const activeOrders = computed(() => {
  return cart.orderHistory.filter(o => !['DELIVERED', 'CANCELLED', 'CONCLUIDO'].includes(o.status.toUpperCase()))
})

const completedOrders = computed(() => {
  return cart.orderHistory.filter(o => ['DELIVERED', 'CANCELLED', 'CONCLUIDO'].includes(o.status.toUpperCase()))
})

// CORES DINÂMICAS POR STATUS
const getStatusConfig = (status) => {
  const s = status.toUpperCase()
  if (s === 'PENDING' || s === 'PENDENTE') 
    return { label: 'Aguardando', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' }
  if (s === 'PREPARING' || s === 'PREPARANDO') 
    return { label: 'Na Cozinha', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' }
  if (s === 'DISPATCHED' || s === 'SAIU' || s === 'EM ROTA') 
    return { label: 'Em Rota', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' }
  if (s === 'DELIVERED' || s === 'CONCLUIDO') 
    return { label: 'Entregue', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' }
  if (s === 'CANCELLED' || s === 'CANCELADO') 
    return { label: 'Cancelado', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' }
  return { label: status, color: '#666', bg: '#222' }
}

const localPhone = ref('')

const formatPhoneInput = (value) => {
  let val = value.replace(/\D/g, '')
  if (val.length > 11) val = val.slice(0, 11)
  if (val.length > 10) return val.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  else if (val.length > 5) return val.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  else if (val.length > 2) return val.replace(/(\d{2})(\d{0,5})/, '($1) $2')
  else if (val.length > 0) return val.replace(/(\d{0,2})/, '($1')
  return val
}

watch(localPhone, (newVal) => {
  localPhone.value = formatPhoneInput(newVal)
})

const handleLogin = async () => {
  const cleanPhone = localPhone.value.replace(/\D/g, '')
  const invalidSequences = ['00000000000', '11111111111', '12345678901']
  if (cleanPhone.length < 10 || invalidSequences.includes(cleanPhone)) {
    alert("⚠️ Por favor, insira um número de WhatsApp válido com DDD.")
    return
  }
  cart.customerPhone = localPhone.value
  await cart.fetchHistory()
}

const handleLogout = () => {
  localPhone.value = ''
  cart.logout()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }
</style>