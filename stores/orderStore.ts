import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Order, OrderType, PaymentMethod } from "@/types"

interface OrderFormState {
  orderType: OrderType | null
  customerName: string
  customerPhone: string
  tableNumber: string
  deliveryAddress: string
  paymentMethod: PaymentMethod
  currentOrder: Order | null
  isLoading: boolean
  error: string | null

  setOrderType: (type: OrderType) => void
  setCustomerName: (name: string) => void
  setCustomerPhone: (phone: string) => void
  setTableNumber: (table: string) => void
  setDeliveryAddress: (address: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setCurrentOrder: (order: Order | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetForm: () => void
}

const initialFormState = {
  orderType: null as OrderType | null,
  customerName: "",
  customerPhone: "",
  tableNumber: "",
  deliveryAddress: "",
  paymentMethod: "cod" as PaymentMethod,
}

export const useOrderStore = create<OrderFormState>()(
  persist(
    (set) => ({
      ...initialFormState,
      currentOrder: null,
      isLoading: false,
      error: null,

      setOrderType: (type) => set({ orderType: type }),
      setCustomerName: (name) => set({ customerName: name }),
      setCustomerPhone: (phone) => set({ customerPhone: phone }),
      setTableNumber: (table) => set({ tableNumber: table }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setCurrentOrder: (order) => set({ currentOrder: order }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error: error }),
      resetForm: () => set({ ...initialFormState, error: null }),
    }),
    {
      name: "order-form-storage",
      partialize: (state) => ({
        orderType: state.orderType,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        tableNumber: state.tableNumber,
        deliveryAddress: state.deliveryAddress,
        paymentMethod: state.paymentMethod,
      }),
    }
  )
)
