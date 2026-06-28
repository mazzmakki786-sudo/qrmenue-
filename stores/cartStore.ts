import { create } from "zustand"
import { persist, subscribeWithSelector } from "zustand/middleware"
import type { CartItem, Deal, Dish } from "@/types"

function computeDiscount(subtotal: number, deal: Deal | null): number {
  if (!deal || deal.deal_type === "bundle") return 0
  if (deal.deal_type === "percentage") return Math.round(subtotal * deal.deal_value / 100)
  return Math.min(deal.deal_value, subtotal)
}

interface CartState {
  items: CartItem[]
  restaurantId: string | null
  restaurantName: string | null
  restaurantSlug: string | null
  deliveryFee: number
  selectedDeal: Deal | null
  selectedDealId: string | null
  discountAmount: number
  addItem: (dish: Dish) => void
  removeItem: (dishId: string) => void
  updateQuantity: (dishId: string, quantity: number) => void
  clearCart: () => void
  setRestaurant: (id: string, name: string, slug: string, deliveryFee?: number) => void
  setDeliveryFee: (fee: number) => void
  selectDeal: (deal: Deal) => void
  clearDeal: () => void
  getTotalItems: () => number
  getSubtotal: () => number
  getDiscount: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  subscribeWithSelector(
    persist(
      (set, get) => {
        const updateDiscount = (state: CartState) => {
          const subtotal = state.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)
          state.discountAmount = computeDiscount(subtotal, state.selectedDeal)
          if (state.selectedDeal && state.discountAmount === 0) {
            state.selectedDeal = null
            state.selectedDealId = null
          }
          return state
        }

        return {
        items: [],
        restaurantId: null,
        restaurantName: null,
        restaurantSlug: null,
        deliveryFee: 0,
        selectedDeal: null,
        selectedDealId: null,
        discountAmount: 0,

        addItem: (dish: Dish) => {
          const state = get()
          const existing = state.items.find((item) => item.dish.id === dish.id)
          const newItems = existing
            ? state.items.map((item) =>
                item.dish.id === dish.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            : [...state.items, { dish, quantity: 1 }]
          set(updateDiscount({ ...state, items: newItems }))
        },

        removeItem: (dishId: string) => {
          const state = get()
          const newItems = state.items.filter((item) => item.dish.id !== dishId)
          set(updateDiscount({ ...state, items: newItems }))
        },

        updateQuantity: (dishId: string, quantity: number) => {
          if (quantity <= 0) {
            get().removeItem(dishId)
            return
          }
          const state = get()
          const newItems = state.items.map((item) =>
            item.dish.id === dishId ? { ...item, quantity } : item
          )
          set(updateDiscount({ ...state, items: newItems }))
        },

        clearCart: () => set({
          items: [], restaurantId: null, restaurantName: null,
          restaurantSlug: null, deliveryFee: 0,
          selectedDeal: null, selectedDealId: null, discountAmount: 0,
        }),

        setRestaurant: (id: string, name: string, slug: string, deliveryFee?: number) =>
          set({ restaurantId: id, restaurantName: name, restaurantSlug: slug, deliveryFee: deliveryFee ?? 0 }),

        setDeliveryFee: (fee: number) => set({ deliveryFee: fee }),

        selectDeal: (deal: Deal) => {
          const state = get()
          const subtotal = state.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)
          const discount = computeDiscount(subtotal, deal)
          set({ selectedDeal: deal, selectedDealId: deal.id, discountAmount: discount })
        },

        clearDeal: () => set({ selectedDeal: null, selectedDealId: null, discountAmount: 0 }),

        getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

        getSubtotal: () =>
          get().items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0),

        getDiscount: () => get().discountAmount,

        getTotalPrice: () => {
          const state = get()
          const subtotal = state.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)
          return Math.max(0, subtotal - state.discountAmount) + state.deliveryFee
        },
      }},
      { name: "qrmenu-cart", partialize: (state) => ({
        items: state.items,
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        restaurantSlug: state.restaurantSlug,
        deliveryFee: state.deliveryFee,
        selectedDeal: state.selectedDeal,
        selectedDealId: state.selectedDealId,
        discountAmount: state.discountAmount,
      }) }
    )
  )
)
