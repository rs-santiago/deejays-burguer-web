<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 bg-black/90 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
        
        <!-- Fundo clicável para fechar -->
        <div class="absolute inset-0" @click="closeModal"></div>

        <div class="bg-neutral-900 w-full max-w-md rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative flex flex-col z-10">
          
          <button @click="closeModal" class="absolute top-4 right-4 z-20 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors backdrop-blur-md">
            ✕
          </button>

          <!-- Imagem do Produto (Opcional, se o seu product tiver imageUrl) -->
          <div v-if="product?.imageUrl" class="h-48 w-full bg-black relative">
            <img :src="product.imageUrl" class="w-full h-full object-cover opacity-80" />
            <div class="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>
          </div>

          <div class="p-8">
            <h3 class="text-2xl font-black text-white uppercase tracking-tighter">{{ product?.name }}</h3>
            <p v-if="product?.description" class="text-neutral-400 text-sm mt-2 font-sans leading-relaxed">
              {{ product.description }}
            </p>
            <div class="text-amber-500 font-black text-xl mt-3">
              R$ {{ product?.price?.toFixed(2) }}
            </div>

            <hr class="border-white/5 my-6" />

            <!-- Campo de Observações -->
            <div class="mb-8">
              <label class="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">
                Alguma observação?
              </label>
              <textarea
                v-model="observation"
                rows="2"
                placeholder="Ex: Tirar a mostarda, hambúrguer bem passado..."
                class="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-amber-500/50 outline-none transition-colors font-sans resize-none custom-scrollbar placeholder:text-neutral-600"
              ></textarea>
            </div>

            <!-- Controles de Quantidade e Botão Adicionar -->
            <div class="flex items-center gap-4 mt-auto">
              
              <!-- Seletor numérico -->
              <div class="flex items-center bg-black/40 border border-white/10 rounded-2xl p-1 h-[60px]">
                <button @click="decrement" class="w-12 h-full flex items-center justify-center text-neutral-400 hover:text-amber-500 text-2xl font-light rounded-xl active:bg-white/5 transition-colors">
                  −
                </button>
                <span class="w-8 text-center text-white font-black text-lg">{{ quantity }}</span>
                <button @click="increment" class="w-12 h-full flex items-center justify-center text-neutral-400 hover:text-amber-500 text-2xl font-light rounded-xl active:bg-white/5 transition-colors">
                  +
                </button>
              </div>

              <!-- Botão Confirmar -->
              <button @click="handleAddToCart" class="flex-1 h-[60px] bg-amber-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-amber-400 transition-all active:scale-95 shadow-xl shadow-amber-500/10 flex justify-between px-6 items-center">
                <span>Adicionar</span>
                <span class="text-xs bg-black/10 px-2 py-1 rounded-lg">R$ {{ totalPrice.toFixed(2) }}</span>
              </button>
              
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props que este modal vai receber de quem o chamou
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  }
})

// Emitir eventos para o componente pai
const emit = defineEmits(['close', 'add-to-cart'])

// Estados Locais do Modal
const quantity = ref(1)
const observation = ref('')

// Calcula o total dinamicamente com base na quantidade
const totalPrice = computed(() => {
  if (!props.product) return 0
  return props.product.price * quantity.value
})

// Sempre que o modal abrir com um novo produto, reseta os campos
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    quantity.value = 1
    observation.value = ''
  }
})

const increment = () => {
  if (quantity.value < 20) quantity.value++ // Limite de 20 por segurança
}

const decrement = () => {
  if (quantity.value > 1) quantity.value--
}

const closeModal = () => {
  emit('close')
}

const handleAddToCart = () => {
  // Dispara o evento passando o produto montado com os novos dados
  emit('add-to-cart', {
    ...props.product,
    quantity: quantity.value,
    observation: observation.value.trim(),
    // É recomendado gerar um ID único para o item no carrinho, 
    // pois o cliente pode adicionar o MESMO produto duas vezes com observações DIFERENTES
    cartItemId: Date.now().toString() 
  })
  closeModal()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
</style>