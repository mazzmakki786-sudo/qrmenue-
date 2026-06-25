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
import { ArrowLeft, ChevronDown, ChevronUp, ShoppingBag, AlertCircle } from "lucide-react"
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
  const restaurantName = useCartStore((s) => s.restaurantName)
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
        <div className="w-20 h-20 rounded-3xl bg-[#F5F5F5] flex items-center justify-center mb-5">
          <ShoppingBag className="w-9 h-9 text-black/20" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-1">Your cart is empty</h2>
        <p className="text-sm text-text-secondary mb-8 text-center">Add items to get started</p>
        <Link
          href="/restaurants"
          className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all"
        >
          Browse Menu
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
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-[600px] mx-auto">
          <Link
            href="/cart"
            className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4 text-text-primary" />
          </Link>
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Checkout</h1>
            <p className="text-[11px] text-text-muted">{restaurantName}</p>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="bg-white border-b border-border">
        <div className="flex items-center justify-center gap-2 px-4 py-3 max-w-[600px] mx-auto">
          {steps.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                  step.done ? "bg-primary text-white" : "bg-[#F5F5F5] text-text-muted"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs font-medium ${step.done ? "text-text-primary" : "text-text-muted"}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px ${step.done ? "bg-primary" : "bg-border"}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Order Summary Collapsible */}
      <div className="bg-white border-b border-border max-w-[600px] mx-auto">
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-text-primary">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
              <p className="text-[11px] text-text-muted">{formatPrice(getTotalPrice())}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted">
            <span>{showSummary ? "Hide" : "View"} items</span>
            {showSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>
        {showSummary && (
          <div className="px-4 pb-3 space-y-2">
            {items.map((item) => (
              <div key={item.dish.id} className="flex items-center gap-3 py-2">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#F9FAFB]">
                  {item.dish.image_url ? (
                    <Image src={item.dish.image_url} alt={item.dish.name_en} fill className="object-cover" sizes="40px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-3.5 h-3.5 text-text-muted" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-text-primary truncate">{item.dish.name_en}</p>
                  <p className="text-[11px] text-text-muted">{item.quantity}x {formatPrice(item.dish.price)}</p>
                </div>
                <span className="text-[12px] font-semibold text-text-primary">{formatPrice(item.dish.price * item.quantity)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-[13px] font-bold text-text-primary">Total</span>
              <span className="text-[14px] font-bold text-text-primary">{formatPrice(getTotalPrice())}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-4 py-5 space-y-5 max-w-[600px] mx-auto">
        {/* Order Type */}
        <div className="bg-white rounded-2xl p-5 border border-border">
          <OrderTypeSelector selected={orderType} onSelect={setOrderType} />
        </div>

        {/* Forms */}
        {orderType && (
          <div className="space-y-1">
            {orderType === "dine_in" && (
              <>
                <DineInForm
                  name={customerName}
                  phone={customerPhone}
                  tableNumber={tableNumber}
                  onNameChange={setCustomerName}
                  onPhoneChange={setCustomerPhone}
                  onTableChange={setTableNumber}
                />
                {fieldErrors.name && <FieldError message={fieldErrors.name} />}
                {fieldErrors.phone && <FieldError message={fieldErrors.phone} />}
                {fieldErrors.table && <FieldError message={fieldErrors.table} />}
              </>
            )}
            {orderType === "takeaway" && (
              <>
                <TakeawayForm
                  name={customerName}
                  phone={customerPhone}
                  onNameChange={setCustomerName}
                  onPhoneChange={setCustomerPhone}
                />
                {fieldErrors.name && <FieldError message={fieldErrors.name} />}
                {fieldErrors.phone && <FieldError message={fieldErrors.phone} />}
              </>
            )}
            {orderType === "delivery" && (
              <>
                <DeliveryForm
                  name={customerName}
                  phone={customerPhone}
                  address={deliveryAddress}
                  onNameChange={setCustomerName}
                  onPhoneChange={setCustomerPhone}
                  onAddressChange={setDeliveryAddress}
                />
                {fieldErrors.name && <FieldError message={fieldErrors.name} />}
                {fieldErrors.phone && <FieldError message={fieldErrors.phone} />}
                {fieldErrors.address && <FieldError message={fieldErrors.address} />}
              </>
            )}
          </div>
        )}

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-5 border border-border">
          <h3 className="text-[13px] font-semibold text-text-primary mb-3">Payment Method</h3>
          <div className="space-y-2">
            {["cod", "bank_transfer"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method as PaymentMethod)}
                className={`flex items-center gap-3 w-full p-4 rounded-xl border transition-all ${
                  paymentMethod === method
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-border text-text-secondary hover:border-primary/30"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  paymentMethod === method ? "border-white" : "border-border"
                }`}>
                  {paymentMethod === method && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-[13px] font-medium">
                  {method === "cod" ? "Cash on Delivery" : "Bank Transfer"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
            <p className="text-[13px] text-error">{error}</p>
          </div>
        )}
      </div>

      {/* Fixed Place Order Button */}
      <div className="fixed bottom-[60px] left-0 right-0 bg-white border-t border-border p-4 z-40">
        <div className="max-w-[600px] mx-auto">
          <button
            onClick={handlePlaceOrder}
            disabled={!orderType || !customerName || localLoading}
            className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-[13px] hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {localLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Placing Order...
              </span>
            ) : (
              `Place Order — ${formatPrice(getTotalPrice())}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function FieldError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-1.5 px-1">
      <AlertCircle className="w-3 h-3 text-error" />
      <p className="text-[11px] text-error">{message}</p>
    </div>
  )
}
