import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Dish } from "@/types"

interface CartState {
  items: CartItem[]
  restaurantId: string | null
  restaurantName: string | null
  addItem: (dish: Dish) => void
  removeItem: (dishId: string) => void
  updateQuantity: (dishId: string, quantity: number) => void
  clearCart: () => void
  setRestaurant: (id: string, name: string) => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,

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

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

      setRestaurant: (id: string, name: string) =>
        set({ restaurantId: id, restaurantName: name }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0),
    }),
    { name: "qrmenu-cart" }
  )
)
