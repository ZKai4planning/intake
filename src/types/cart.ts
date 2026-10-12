export type ReportTierId = 'RPT-001' | 'RPT-002' | 'RPT-003' | 'RPT-004' | 'RPT-005'

export interface CartItem {
  reportId: string
  tier:     ReportTierId
  label:    string
  priceGBP: number
  addedAt:  string
}

export interface CartResponse {
  items: CartItem[]
  total: number
}

export interface AddToCartRequest {
  reportId: string
}
