"use client"

import React, { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useCartStore } from "@/stores/cartStore"
import { useOrderStore } from "@/stores/orderStore"
import { OrderTypeSelector } from "@/components/checkout/OrderTypeSelector"
import { DineInForm } from "@/components/checkout/DineInForm"
import { TakeawayForm } from "@/components/checkout/TakeawayForm"
import { DeliveryForm } from "@/components/checkout/DeliveryForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { OrderType, PaymentMethod } from "@/types"

const CUSTOMER_INFO_KEY = "qrmenu-customer-info"

function loadSavedInfo() {
  try {
    const raw = localStorage.getItem(CUSTOMER_INFO_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveInfo(info: Record<string, string>) {
  try {
    localStorage.setItem(CUSTOMER_INFO_KEY, JSON.stringify(info))
  } catch {}
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, restaurantId, clearCart } = useCartStore()
  const {
    orderType, customerName, customerPhone, tableNumber,
    deliveryAddress, paymentMethod,
    setOrderType, setCustomerName, setCustomerPhone,
    setTableNumber, setDeliveryAddress, setPaymentMethod, setCurrentOrder, setError,
    error,
  } = useOrderStore()

  const [localLoading, setLocalLoading] = React.useState(false)

  useEffect(() => {
    const saved = loadSavedInfo()
    if (saved.name) setCustomerName(saved.name)
    if (saved.phone) setCustomerPhone(saved.phone)
    if (saved.address) setDeliveryAddress(saved.address)
  }, [])

  React.useEffect(() => {
    if (items.length > 0 && !restaurantId) {
      clearCart()
      router.replace("/cart")
    }
  }, [items, restaurantId, clearCart, router])

  React.useEffect(() => {
    if (!restaurantId) return
    fetch(`/api/orders/validate-restaurant?restaurant_id=${restaurantId}`)
      .then((res) => { if (!res.ok) { clearCart(); router.replace("/cart") } })
      .catch(() => {})
  }, [restaurantId, clearCart, router])

  const handlePlaceOrder = useCallback(async () => {
    if (!orderType || !customerName) return
    setLocalLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          customer_id: user?.id || null,
          items: items.map((i) => ({
            id: i.dish.id,
            name_en: i.dish.name_en,
            price: i.dish.price,
            quantity: i.quantity,
            subtotal: i.dish.price * i.quantity,
          })),
          total_price: getTotalPrice(),
          order_type: orderType,
          customer_name: customerName,
          customer_phone: customerPhone || null,
          table_number: orderType === "dine_in" ? tableNumber : null,
          delivery_address: orderType === "delivery" ? deliveryAddress : null,
          payment_method: paymentMethod,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || "Failed to place order")
      saveInfo({
        name: customerName,
        phone: customerPhone || "",
        address: deliveryAddress || "",
      })
      setCurrentOrder(data.order)
      useCartStore.getState().clearCart()

      if (data.whatsapp_url) {
        window.location.href = data.whatsapp_url
        return
      }

      if (!user) {
        router.push(`/login?redirect=/order-confirm/${data.order.id}`)
      } else {
        router.push(`/order-confirm/${data.order.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLocalLoading(false)
    }
  }, [orderType, customerName, customerPhone, tableNumber, deliveryAddress, paymentMethod, items, restaurantId, getTotalPrice, router, setCurrentOrder, setError])

  if (items.length === 0 || !restaurantId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-lg font-medium mb-2">Your cart is empty</p>
        <Link href="/restaurants">
          <Button variant="primary">Browse Menu</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-[180px]">
      <div className="flex items-center gap-3 px-4 h-14 border-b border-[#F0F0F0]">
        <Link href="/cart">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold">Your Order</h1>
      </div>

      <div className="px-4 py-6 space-y-8">
        <OrderTypeSelector selected={orderType} onSelect={setOrderType} />

        {orderType && (
          <div>
            {orderType === "dine_in" && (
              <DineInForm
                name={customerName}
                phone={customerPhone}
                tableNumber={tableNumber}
                onNameChange={setCustomerName}
                onPhoneChange={setCustomerPhone}
                onTableChange={setTableNumber}
              />
            )}
            {orderType === "takeaway" && (
              <TakeawayForm
                name={customerName}
                phone={customerPhone}
                onNameChange={setCustomerName}
                onPhoneChange={setCustomerPhone}
              />
            )}
            {orderType === "delivery" && (
              <DeliveryForm
                name={customerName}
                phone={customerPhone}
                address={deliveryAddress}
                onNameChange={setCustomerName}
                onPhoneChange={setCustomerPhone}
                onAddressChange={setDeliveryAddress}
              />
            )}
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold mb-3">Payment Method</h3>
          <div className="space-y-2">
            {["cod", "bank_transfer"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method as PaymentMethod)}
                className={`flex items-center gap-3 w-full p-4 rounded-[10px] border transition-colors ${
                  paymentMethod === method
                    ? "border-black bg-black text-white"
                    : "border-[#E8E8E8] text-[#555]"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === method ? "border-white" : "border-[#CCC]"
                }`}>
                  {paymentMethod === method && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-sm font-medium">
                  {method === "cod" ? "Cash on Delivery" : "Bank Transfer"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-[10px] p-4">
            <p className="text-sm text-[#DC2626]">{error}</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-[60px] left-0 right-0 bg-white border-t border-[#F0F0F0] p-4 z-40 md:max-w-app md:mx-auto md:left-[calc(50%-240px)]">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handlePlaceOrder}
          disabled={!orderType || !customerName || localLoading}
        >
          {localLoading ? "Placing Order..." : `Place Order — Rs ${getTotalPrice().toLocaleString("en-PK")}`}
        </Button>
      </div>
    </div>
  )
}
