"use client"

import { use } from "react"
import { useOrderTracking } from "@/components/order-confirm/useOrderTracking"
import { buildWhatsAppURL } from "@/lib/whatsapp"
import StatusHeroSection from "@/components/order-confirm/StatusHeroSection"
import StatusTimeline from "@/components/order-confirm/StatusTimeline"
import ContactButtons from "@/components/order-confirm/ContactButtons"
import OrderSummaryCard from "@/components/order-confirm/OrderSummaryCard"
import CustomerDetailsCard from "@/components/order-confirm/CustomerDetailsCard"
import SignInPromptBanner from "@/components/order-confirm/SignInPromptBanner"
import OrderActionsBar from "@/components/order-confirm/OrderActionsBar"
import CancelOrderDialog from "@/components/order-confirm/CancelOrderDialog"
import SignUpToCancelDialog from "@/components/order-confirm/SignUpToCancelDialog"
import OrderConfirmSkeleton from "@/components/order-confirm/OrderConfirmSkeleton"
import { OrderReceipt } from "@/components/shared/OrderReceipt"
import { PaymentTransferDetails } from "@/components/shared/PaymentTransferDetails"
import { X } from "lucide-react"

export default function OrderConfirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const {
    order,
    user,
    loading,
    error,
    whatsappSuccess,
    setWhatsappSuccess,
    handleCancelOrder,
    handleReorder,
    cancelDialogOpen,
    setCancelDialogOpen,
    cancelling,
    cancelError,
    signupToCancelDialogOpen,
    setSignupToCancelDialogOpen,
  } = useOrderTracking(id)

  if (loading) return <OrderConfirmSkeleton />
  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center">
          <X className="w-6 h-6 text-error" />
        </div>
        <p className="text-sm text-red-700 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm font-semibold text-accent hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }
  if (!order) return null

  const whatsappUrl = buildWhatsAppURL({
    orderNumber: order.order_number,
    items: order.items || [],
    totalPrice: order.total_price,
    paymentMethod: order.payment_method,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    orderType: order.order_type,
    tableNumber: order.table_number,
    deliveryAddress: order.delivery_address,
    restaurantPhone: order.restaurants?.phone || "",
    deliveryFee: order.delivery_fee ?? 0,
  })

  const restaurant = order.restaurants
  const restaurantPhone = restaurant?.phone?.replace(/[^0-9+]/g, "")
  const isPending = order.order_status === "received"
  const headerTitle =
    order.order_status === "ready" || order.order_status === "completed"
      ? "Order Ready"
      : order.order_status === "cancelled"
        ? "Order Cancelled"
        : order.order_status === "preparing"
          ? "Preparing"
          : "Order Placed"

  return (
    <>
      <div className="min-h-screen bg-[#F9FAFB] animate-fade-in">
        {/* Top AppBar — sticky top-0, NO back arrow */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
          <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-text-primary">{headerTitle}</h1>
              <span className="text-xs text-text-muted">
                #{order.order_number}
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-[500px] md:max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-5 md:space-y-6 pb-20 md:pb-10">
          {/* Hero status card */}
          <StatusHeroSection order={order} restaurant={restaurant} />

          {/* Status timeline with timestamps */}
          <StatusTimeline currentStatus={order.order_status} readyAt={order.ready_at} orderCreatedAt={order.created_at} preparedAt={order.prepared_at} />

          {/* WhatsApp + Call buttons */}
          {(whatsappUrl || restaurantPhone) && (
            <ContactButtons
              whatsappUrl={whatsappUrl}
              restaurantPhone={restaurantPhone}
              whatsappSuccess={whatsappSuccess}
              onSendWhatsapp={() => {
                window.open(whatsappUrl, "_blank")
                setWhatsappSuccess(true)
              }}
            />
          )}

          {/* Bank Transfer details — only shown when order placed with bank_transfer */}
          {order.payment_method === "bank_transfer" && (
            <PaymentTransferDetails
              tillId={restaurant?.payment_till_id}
              qrUrl={restaurant?.payment_qr_url}
              compact
            />
          )}

          {/* Desktop: 2-column grid for summary + details */}
          <div className="md:grid md:grid-cols-2 md:gap-6 space-y-5 md:space-y-0">
            <OrderSummaryCard
              items={order.items || []}
              deliveryFee={order.delivery_fee ?? 0}
              totalPrice={order.total_price}
              discountAmount={order.discount_amount}
              dealTitle={order.deals?.title_en}
            />
            <CustomerDetailsCard
              customerName={order.customer_name}
              customerPhone={order.customer_phone}
              tableNumber={order.table_number}
              orderType={order.order_type}
              paymentMethod={order.payment_method}
              deliveryAddress={order.delivery_address}
            />
          </div>

          {/* Sign-in Prompt — only for guests */}
          {!user && <SignInPromptBanner orderId={order.id} />}

          {/* Action buttons */}
          <OrderActionsBar
            isPending={isPending}
            isLoggedIn={!!user}
            isOwner={!!(user && (order.customer_id === user.id || !order.customer_id))}
            onReorder={handleReorder}
            onCancelClick={() => {
              if (user) setCancelDialogOpen(true)
              else setSignupToCancelDialogOpen(true)
            }}
            orderId={order.id}
            user={user}
          />

          {/* Receipt — download & print */}
          {restaurant && (
            <div className="pt-2">
              <OrderReceipt order={order} restaurant={restaurant} />
            </div>
          )}
        </main>
      </div>

      {/* Cancel Confirmation Dialog */}
      <CancelOrderDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelOrder}
        cancelling={cancelling}
        cancelError={cancelError}
        orderNumber={order.order_number}
      />

      {/* Sign-up to Cancel Dialog — for guests */}
      <SignUpToCancelDialog
        open={signupToCancelDialogOpen}
        onOpenChange={setSignupToCancelDialogOpen}
        orderId={order.id}
      />
    </>
  )
}
