import { create } from "zustand"
import { persist, subscribeWithSelector } from "zustand/middleware"
import type { CartItem, Dish } from "@/types"

interface CartState {
  items: CartItem[]
  restaurantId: string | null
  restaurantName: string | null
  restaurantSlug: string | null
  deliveryFee: number
  addItem: (dish: Dish) => void
  removeItem: (dishId: string) => void
  updateQuantity: (dishId: string, quantity: number) => void
  clearCart: () => void
  setRestaurant: (id: string, name: string, slug: string, deliveryFee?: number) => void
  setDeliveryFee: (fee: number) => void
  getTotalItems: () => number
  getSubtotal: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,
      restaurantSlug: null,
      deliveryFee: 0,

      addItem: (dish: Dish) => {
        const { items } = get()
        const existing = items.find((item) => item.dish.id === dish.id)
        if (existing) {
          set({
            items: items.map((item) =>
              item.dish.id === dish.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          })
        } else {
          set({ items: [...items, { dish, quantity: 1 }] })
        }
      },

      removeItem: (dishId: string) => {
        set({ items: get().items.filter((item) => item.dish.id !== dishId) })
      },

      updateQuantity: (dishId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(dishId)
          return
        }
        set({
          items: get().items.map((item) =>
            item.dish.id === dishId ? { ...item, quantity } : item
          ),
        })
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: null, restaurantSlug: null, deliveryFee: 0 }),

      setRestaurant: (id: string, name: string, slug: string, deliveryFee?: number) =>
        set({ restaurantId: id, restaurantName: name, restaurantSlug: slug, deliveryFee: deliveryFee ?? 0 }),

      setDeliveryFee: (fee: number) => set({ deliveryFee: fee }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0),

      getTotalPrice: () => {
        const state = get()
        const subtotal = state.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)
        return subtotal + state.deliveryFee
      },
    }),
    { name: "qrmenu-cart" }
    )
  )
)
