import { defineStore } from 'pinia'

// 1. Atualizamos a interface para aceitar os novos campos
interface CartItem {
  id: string
  cartItemId: string // Identificador único para a linha no carrinho
  name: string
  price: number
  quantity: number
  observation?: string // Observações do cliente
}

interface MultiCart {
  [brandId: string]: CartItem[] | undefined
}

export const useCartStore = defineStore('cart', {
  persist: true, // Garante que os carrinhos fiquem salvos no F5

  state: () => ({
    carts: {} as MultiCart,
    customerPhone: '',
    customerName: '',
    customerAddress: '', // Novo campo para o endereço do cliente
    isModalOpen: false,
    activeBrandId: '',
    isHistoryOpen: false,
    orderHistory: [] as any[],
    // Estado para armazenar a mesa vinda do QR Code
    mesa: null as string | null,
  }),

  getters: {
    // Retorna os itens apenas da loja que o usuário está visualizando
    currentCartItems: (state): CartItem[] => {
      if (!state.activeBrandId) return []
      return state.carts[state.activeBrandId] || []
    },

    totalItems(): number {
      return this.currentCartItems.reduce((acc, item) => acc + item.quantity, 0)
    },

    totalPrice(): number {
      return this.currentCartItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0)
    },

    isPhoneValid: (state) => {
      const clean = state.customerPhone.replace(/\D/g, '')
      return clean.length >= 10 && clean.length <= 11
    }
  },

  actions: {
    // Salva a mesa lida pela URL
    setMesa(numero: string) {
      this.mesa = numero
    },

    setActiveBrand(id: string) {
      this.activeBrandId = id
    },

    async fetchHistory() {
      if (!this.customerPhone) return

      try {
        const data = await $fetch('/api/orders/history', {
          query: { phone: this.customerPhone.replace(/\D/g, '') }
        })
        this.orderHistory = data
      } catch (error) {
        console.error('Erro ao buscar histórico:', error)
      }
    },

    logout() {
      this.customerPhone = ''
      this.customerName = ''
      this.orderHistory = []
      this.isHistoryOpen = false
      this.carts[this.activeBrandId] = []
      this.mesa = null 
      // Não limpamos o endereço, pois o cliente pode querer usar o mesmo depois
    },

    repeatOrder(items: any[]) {
      if (!this.activeBrandId) return

      // 1. Limpamos o carrinho atual da loja para não dar confusão
      this.carts[this.activeBrandId] = []

      // 2. Adicionamos os itens do histórico com suporte a observação
      this.carts[this.activeBrandId] = items.map(item => ({
        id: item.id,
        // Gera um ID único rápido para não dar conflito na listagem
        cartItemId: Date.now().toString() + Math.random().toString(36).substring(2, 7), 
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        observation: item.observation || '' // Garante que a observação seja puxada
      }))

      // 3. Fechamos o modal de histórico e abrimos o do carrinho para ele ver
      this.isHistoryOpen = false
      this.isModalOpen = true
    },

    addToCart(product: any) {
      const brandId = this.activeBrandId
      if (!brandId) return

      // Inicializa o carrinho da loja se não existir
      if (!this.carts[brandId]) {
        this.carts[brandId] = []
      }

      const targetCart = this.carts[brandId]!
      
      // 3. NOVA LÓGICA DE BUSCA: Confere o ID e a Observação
      const observationFormatada = product.observation ? product.observation.trim() : ''
      const existing = targetCart.find(i => i.id === product.id && (i.observation || '') === observationFormatada)

      if (existing) {
        // Se existir o exato mesmo produto com a mesma observação, soma a quantidade que veio do modal
        existing.quantity += (product.quantity || 1)
      } else {
        // Se for diferente, cria uma nova linha no carrinho
        targetCart.push({
          id: product.id,
          cartItemId: product.cartItemId || (Date.now().toString() + Math.random().toString(36).substring(2, 7)),
          name: product.name,
          price: Number(product.price),
          quantity: product.quantity || 1,
          observation: observationFormatada
        })
      }
    },

    // 4. ATUALIZADO: Agora removemos usando o cartItemId para não deletar a variação errada
    removeFromCart(cartItemId: string) {
      const brandId = this.activeBrandId
      if (!brandId) return

      const targetCart = this.carts[brandId]
      if (!targetCart) return

      // Encontra a linha específica do carrinho
      const index = targetCart.findIndex(i => i.cartItemId === cartItemId)

      if (index > -1) {
        const item = targetCart[index]
        targetCart.splice(index, 1)
      }
    },

    clearCurrentCart() {
      if (this.activeBrandId) {
        delete this.carts[this.activeBrandId]
      }
      this.isModalOpen = false
    }
  }
})