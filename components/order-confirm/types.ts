export interface StatusHeroSectionProps {
  order: any
  restaurant?: any
}

export interface StatusTimelineProps {
  currentStatus: string
  readyAt?: string | null
  orderCreatedAt?: string | null
  preparedAt?: string | null
}

export interface ContactButtonsProps {
  whatsappUrl: string
  restaurantPhone: string
  whatsappSuccess: boolean
  onSendWhatsapp: () => void
}

export interface OrderSummaryCardProps {
  items: any[]
  deliveryFee: number
  totalPrice: number
  discountAmount?: number
  dealTitle?: string
}

export interface CustomerDetailsCardProps {
  customerName: string
  customerPhone?: string | null
  tableNumber?: string | null
  orderType: string
  paymentMethod: string
  deliveryAddress?: string | null
}

export interface OrderActionsBarProps {
  isPending: boolean
  isLoggedIn: boolean
  isOwner: boolean
  onReorder: () => void
  onCancelClick: () => void
  orderId: string
  user: any | null
}

export interface CancelOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  cancelling: boolean
  cancelError: string | null
  orderNumber?: number
}

export interface SignUpToCancelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
}
