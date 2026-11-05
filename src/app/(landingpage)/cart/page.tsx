import type { Metadata } from 'next'
import { CartPage } from '@/components/cart/CartPage'

export const metadata: Metadata = {
  title: 'Your cart',
}

/** /cart — review everything added from the homepage and the report chat. */
export default function CartRoute() {
  return <CartPage />
}
