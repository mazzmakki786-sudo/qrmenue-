"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useCartStore } from "@/stores/cartStore"
import { useOrderStore } from "@/stores/orderStore"
import { OrderTypeSelector } from "@/components/checkout/OrderTypeSelector"
import { DineInForm } from "@/components/checkout/DineInForm"
import { TakeawayForm } from "@/components/checkout/TakeawayForm"
import { DeliveryForm } from "@/components/checkout/DeliveryForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
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

const PHONE_REGEX = /^03\d{2}-?\d{7}$/

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const getTotalPrice = useCartStore((s) => s.getTotalPrice)
  const restaurantId = useCartStore((s) => s.restaurantId)
  const clearCart = useCartStore((s) => s.clearCart)
  const {
    orderType, customerName, customerPhone, tableNumber,
    deliveryAddress, paymentMethod,
    setOrderType, setCustomerName, setCustomerPhone,
    setTableNumber, setDeliveryAddress, setPaymentMethod, setCurrentOrder, setError,
    error,
  } = useOrderStore()

  const [localLoading, setLocalLoading] = React.useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

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

  const validatePhone = useCallback((phone: string): string => {
    if (!phone) return ""
    if (!PHONE_REGEX.test(phone)) return "Enter a valid phone (e.g. 0300-1234567)"
    return ""
  }, [])

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {}
    if (!customerName.trim()) errors.name = "Name is required"
    if (customerPhone && !PHONE_REGEX.test(customerPhone)) {
      errors.phone = "Enter a valid phone (e.g. 0300-1234567)"
    }
    if (orderType === "dine_in" && !tableNumber.trim()) {
      errors.table = "Table number is required"
    }
    if (orderType === "delivery" && !deliveryAddress.trim()) {
      errors.address = "Delivery address is required"
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [customerName, customerPhone, orderType, tableNumber, deliveryAddress])

  const handlePlaceOrder = useCallback(async () => {
    if (!orderType || !customerName) return
    if (!validateForm()) return

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
      router.push(`/order-confirm/${data.order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLocalLoading(false)
    }
  }, [orderType, customerName, customerPhone, tableNumber, deliveryAddress, paymentMethod, items, restaurantId, getTotalPrice, router, setCurrentOrder, setError, validateForm])

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

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  const steps = [
    { label: "Order Type", done: !!orderType },
    { label: "Details", done: !!customerName.trim() },
    { label: "Payment", done: !!paymentMethod },
  ]

  return (
    <div className="min-h-screen bg-white pb-40">
      <div className="flex items-center gap-3 px-4 h-14 border-b border-[#F0F0F0]">
        <Link href="/cart">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold">Your Order</h1>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-[#F0F0F0] bg-[#FAFAFA]">
        {steps.map((step, i) => (
          <React.Fragment key={step.label}>
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step.done ? "bg-black text-white" : "bg-[#E8E8E8] text-[#999]"
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs font-medium ${step.done ? "text-black" : "text-[#999]"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 h-px ${step.done ? "bg-black" : "bg-[#E8E8E8]"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Order Summary Collapsible */}
      <button
        onClick={() => setShowSummary(!showSummary)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0] bg-[#F9FAFB]"
      >
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[#555]" />
          <span className="text-sm font-medium">{totalItems} items — {formatPrice(getTotalPrice())}</span>
        </div>
        {showSummary ? <ChevronUp className="w-4 h-4 text-[#999]" /> : <ChevronDown className="w-4 h-4 text-[#999]" />}
      </button>
      {showSummary && (
        <div className="px-4 py-3 border-b border-[#F0F0F0] space-y-2 bg-white">
          {items.map((item) => (
            <div key={item.dish.id} className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#F5F5F5]">
                {item.dish.image_url ? (
                  <Image src={item.dish.image_url} alt={item.dish.name_en} fill className="object-cover" sizes="40px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-[#CCC]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.dish.name_en}</p>
                <p className="text-[11px] text-[#999]">{item.quantity}x {formatPrice(item.dish.price)}</p>
              </div>
              <span className="text-xs font-semibold">{formatPrice(item.dish.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-6 space-y-8">
        <OrderTypeSelector selected={orderType} onSelect={setOrderType} />

        {orderType && (
          <div>
            {orderType === "dine_in" && (
              <div className="space-y-1">
                <DineInForm
                  name={customerName}
                  phone={customerPhone}
                  tableNumber={tableNumber}
                  onNameChange={setCustomerName}
                  onPhoneChange={setCustomerPhone}
                  onTableChange={setTableNumber}
                />
                {fieldErrors.name && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.name}</p>}
                {fieldErrors.phone && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.phone}</p>}
                {fieldErrors.table && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.table}</p>}
              </div>
            )}
            {orderType === "takeaway" && (
              <div className="space-y-1">
                <TakeawayForm
                  name={customerName}
                  phone={customerPhone}
                  onNameChange={setCustomerName}
                  onPhoneChange={setCustomerPhone}
                />
                {fieldErrors.name && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.name}</p>}
                {fieldErrors.phone && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.phone}</p>}
              </div>
            )}
            {orderType === "delivery" && (
              <div className="space-y-1">
                <DeliveryForm
                  name={customerName}
                  phone={customerPhone}
                  address={deliveryAddress}
                  onNameChange={setCustomerName}
                  onPhoneChange={setCustomerPhone}
                  onAddressChange={setDeliveryAddress}
                />
                {fieldErrors.name && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.name}</p>}
                {fieldErrors.phone && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.phone}</p>}
                {fieldErrors.address && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.address}</p>}
              </div>
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
                    : "border-[#F0F0F0] text-[#555]"
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

      <div className="fixed bottom-[60px] left-0 right-0 bg-white border-t border-[#F0F0F0] p-4 z-40">
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
