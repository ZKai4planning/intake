export interface CreateOrderRequest {
  amount: number // minor currency units, e.g. 2900 = £29.00
  currency: string // ISO 4217, e.g. 'GBP'
  merchant_order_ext_ref?: string
  description?: string
  customer_id?: string
  reportId?: string
  projectId?: string
}

export interface CreateOrderData {
  orderId:     string
  publicId:    string // token — what the embedded Revolut widget needs
  checkoutUrl: string // hosted-checkout redirect URL (create-order) / fallback (create-embedded-order)
  status:      'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  merchantRef: string
}

export interface CreateOrderResponse {
  success: boolean
  data:    CreateOrderData
}

export interface OrderStatusData {
  id:       string
  status:   'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  amount:   number
  currency: string
}

export interface OrderStatusResponse {
  success: boolean
  data:    OrderStatusData
}

export interface PaymentsConfigData {
  currency:     string
  merchantName: string
  mode:         'sandbox' | 'prod'
  baseUrl:      string
}

export interface PaymentsConfigResponse {
  success: boolean
  data:    PaymentsConfigData
}
