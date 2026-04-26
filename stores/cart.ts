import { defineStore } from 'pinia'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface MultiCart {
  [brandId: string]: CartItem[] | undefined
}

export const useCartStore = defineStore('cart', {
  persist: true, // Garante que os carrinhos fiquem salvos no F5

  state: () => ({
    carts: {} as MultiCart,
    customerPhone: '',
    isModalOpen: false,
    activeBrandId: '', 
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
    setActiveBrand(id: string) {
      this.activeBrandId = id
    },

    addToCart(product: any) {
      const brandId = this.activeBrandId
      if (!brandId) return

      // Inicializa o carrinho da loja se não existir
      if (!this.carts[brandId]) {
        this.carts[brandId] = []
      }

      // Usamos o '!' pois garantimos a existência acima
      const targetCart = this.carts[brandId]!
      const existing = targetCart.find(i => i.id === product.id)

      if (existing) {
        existing.quantity++
      } else {
        targetCart.push({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1
        })
      }
    },

    removeFromCart(productId: string) {
      const brandId = this.activeBrandId
      if (!brandId) return

      const targetCart = this.carts[brandId]
      if (!targetCart) return

      const index = targetCart.findIndex(i => i.id === productId)
      
      if (index > -1) {
        const item = targetCart[index]
        if (item && item.quantity > 1) {
          item.quantity--
        } else {
          targetCart.splice(index, 1)
        }
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