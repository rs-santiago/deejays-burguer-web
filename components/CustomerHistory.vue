<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="cart.isHistoryOpen"
        class="fixed inset-0 bg-black/95 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-neutral-900 w-full max-w-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative flex flex-col max-h-[90vh] min-h-[60vh]">

          <button @click="closeModal"
            class="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors z-20">✕</button>

          <!-- ESTADO 1: DESLOGADO -->
          <div v-if="!cart.customerPhone" class="py-6 flex-1 flex flex-col justify-center">
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

          <!-- ESTADO 2: LOGADO -->
          <div v-else class="flex flex-col h-full overflow-hidden flex-1">
            
            <!-- Agrupador de Transição: Troca suave entre Lista e Detalhes -->
            <transition name="slide" mode="out-in">
              
              <!-- TELA A: LISTA DE PEDIDOS -->
              <div v-if="!selectedOrder" key="list-view" class="flex flex-col h-full overflow-hidden">
                <h3 class="text-xl font-black uppercase italic mb-6 tracking-tighter shrink-0">
                  Meu <span class="text-amber-500">Histórico</span>
                </h3>

                <div v-if="cart.orderHistory.length > 0" class="overflow-y-auto pr-2 custom-scrollbar space-y-8 text-left flex-1">
                  
                  <!-- SEÇÃO: EM ANDAMENTO -->
                  <div v-if="activeOrders.length > 0" class="space-y-4">
                    <div class="flex items-center gap-3 ml-2">
                      <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Em andamento</h4>
                    </div>
                    
                    <div v-for="order in activeOrders" :key="order.id" class="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                      <div class="flex justify-between items-start mb-4">
                        <div>
                          <span class="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em] block mb-1">
                            {{ new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                          </span>
                          <span class="text-white font-black text-sm uppercase leading-none">
                            Pedido #{{ order.displayId || '---' }}
                          </span>
                        </div>
                        <span :style="{ backgroundColor: getStatusConfig(order.status).bg, color: getStatusConfig(order.status).color }"
                          class="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter transition-colors">
                          {{ getStatusConfig(order.status).label }}
                        </span>
                      </div>

                      <div class="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
                        <div class="flex flex-col">
                          <span class="text-neutral-400 text-[10px] uppercase tracking-widest font-bold">{{ order.itemsCount || order.items?.length || 0 }} itens</span>
                          <span class="text-amber-500 text-sm font-black italic">R$ {{ order.total.toFixed(2) }}</span>
                        </div>
                        <button @click="selectedOrder = order" class="text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">
                          Detalhes
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- SEÇÃO: ANTERIORES -->
                  <div v-if="completedOrders.length > 0" class="space-y-4">
                    <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-700 ml-2">Anteriores</h4>
                    
                    <div v-for="order in completedOrders" :key="order.id" class="bg-black/40 border border-white/5 rounded-[2rem] p-6 opacity-80">
                      <div class="flex justify-between items-start mb-4">
                        <div>
                          <span class="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em] block mb-1">
                            {{ new Date(order.createdAt).toLocaleDateString('pt-BR') }}
                          </span>
                          <span class="text-white font-black text-sm uppercase leading-none">
                            Pedido #{{ order.displayId || '---' }}
                          </span>
                        </div>
                        <span :style="{ backgroundColor: getStatusConfig(order.status).bg, color: getStatusConfig(order.status).color }"
                          class="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter opacity-80">
                          {{ getStatusConfig(order.status).label }}
                        </span>
                      </div>

                      <div class="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
                        <div class="flex flex-col">
                          <span class="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">{{ order.itemsCount || order.items?.length || 0 }} itens</span>
                          <span class="text-neutral-300 text-sm font-black italic">R$ {{ order.total.toFixed(2) }}</span>
                        </div>
                        <button @click="selectedOrder = order" class="text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">
                          Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="py-10 text-center flex-1 flex flex-col justify-center">
                  <p class="text-neutral-500 text-sm italic font-sans">Nenhum pedido vinculado a este número.</p>
                </div>

                <!-- FOOTER DA LISTA -->
                <div class="mt-4 pt-6 border-t border-white/5 flex flex-col items-center gap-3 shrink-0">
                  <p class="text-neutral-600 text-[9px] uppercase tracking-[0.2em] font-black">
                    Conectado: {{ cart.customerPhone }}
                  </p>
                  <button @click="handleLogout"
                    class="text-red-500/40 hover:text-red-500 text-[9px] font-black uppercase tracking-widest transition-colors">
                    Sair ou trocar de conta
                  </button>
                </div>
              </div>

              <!-- TELA B: DETALHES DO PEDIDO SELECIONADO -->
              <div v-else key="details-view" class="flex flex-col h-full overflow-hidden">
                
                <div class="flex items-center gap-4 mb-8 shrink-0">
                  <button @click="selectedOrder = null" class="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  </button>
                  <div>
                    <h3 class="text-xl font-black uppercase italic tracking-tighter leading-none">
                      Detalhes
                    </h3>
                    <span class="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Pedido #{{ selectedOrder.displayId }}</span>
                  </div>
                </div>

                <div class="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-6">
                  
                  <!-- Cabecalho do Pedido -->
                  <div class="bg-black/40 border border-white/5 rounded-2xl p-5 flex justify-between items-center">
                    <div>
                      <span class="text-[9px] text-neutral-500 font-black uppercase tracking-[0.2em] block mb-1">Status Atual</span>
                      <span :style="{ color: getStatusConfig(selectedOrder.status).color }" class="font-black text-sm uppercase tracking-tighter">
                        {{ getStatusConfig(selectedOrder.status).label }}
                      </span>
                    </div>
                    <div class="text-right">
                      <span class="text-[9px] text-neutral-500 font-black uppercase tracking-[0.2em] block mb-1">Data</span>
                      <span class="text-white font-bold text-xs">{{ new Date(selectedOrder.createdAt).toLocaleDateString('pt-BR') }}</span>
                    </div>
                  </div>

                  <!-- NOVA SEÇÃO: Entrega e Pagamento -->
                  <div class="bg-black/40 border border-white/5 rounded-2xl p-5">
                    <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-4">Informações</h4>
                    
                    <div class="space-y-4">
                      <!-- Entrega/Retirada -->
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                          <svg v-if="selectedOrder.deliveryMethod === 'delivery'" class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          <svg v-else class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        </div>
                        <div>
                          <span class="text-white font-bold text-xs block">
                            {{ selectedOrder.deliveryMethod === 'delivery' ? 'Entrega (Motoboy)' : 'Retirada no Balcão' }}
                          </span>
                          <span v-if="selectedOrder.deliveryMethod === 'delivery' && selectedOrder.address" class="text-neutral-400 text-[11px] mt-1 block leading-relaxed font-sans">
                            {{ selectedOrder.address }}
                          </span>
                        </div>
                      </div>

                      <div class="h-px bg-white/5 w-full"></div>

                      <!-- Forma de Pagamento -->
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                          <svg class="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                          <span class="text-neutral-400 text-xs block">Pagamento via <strong class="text-white uppercase">{{ selectedOrder.paymentMethod || 'Não informado' }}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Lista de Itens Expandida -->
                  <div>
                    <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-4 ml-1">Itens do Pedido</h4>
                    <div class="space-y-4">
                      <div v-for="item in selectedOrder.items" :key="item.id" class="border-b border-white/5 pb-4 last:border-0">
                        <div class="flex justify-between items-start">
                          <div class="flex-1 pr-4">
                            <span class="text-white font-bold text-sm block">{{ item.quantity }}x {{ item.name }}</span>
                            <span v-if="item.observation" class="text-amber-500/80 text-[11px] italic font-sans mt-1 block leading-tight">
                              Obs: {{ item.observation }}
                            </span>
                          </div>
                          <span class="text-neutral-400 text-xs font-mono mt-0.5">R$ {{ (item.price * item.quantity).toFixed(2) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Total -->
                  <div class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex justify-between items-center mt-4 mb-4">
                    <span class="text-amber-500 text-[10px] font-black uppercase tracking-widest">Total Pago</span>
                    <span class="text-amber-500 font-black text-xl italic">R$ {{ selectedOrder.total.toFixed(2) }}</span>
                  </div>
                </div>

                <!-- Footer Detalhes -->
                <div class="mt-4 pt-4 shrink-0 border-t border-white/5">
                  <button @click="isStoreOpen ? repeatAndClose(selectedOrder.items) : null" :disabled="!isStoreOpen" 
                    :class="['w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl', 
                    isStoreOpen ? 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95 shadow-amber-500/10' : 'bg-neutral-800 text-neutral-600 cursor-not-allowed opacity-50']">
                    <span v-if="isStoreOpen">Repetir este pedido ↺</span>
                    <span v-else>Loja fechada no momento</span>
                  </button>
                </div>

              </div>

            </transition>
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

// ESTADO DO PEDIDO SELECIONADO (Detalhes)
const selectedOrder = ref(null)

const closeModal = () => {
  cart.isHistoryOpen = false
  setTimeout(() => {
    selectedOrder.value = null // Reseta os detalhes ao fechar o modal
  }, 300)
}

const repeatAndClose = (items) => {
  cart.repeatOrder(items)
  selectedOrder.value = null // Reseta para a próxima vez que abrir
}

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

.slide-enter-active, .slide-leave-active {
  transition: all 0.25s ease-out;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(15px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }
</style>