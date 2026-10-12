// // // 'use client'

// // // import { useEffect, useMemo, useState } from 'react'
// // // import { useParams, useRouter, useSearchParams } from 'next/navigation'
// // // import { getProject, updateProject, type Project, type PurchaseItem } from '@/lib/projects'
// // // import { getCart, removeFromCart } from '@/lib/cart'
// // // import { markReportUnlocked } from '@/lib/reportStorage'
// // // import { useToast } from '@/components/ui/Toast'
// // // import { cn } from '@/lib/cn'

// // // const DEFAULT_REPORT_ITEM: PurchaseItem = { id: 'report', label: 'Planning eligibility report', price: 49 }

// // // const ADD_ONS: (PurchaseItem & { detail: string })[] = [
// // //   { id: 'consultant-review', label: 'Consultant review of report', price: 99, detail: 'A planning consultant checks your result and flags risks' },
// // //   { id: 'site-plan',         label: 'Site plan & location plan',   price: 35, detail: 'Ordnance Survey-based · Required for most applications' },
// // //   { id: 'floor-plans',       label: 'Existing & proposed floor plans', price: 145, detail: 'CAD drawings by our team · Ready for submission' },
// // // ]

// // // /**
// // //  * /dashboard/new/[draftId]/checkout
// // //  * ────────────────────────────────────
// // //  * Reached either from the snapshot's "Get eligibility report" choice
// // //  * (default £49 item), or from the chat report flow's paywall — where
// // //  * ?fromReport=<id> points at the exact RPT-002/003 tier that was added
// // //  * to cart, so the price/label shown here matches what the person was
// // //  * quoted in chat rather than the flat default. Requires the snapshot's
// // //  * prerequisites (address + constraints) to already be saved — the
// // //  * chat-report claim path fills those in itself before redirecting here.
// // //  */
// // // export default function CheckoutPage() {
// // //   const params = useParams<{ draftId: string }>()
// // //   const searchParams = useSearchParams()
// // //   const router = useRouter()
// // //   const { show } = useToast()
// // //   const draftId = params.draftId
// // //   const fromReportId = searchParams.get('fromReport')

// // //   const [project, setProject] = useState<Project | null | undefined>(undefined)
// // //   const [addOnIds, setAddOnIds] = useState<Set<string>>(new Set())
// // //   const [card, setCard] = useState({ number: '', expiry: '', cvc: '' })
// // //   const [isPaying, setIsPaying] = useState(false)

// // //   useEffect(() => {
// // //     setProject(getProject(draftId))
// // //   }, [draftId])

// // //   const reportItem = useMemo((): PurchaseItem => {
// // //     if (!fromReportId) return DEFAULT_REPORT_ITEM
// // //     const cartItem = getCart().find(i => i.reportId === fromReportId)
// // //     if (!cartItem) return DEFAULT_REPORT_ITEM
// // //     return { id: cartItem.reportId, label: cartItem.label, price: cartItem.priceGBP }
// // //   }, [fromReportId])

// // //   const total = useMemo(() => {
// // //     const addOnTotal = ADD_ONS.filter(a => addOnIds.has(a.id)).reduce((sum, a) => sum + a.price, 0)
// // //     return reportItem.price + addOnTotal
// // //   }, [addOnIds, reportItem])

// // //   if (project === undefined) {
// // //     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
// // //   }

// // //   if (!project || !project.address || !project.constraints) {
// // //     if (typeof window !== 'undefined') router.replace(`/dashboard/new/${draftId}/address`)
// // //     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
// // //   }

// // //   function toggleAddOn(id: string) {
// // //     setAddOnIds(prev => {
// // //       const next = new Set(prev)
// // //       if (next.has(id)) next.delete(id)
// // //       else next.add(id)
// // //       return next
// // //     })
// // //   }

// // //   const cardValid = card.number.trim().length >= 12 && card.expiry.trim().length >= 4 && card.cvc.trim().length >= 3

// // //   async function handlePay() {
// // //     if (!cardValid) {
// // //       show('Enter a card number, expiry and CVC to continue.', 'error')
// // //       return
// // //     }
// // //     setIsPaying(true)
// // //     // Mock processing latency — same shape a real Stripe confirm-payment call would have.
// // //     await new Promise(resolve => window.setTimeout(resolve, 1200))

// // //     const items: PurchaseItem[] = [reportItem, ...ADD_ONS.filter(a => addOnIds.has(a.id))]
// // //     const { persisted } = updateProject(draftId, {
// // //       purchase: { items, total, paidAt: new Date().toISOString() },
// // //     })
// // //     setIsPaying(false)

// // //     if (!persisted) {
// // //       show("Payment succeeded but we couldn't save your report — please try again.", 'error')
// // //       return
// // //     }
// // //     if (fromReportId) {
// // //       removeFromCart(fromReportId)
// // //       markReportUnlocked(fromReportId)
// // //     }
// // //     show('Payment received — generating your report…', 'success')
// // //     router.push(`/dashboard/new/${draftId}/report`)
// // //   }

// // //   return (
// // //     <div className="max-w-[560px] mx-auto">
// // //       <button
// // //         onClick={() => router.push(`/dashboard/new/${draftId}/snapshot`)}
// // //         className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
// // //       >
// // //         ← Back to snapshot
// // //       </button>

// // //       <h1 className="font-display text-[26px] text-[#E8F0FF] mb-6">Review your order</h1>

// // //       <div className="rounded-[14px] border border-white/[0.08] bg-[#141C30] p-4 mb-6">
// // //         <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
// // //           <div>
// // //             <p className="text-[13.5px] font-semibold text-[#E8F0FF]">{reportItem.label}</p>
// // //             <p className="text-[12px] text-[#5A6A8A] mt-1">
// // //               {project.address.line1} · {project.title} · {project.address.council}
// // //             </p>
// // //           </div>
// // //           <p className="text-[15px] font-semibold text-[#E8F0FF] shrink-0">£{reportItem.price}</p>
// // //         </div>

// // //         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mt-4 mb-3">
// // //           Recommended add-ons
// // //         </p>
// // //         <div className="space-y-3">
// // //           {ADD_ONS.map(a => {
// // //             const added = addOnIds.has(a.id)
// // //             return (
// // //               <div key={a.id} className="flex items-center justify-between gap-3">
// // //                 <div>
// // //                   <p className="text-[13px] font-medium text-[#E8F0FF]">{a.label}</p>
// // //                   <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">{a.detail}</p>
// // //                 </div>
// // //                 <div className="flex items-center gap-2.5 shrink-0">
// // //                   <span className="text-[13px] font-semibold text-[#E8F0FF]">£{a.price}</span>
// // //                   <button
// // //                     type="button"
// // //                     onClick={() => toggleAddOn(a.id)}
// // //                     className={cn(
// // //                       'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
// // //                       added
// // //                         ? 'border-[#135BEC]/40 bg-[rgba(19,91,236,0.1)] text-[#135BEC]'
// // //                         : 'border-white/[0.14] text-[#A8B8D8] hover:border-white/[0.28] hover:text-[#E8F0FF]'
// // //                     )}
// // //                   >
// // //                     {added ? '✓ Added' : '+ Add'}
// // //                   </button>
// // //                 </div>
// // //               </div>
// // //             )
// // //           })}
// // //         </div>

// // //         <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08]">
// // //           <p className="text-[13px] font-semibold text-[#E8F0FF]">Total</p>
// // //           <p className="font-display text-[20px] text-[#135BEC]">£{total}</p>
// // //         </div>
// // //       </div>

// // //       <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6">
// // //         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3.5">
// // //           Payment details
// // //         </p>
// // //         <div className="space-y-3.5">
// // //           <Field label="Card number">
// // //             <input
// // //               type="text"
// // //               inputMode="numeric"
// // //               placeholder="1234 5678 9012 3456"
// // //               value={card.number}
// // //               onChange={e => setCard(c => ({ ...c, number: e.target.value }))}
// // //               className={inputClass}
// // //             />
// // //           </Field>
// // //           <div className="grid grid-cols-2 gap-3">
// // //             <Field label="Expiry">
// // //               <input
// // //                 type="text"
// // //                 placeholder="MM / YY"
// // //                 value={card.expiry}
// // //                 onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
// // //                 className={inputClass}
// // //               />
// // //             </Field>
// // //             <Field label="CVC">
// // //               <input
// // //                 type="text"
// // //                 inputMode="numeric"
// // //                 placeholder="123"
// // //                 value={card.cvc}
// // //                 onChange={e => setCard(c => ({ ...c, cvc: e.target.value }))}
// // //                 className={inputClass}
// // //               />
// // //             </Field>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <button
// // //         type="button"
// // //         onClick={handlePay}
// // //         disabled={isPaying}
// // //         className="w-full px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)] disabled:opacity-60 disabled:cursor-not-allowed mb-3"
// // //       >
// // //         {isPaying ? 'Processing…' : `🔒 Pay and generate report · £${total}`}
// // //       </button>
// // //       <p className="text-center text-[12px] text-[#5A6A8A]">
// // //         Payment taken before report is released · Secured by Stripe
// // //       </p>
// // //     </div>
// // //   )
// // // }

// // // const inputClass = cn(
// // //   'w-full rounded-[10px] px-3.5 py-2.5 text-[13.5px]',
// // //   'bg-[#141C30] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
// // //   'border border-white/[0.12] outline-none transition-all',
// // //   'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]'
// // // )

// // // function Field({ label, children }: { label: string; children: React.ReactNode }) {
// // //   return (
// // //     <label className="block">
// // //       <span className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">{label}</span>
// // //       {children}
// // //     </label>
// // //   )
// // // }

// // 'use client'

// // import { useEffect, useMemo, useRef, useState } from 'react'
// // import { useParams, useRouter, useSearchParams } from 'next/navigation'
// // import { getProject, updateProject, type Project, type PurchaseItem } from '@/lib/projects'
// // import { getCart, removeFromCart } from '@/lib/cart'
// // import { markReportUnlocked } from '@/lib/reportStorage'
// // import { useToast } from '@/components/ui/Toast'
// // import { cn } from '@/lib/cn'

// // const DEFAULT_REPORT_ITEM: PurchaseItem = { id: 'report', label: 'Planning eligibility report', price: 49 }

// // const ADD_ONS: (PurchaseItem & { detail: string })[] = [
// //   { id: 'consultant-review', label: 'Consultant review of report', price: 99, detail: 'A planning consultant checks your result and flags risks' },
// //   { id: 'site-plan',         label: 'Site plan & location plan',   price: 35, detail: 'Ordnance Survey-based · Required for most applications' },
// //   { id: 'floor-plans',       label: 'Existing & proposed floor plans', price: 145, detail: 'CAD drawings by our team · Ready for submission' },
// // ]

// // /**
// //  * /dashboard/new/[draftId]/checkout
// //  * ────────────────────────────────────
// //  * Reached either from the snapshot's "Get eligibility report" choice
// //  * (default £49 item), or from the chat report flow's paywall — where
// //  * ?fromReport=<id> points at the exact RPT-002/003 tier that was added
// //  * to cart, so the price/label shown here matches what the person was
// //  * quoted in chat rather than the flat default. Requires the snapshot's
// //  * prerequisites (address + constraints) to already be saved — the
// //  * chat-report claim path fills those in itself before redirecting here.
// //  */
// // export default function CheckoutPage() {
// //   const params = useParams<{ draftId: string }>()
// //   const searchParams = useSearchParams()
// //   const router = useRouter()
// //   const { show } = useToast()
// //   const draftId = params.draftId
// //   const fromReportId = searchParams.get('fromReport')

// //   const [project, setProject] = useState<Project | null | undefined>(undefined)
// //   const [addOnIds, setAddOnIds] = useState<Set<string>>(new Set())
// //   const [isPaying, setIsPaying] = useState(false)
// //   const [widgetError, setWidgetError] = useState('')
// //   const widgetContainerRef = useRef<HTMLDivElement>(null)

// //   useEffect(() => {
// //     setProject(getProject(draftId))
// //   }, [draftId])

// //   const reportItem = useMemo((): PurchaseItem => {
// //     if (!fromReportId) return DEFAULT_REPORT_ITEM
// //     const cartItem = getCart().find(i => i.reportId === fromReportId)
// //     if (!cartItem) return DEFAULT_REPORT_ITEM
// //     return { id: cartItem.reportId, label: cartItem.label, price: cartItem.priceGBP }
// //   }, [fromReportId])

// //   const total = useMemo(() => {
// //     const addOnTotal = ADD_ONS.filter(a => addOnIds.has(a.id)).reduce((sum, a) => sum + a.price, 0)
// //     return reportItem.price + addOnTotal
// //   }, [addOnIds, reportItem])

// //   function finalizePurchase() {
// //     const items: PurchaseItem[] = [reportItem, ...ADD_ONS.filter(a => addOnIds.has(a.id))]
// //     const { persisted } = updateProject(draftId, {
// //       purchase: { items, total, paidAt: new Date().toISOString() },
// //     })
// //     setIsPaying(false)

// //     if (!persisted) {
// //       show("Payment succeeded but we couldn't save your report — please try again.", 'error')
// //       return
// //     }
// //     if (fromReportId) {
// //       removeFromCart(fromReportId)
// //       markReportUnlocked(fromReportId)
// //     }
// //     show('Payment received — generating your report…', 'success')
// //     router.push(`/dashboard/new/${draftId}/report`)
// //   }

// //   // Mounts the Revolut embedded checkout widget once the order total is
// //   // known — same integration as the standalone /payment reference page:
// //   // fetch publicKey/mode from /api/payments/config, then hand the SDK a
// //   // createOrder callback that hits /api/payments/create-embedded-order.
// //   // NOTE: this hook (and every hook in this component) must run on every
// //   // render, so it lives above the early `if (project === undefined) return`
// //   // / `if (!project...) return` checks below — hooks can't come after a
// //   // conditional return, or React throws "Rendered more hooks than during
// //   // the previous render" the moment `project` flips from undefined to set.
// //   useEffect(() => {
// //     if (!project || !widgetContainerRef.current || total <= 0) return
// //     let destroyWidget: (() => void) | undefined
// //     let cancelled = false

// //     async function init() {
// //       try {
// //         const configRes = await fetch('/api/payments/config')
// //         const config = await configRes.json()
// //         if (!config.success) throw new Error(config.message || 'Failed to load payment config')

// //         const { publicKey, mode } = config.data
// //         if (!publicKey) throw new Error('Payments are not configured yet — missing Revolut public key.')

// //         const RevolutCheckout = await import('@revolut/checkout')
// //         if (cancelled) return

// //         const { destroy } = await RevolutCheckout.default.embeddedCheckout({
// //           publicToken: publicKey,
// //           mode: mode === 'prod' ? 'prod' : 'sandbox',
// //           locale: 'auto',
// //           target: widgetContainerRef.current!,

// //           createOrder: async () => {
// //             const response = await fetch('/api/payments/create-embedded-order', {
// //               method: 'POST',
// //               headers: { 'Content-Type': 'application/json' },
// //               body: JSON.stringify({
// //                 amount: Math.round(total * 100), // minor units (pence)
// //                 currency: 'GBP',
// //                 description: reportItem.label,
// //                 reportId: fromReportId ?? undefined,
// //                 projectId: draftId,
// //               }),
// //             })
// //             const data = await response.json()
// //             if (!data.success) throw new Error(data.message || data.error || 'Order creation failed')
// //             return { publicId: data.data.publicId }
// //           },

// //           onSuccess: () => {
// //             finalizePurchase()
// //           },

// //           onError: ({ error: checkoutError }) => {
// //             setWidgetError(checkoutError.message)
// //             setIsPaying(false)
// //           },

// //           onCancel: () => {
// //             setIsPaying(false)
// //           },
// //         })
// //         destroyWidget = destroy
// //       } catch (err: any) {
// //         if (!cancelled) setWidgetError(err.message || 'Could not load the payment widget.')
// //       }
// //     }

// //     init()
// //     return () => {
// //       cancelled = true
// //       destroyWidget?.()
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [project, total])

// //   if (project === undefined) {
// //     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
// //   }

// //   if (!project || !project.address || !project.constraints) {
// //     if (typeof window !== 'undefined') router.replace(`/dashboard/new/${draftId}/address`)
// //     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
// //   }

// //   function toggleAddOn(id: string) {
// //     setAddOnIds(prev => {
// //       const next = new Set(prev)
// //       if (next.has(id)) next.delete(id)
// //       else next.add(id)
// //       return next
// //     })
// //   }

// //   return (
// //     <div className="max-w-[560px] mx-auto">
// //       <button
// //         onClick={() => router.push(`/dashboard/new/${draftId}/snapshot`)}
// //         className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
// //       >
// //         ← Back to snapshot
// //       </button>

// //       <h1 className="font-display text-[26px] text-[#E8F0FF] mb-6">Review your order</h1>

// //       <div className="rounded-[14px] border border-white/[0.08] bg-[#141C30] p-4 mb-6">
// //         <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
// //           <div>
// //             <p className="text-[13.5px] font-semibold text-[#E8F0FF]">{reportItem.label}</p>
// //             <p className="text-[12px] text-[#5A6A8A] mt-1">
// //               {project.address.line1} · {project.title} · {project.address.council}
// //             </p>
// //           </div>
// //           <p className="text-[15px] font-semibold text-[#E8F0FF] shrink-0">£{reportItem.price}</p>
// //         </div>

// //         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mt-4 mb-3">
// //           Recommended add-ons
// //         </p>
// //         <div className="space-y-3">
// //           {ADD_ONS.map(a => {
// //             const added = addOnIds.has(a.id)
// //             return (
// //               <div key={a.id} className="flex items-center justify-between gap-3">
// //                 <div>
// //                   <p className="text-[13px] font-medium text-[#E8F0FF]">{a.label}</p>
// //                   <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">{a.detail}</p>
// //                 </div>
// //                 <div className="flex items-center gap-2.5 shrink-0">
// //                   <span className="text-[13px] font-semibold text-[#E8F0FF]">£{a.price}</span>
// //                   <button
// //                     type="button"
// //                     onClick={() => toggleAddOn(a.id)}
// //                     className={cn(
// //                       'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
// //                       added
// //                         ? 'border-[#135BEC]/40 bg-[rgba(19,91,236,0.1)] text-[#135BEC]'
// //                         : 'border-white/[0.14] text-[#A8B8D8] hover:border-white/[0.28] hover:text-[#E8F0FF]'
// //                     )}
// //                   >
// //                     {added ? '✓ Added' : '+ Add'}
// //                   </button>
// //                 </div>
// //               </div>
// //             )
// //           })}
// //         </div>

// //         <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08]">
// //           <p className="text-[13px] font-semibold text-[#E8F0FF]">Total</p>
// //           <p className="font-display text-[20px] text-[#135BEC]">£{total}</p>
// //         </div>
// //       </div>

// //       <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6">
// //         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3.5">
// //           Payment details
// //         </p>

// //         {widgetError && (
// //           <p className="mb-3 rounded-[10px] border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-300">
// //             {widgetError}
// //           </p>
// //         )}

// //         {/* Revolut embedded checkout widget mounts here — same integration
// //            as the /payment reference page (@revolut/checkout embeddedCheckout). */}
// //         <div ref={widgetContainerRef} className="min-h-[220px]" />
// //       </div>

// //       <p className="text-center text-[12px] text-[#5A6A8A]">
// //         Payment taken before report is released · Secured by Revolut
// //       </p>
// //     </div>
// //   )
// // }

// // 'use client'

// // import { useEffect, useMemo, useState } from 'react'
// // import { useParams, useRouter, useSearchParams } from 'next/navigation'
// // import { getProject, updateProject, type Project, type PurchaseItem } from '@/lib/projects'
// // import { getCart, removeFromCart } from '@/lib/cart'
// // import { markReportUnlocked } from '@/lib/reportStorage'
// // import { useToast } from '@/components/ui/Toast'
// // import { cn } from '@/lib/cn'

// // const DEFAULT_REPORT_ITEM: PurchaseItem = { id: 'report', label: 'Planning eligibility report', price: 49 }

// // const ADD_ONS: (PurchaseItem & { detail: string })[] = [
// //   { id: 'consultant-review', label: 'Consultant review of report', price: 99, detail: 'A planning consultant checks your result and flags risks' },
// //   { id: 'site-plan',         label: 'Site plan & location plan',   price: 35, detail: 'Ordnance Survey-based · Required for most applications' },
// //   { id: 'floor-plans',       label: 'Existing & proposed floor plans', price: 145, detail: 'CAD drawings by our team · Ready for submission' },
// // ]

// // /**
// //  * /dashboard/new/[draftId]/checkout
// //  * ────────────────────────────────────
// //  * Reached either from the snapshot's "Get eligibility report" choice
// //  * (default £49 item), or from the chat report flow's paywall — where
// //  * ?fromReport=<id> points at the exact RPT-002/003 tier that was added
// //  * to cart, so the price/label shown here matches what the person was
// //  * quoted in chat rather than the flat default. Requires the snapshot's
// //  * prerequisites (address + constraints) to already be saved — the
// //  * chat-report claim path fills those in itself before redirecting here.
// //  */
// // export default function CheckoutPage() {
// //   const params = useParams<{ draftId: string }>()
// //   const searchParams = useSearchParams()
// //   const router = useRouter()
// //   const { show } = useToast()
// //   const draftId = params.draftId
// //   const fromReportId = searchParams.get('fromReport')

// //   const [project, setProject] = useState<Project | null | undefined>(undefined)
// //   const [addOnIds, setAddOnIds] = useState<Set<string>>(new Set())
// //   const [card, setCard] = useState({ number: '', expiry: '', cvc: '' })
// //   const [isPaying, setIsPaying] = useState(false)

// //   useEffect(() => {
// //     setProject(getProject(draftId))
// //   }, [draftId])

// //   const reportItem = useMemo((): PurchaseItem => {
// //     if (!fromReportId) return DEFAULT_REPORT_ITEM
// //     const cartItem = getCart().find(i => i.reportId === fromReportId)
// //     if (!cartItem) return DEFAULT_REPORT_ITEM
// //     return { id: cartItem.reportId, label: cartItem.label, price: cartItem.priceGBP }
// //   }, [fromReportId])

// //   const total = useMemo(() => {
// //     const addOnTotal = ADD_ONS.filter(a => addOnIds.has(a.id)).reduce((sum, a) => sum + a.price, 0)
// //     return reportItem.price + addOnTotal
// //   }, [addOnIds, reportItem])

// //   if (project === undefined) {
// //     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
// //   }

// //   if (!project || !project.address || !project.constraints) {
// //     if (typeof window !== 'undefined') router.replace(`/dashboard/new/${draftId}/address`)
// //     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
// //   }

// //   function toggleAddOn(id: string) {
// //     setAddOnIds(prev => {
// //       const next = new Set(prev)
// //       if (next.has(id)) next.delete(id)
// //       else next.add(id)
// //       return next
// //     })
// //   }

// //   const cardValid = card.number.trim().length >= 12 && card.expiry.trim().length >= 4 && card.cvc.trim().length >= 3

// //   async function handlePay() {
// //     if (!cardValid) {
// //       show('Enter a card number, expiry and CVC to continue.', 'error')
// //       return
// //     }
// //     setIsPaying(true)
// //     // Mock processing latency — same shape a real Stripe confirm-payment call would have.
// //     await new Promise(resolve => window.setTimeout(resolve, 1200))

// //     const items: PurchaseItem[] = [reportItem, ...ADD_ONS.filter(a => addOnIds.has(a.id))]
// //     const { persisted } = updateProject(draftId, {
// //       purchase: { items, total, paidAt: new Date().toISOString() },
// //     })
// //     setIsPaying(false)

// //     if (!persisted) {
// //       show("Payment succeeded but we couldn't save your report — please try again.", 'error')
// //       return
// //     }
// //     if (fromReportId) {
// //       removeFromCart(fromReportId)
// //       markReportUnlocked(fromReportId)
// //     }
// //     show('Payment received — generating your report…', 'success')
// //     router.push(`/dashboard/new/${draftId}/report`)
// //   }

// //   return (
// //     <div className="max-w-[560px] mx-auto">
// //       <button
// //         onClick={() => router.push(`/dashboard/new/${draftId}/snapshot`)}
// //         className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
// //       >
// //         ← Back to snapshot
// //       </button>

// //       <h1 className="font-display text-[26px] text-[#E8F0FF] mb-6">Review your order</h1>

// //       <div className="rounded-[14px] border border-white/[0.08] bg-[#141C30] p-4 mb-6">
// //         <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
// //           <div>
// //             <p className="text-[13.5px] font-semibold text-[#E8F0FF]">{reportItem.label}</p>
// //             <p className="text-[12px] text-[#5A6A8A] mt-1">
// //               {project.address.line1} · {project.title} · {project.address.council}
// //             </p>
// //           </div>
// //           <p className="text-[15px] font-semibold text-[#E8F0FF] shrink-0">£{reportItem.price}</p>
// //         </div>

// //         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mt-4 mb-3">
// //           Recommended add-ons
// //         </p>
// //         <div className="space-y-3">
// //           {ADD_ONS.map(a => {
// //             const added = addOnIds.has(a.id)
// //             return (
// //               <div key={a.id} className="flex items-center justify-between gap-3">
// //                 <div>
// //                   <p className="text-[13px] font-medium text-[#E8F0FF]">{a.label}</p>
// //                   <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">{a.detail}</p>
// //                 </div>
// //                 <div className="flex items-center gap-2.5 shrink-0">
// //                   <span className="text-[13px] font-semibold text-[#E8F0FF]">£{a.price}</span>
// //                   <button
// //                     type="button"
// //                     onClick={() => toggleAddOn(a.id)}
// //                     className={cn(
// //                       'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
// //                       added
// //                         ? 'border-[#135BEC]/40 bg-[rgba(19,91,236,0.1)] text-[#135BEC]'
// //                         : 'border-white/[0.14] text-[#A8B8D8] hover:border-white/[0.28] hover:text-[#E8F0FF]'
// //                     )}
// //                   >
// //                     {added ? '✓ Added' : '+ Add'}
// //                   </button>
// //                 </div>
// //               </div>
// //             )
// //           })}
// //         </div>

// //         <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08]">
// //           <p className="text-[13px] font-semibold text-[#E8F0FF]">Total</p>
// //           <p className="font-display text-[20px] text-[#135BEC]">£{total}</p>
// //         </div>
// //       </div>

// //       <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6">
// //         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3.5">
// //           Payment details
// //         </p>
// //         <div className="space-y-3.5">
// //           <Field label="Card number">
// //             <input
// //               type="text"
// //               inputMode="numeric"
// //               placeholder="1234 5678 9012 3456"
// //               value={card.number}
// //               onChange={e => setCard(c => ({ ...c, number: e.target.value }))}
// //               className={inputClass}
// //             />
// //           </Field>
// //           <div className="grid grid-cols-2 gap-3">
// //             <Field label="Expiry">
// //               <input
// //                 type="text"
// //                 placeholder="MM / YY"
// //                 value={card.expiry}
// //                 onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
// //                 className={inputClass}
// //               />
// //             </Field>
// //             <Field label="CVC">
// //               <input
// //                 type="text"
// //                 inputMode="numeric"
// //                 placeholder="123"
// //                 value={card.cvc}
// //                 onChange={e => setCard(c => ({ ...c, cvc: e.target.value }))}
// //                 className={inputClass}
// //               />
// //             </Field>
// //           </div>
// //         </div>
// //       </div>

// //       <button
// //         type="button"
// //         onClick={handlePay}
// //         disabled={isPaying}
// //         className="w-full px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)] disabled:opacity-60 disabled:cursor-not-allowed mb-3"
// //       >
// //         {isPaying ? 'Processing…' : `🔒 Pay and generate report · £${total}`}
// //       </button>
// //       <p className="text-center text-[12px] text-[#5A6A8A]">
// //         Payment taken before report is released · Secured by Stripe
// //       </p>
// //     </div>
// //   )
// // }

// // const inputClass = cn(
// //   'w-full rounded-[10px] px-3.5 py-2.5 text-[13.5px]',
// //   'bg-[#141C30] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
// //   'border border-white/[0.12] outline-none transition-all',
// //   'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]'
// // )

// // function Field({ label, children }: { label: string; children: React.ReactNode }) {
// //   return (
// //     <label className="block">
// //       <span className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">{label}</span>
// //       {children}
// //     </label>
// //   )
// // }

// 'use client'

// import { useEffect, useMemo, useRef, useState } from 'react'
// import { useParams, useRouter, useSearchParams } from 'next/navigation'
// import { getProject, updateProject, type Project, type PurchaseItem } from '@/lib/projects'
// import { getCart, removeFromCart } from '@/lib/cart'
// import { markReportUnlocked } from '@/lib/reportStorage'
// import { useToast } from '@/components/ui/Toast'
// import { cn } from '@/lib/cn'

// const DEFAULT_REPORT_ITEM: PurchaseItem = { id: 'report', label: 'Planning eligibility report', price: 49 }

// const ADD_ONS: (PurchaseItem & { detail: string })[] = [
//   { id: 'consultant-review', label: 'Consultant review of report', price: 99, detail: 'A planning consultant checks your result and flags risks' },
//   { id: 'site-plan',         label: 'Site plan & location plan',   price: 35, detail: 'Ordnance Survey-based · Required for most applications' },
//   { id: 'floor-plans',       label: 'Existing & proposed floor plans', price: 145, detail: 'CAD drawings by our team · Ready for submission' },
// ]

// /**
//  * /dashboard/new/[draftId]/checkout
//  * ────────────────────────────────────
//  * Reached either from the snapshot's "Get eligibility report" choice
//  * (default £49 item), or from the chat report flow's paywall — where
//  * ?fromReport=<id> points at the exact RPT-002/003 tier that was added
//  * to cart, so the price/label shown here matches what the person was
//  * quoted in chat rather than the flat default. Requires the snapshot's
//  * prerequisites (address + constraints) to already be saved — the
//  * chat-report claim path fills those in itself before redirecting here.
//  */
// export default function CheckoutPage() {
//   const params = useParams<{ draftId: string }>()
//   const searchParams = useSearchParams()
//   const router = useRouter()
//   const { show } = useToast()
//   const draftId = params.draftId
//   const fromReportId = searchParams.get('fromReport')

//   const [project, setProject] = useState<Project | null | undefined>(undefined)
//   const [addOnIds, setAddOnIds] = useState<Set<string>>(new Set())
//   const [isPaying, setIsPaying] = useState(false)
//   const [widgetError, setWidgetError] = useState('')
//   const widgetContainerRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     setProject(getProject(draftId))
//   }, [draftId])

//   const reportItem = useMemo((): PurchaseItem => {
//     if (!fromReportId) return DEFAULT_REPORT_ITEM
//     const cartItem = getCart().find(i => i.reportId === fromReportId)
//     if (!cartItem) return DEFAULT_REPORT_ITEM
//     return { id: cartItem.reportId, label: cartItem.label, price: cartItem.priceGBP }
//   }, [fromReportId])

//   const total = useMemo(() => {
//     const addOnTotal = ADD_ONS.filter(a => addOnIds.has(a.id)).reduce((sum, a) => sum + a.price, 0)
//     return reportItem.price + addOnTotal
//   }, [addOnIds, reportItem])

//   function finalizePurchase() {
//     const items: PurchaseItem[] = [reportItem, ...ADD_ONS.filter(a => addOnIds.has(a.id))]
//     const { persisted } = updateProject(draftId, {
//       purchase: { items, total, paidAt: new Date().toISOString() },
//     })
//     setIsPaying(false)

//     if (!persisted) {
//       show("Payment succeeded but we couldn't save your report — please try again.", 'error')
//       return
//     }
//     if (fromReportId) {
//       removeFromCart(fromReportId)
//       markReportUnlocked(fromReportId)
//     }
//     show('Payment received — generating your report…', 'success')
//     router.push(`/dashboard/new/${draftId}/report`)
//   }

//   // Mounts the Revolut embedded checkout widget once the order total is
//   // known — same integration as the standalone /payment reference page:
//   // fetch publicKey/mode from /api/payments/config, then hand the SDK a
//   // createOrder callback that hits /api/payments/create-embedded-order.
//   // NOTE: this hook (and every hook in this component) must run on every
//   // render, so it lives above the early `if (project === undefined) return`
//   // / `if (!project...) return` checks below — hooks can't come after a
//   // conditional return, or React throws "Rendered more hooks than during
//   // the previous render" the moment `project` flips from undefined to set.
//   useEffect(() => {
//     if (!project || !widgetContainerRef.current || total <= 0) return
//     let destroyWidget: (() => void) | undefined
//     let cancelled = false

//     async function init() {
//       try {
//         const configRes = await fetch('/api/payments/config')
//         const config = await configRes.json()
//         if (!config.success) throw new Error(config.message || 'Failed to load payment config')

//         const { publicKey, mode } = config.data
//         if (!publicKey) throw new Error('Payments are not configured yet — missing Revolut public key.')

//         const RevolutCheckout = await import('@revolut/checkout')
//         if (cancelled) return

//         const { destroy } = await RevolutCheckout.default.embeddedCheckout({
//           publicToken: publicKey,
//           mode: mode === 'prod' ? 'prod' : 'sandbox',
//           locale: 'auto',
//           target: widgetContainerRef.current!,

//           createOrder: async () => {
//             const response = await fetch('/api/payments/create-embedded-order', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({
//                 amount: Math.round(total * 100), // minor units (pence)
//                 currency: 'GBP',
//                 description: reportItem.label,
//                 reportId: fromReportId ?? undefined,
//                 projectId: draftId,
//               }),
//             })
//             const data = await response.json()
//             if (!data.success) throw new Error(data.message || data.error || 'Order creation failed')
//             return { publicId: data.data.publicId }
//           },

//           onSuccess: () => {
//             finalizePurchase()
//           },

//           onError: ({ error: checkoutError }) => {
//             setWidgetError(checkoutError.message)
//             setIsPaying(false)
//           },

//           onCancel: () => {
//             setIsPaying(false)
//           },
//         })
//         destroyWidget = destroy
//       } catch (err: any) {
//         if (!cancelled) setWidgetError(err.message || 'Could not load the payment widget.')
//       }
//     }

//     init()
//     return () => {
//       cancelled = true
//       destroyWidget?.()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [project, total])

//   if (project === undefined) {
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
//   }

//   if (!project || !project.address || !project.constraints) {
//     if (typeof window !== 'undefined') router.replace(`/dashboard/new/${draftId}/address`)
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
//   }

//   function toggleAddOn(id: string) {
//     setAddOnIds(prev => {
//       const next = new Set(prev)
//       if (next.has(id)) next.delete(id)
//       else next.add(id)
//       return next
//     })
//   }

//   return (
//     <div className="max-w-[560px] mx-auto">
//       <button
//         onClick={() => router.push(`/dashboard/new/${draftId}/snapshot`)}
//         className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
//       >
//         ← Back to snapshot
//       </button>

//       <h1 className="font-display text-[26px] text-[#E8F0FF] mb-6">Review your order</h1>

//       <div className="rounded-[14px] border border-white/[0.08] bg-[#141C30] p-4 mb-6">
//         <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
//           <div>
//             <p className="text-[13.5px] font-semibold text-[#E8F0FF]">{reportItem.label}</p>
//             <p className="text-[12px] text-[#5A6A8A] mt-1">
//               {project.address.line1} · {project.title} · {project.address.council}
//             </p>
//           </div>
//           <p className="text-[15px] font-semibold text-[#E8F0FF] shrink-0">£{reportItem.price}</p>
//         </div>

//         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mt-4 mb-3">
//           Recommended add-ons
//         </p>
//         <div className="space-y-3">
//           {ADD_ONS.map(a => {
//             const added = addOnIds.has(a.id)
//             return (
//               <div key={a.id} className="flex items-center justify-between gap-3">
//                 <div>
//                   <p className="text-[13px] font-medium text-[#E8F0FF]">{a.label}</p>
//                   <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">{a.detail}</p>
//                 </div>
//                 <div className="flex items-center gap-2.5 shrink-0">
//                   <span className="text-[13px] font-semibold text-[#E8F0FF]">£{a.price}</span>
//                   <button
//                     type="button"
//                     onClick={() => toggleAddOn(a.id)}
//                     className={cn(
//                       'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
//                       added
//                         ? 'border-[#135BEC]/40 bg-[rgba(19,91,236,0.1)] text-[#135BEC]'
//                         : 'border-white/[0.14] text-[#A8B8D8] hover:border-white/[0.28] hover:text-[#E8F0FF]'
//                     )}
//                   >
//                     {added ? '✓ Added' : '+ Add'}
//                   </button>
//                 </div>
//               </div>
//             )
//           })}
//         </div>

//         <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08]">
//           <p className="text-[13px] font-semibold text-[#E8F0FF]">Total</p>
//           <p className="font-display text-[20px] text-[#135BEC]">£{total}</p>
//         </div>
//       </div>

//       <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6">
//         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3.5">
//           Payment details
//         </p>

//         {widgetError && (
//           <p className="mb-3 rounded-[10px] border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-300">
//             {widgetError}
//           </p>
//         )}

//         {/* Revolut embedded checkout widget mounts here — same integration
//            as the /payment reference page (@revolut/checkout embeddedCheckout). */}
//         <div ref={widgetContainerRef} className="min-h-[220px]" />
//       </div>

//       <p className="text-center text-[12px] text-[#5A6A8A]">
//         Payment taken before report is released · Secured by Revolut
//       </p>
//     </div>
//   )
// }

// 'use client'

// import { useEffect, useMemo, useRef, useState } from 'react'
// import { useParams, useRouter, useSearchParams } from 'next/navigation'
// import { getProject, updateProject, type Project, type PurchaseItem } from '@/lib/projects'
// import { getCart, removeFromCart } from '@/lib/cart'
// import { markReportUnlocked } from '@/lib/reportStorage'
// import { useToast } from '@/components/ui/Toast'
// import { cn } from '@/lib/cn'

// const DEFAULT_REPORT_ITEM: PurchaseItem = { id: 'report', label: 'Planning eligibility report', price: 49 }

// const ADD_ONS: (PurchaseItem & { detail: string })[] = [
//   { id: 'consultant-review', label: 'Consultant review of report', price: 99, detail: 'A planning consultant checks your result and flags risks' },
//   { id: 'site-plan',         label: 'Site plan & location plan',   price: 35, detail: 'Ordnance Survey-based · Required for most applications' },
//   { id: 'floor-plans',       label: 'Existing & proposed floor plans', price: 145, detail: 'CAD drawings by our team · Ready for submission' },
// ]

// /**
//  * Payment method for this page. 'mock' simulates a successful card
//  * charge client-side with no external calls — switch to 'revolut' to
//  * use the live @revolut/checkout embedded widget again once the
//  * integration issue with /api/payments/config /
//  * /api/payments/create-embedded-order is sorted out. Nothing else in
//  * this file needs to change either way.
//  */
// const PAYMENT_METHOD: 'mock' | 'revolut' = 'mock'

// /**
//  * /dashboard/new/[draftId]/checkout
//  * ────────────────────────────────────
//  * Reached either from the snapshot's "Get eligibility report" choice
//  * (default £49 item), or from the chat report flow's paywall — where
//  * ?fromReport=<id> points at the exact RPT-002/003 tier that was added
//  * to cart, so the price/label shown here matches what the person was
//  * quoted in chat rather than the flat default. Requires the snapshot's
//  * prerequisites (address + constraints) to already be saved — the
//  * chat-report claim path fills those in itself before redirecting here.
//  */
// export default function CheckoutPage() {
//   const params = useParams<{ draftId: string }>()
//   const searchParams = useSearchParams()
//   const router = useRouter()
//   const { show } = useToast()
//   const draftId = params.draftId
//   const fromReportId = searchParams.get('fromReport')

//   const [project, setProject] = useState<Project | null | undefined>(undefined)
//   const [addOnIds, setAddOnIds] = useState<Set<string>>(new Set())
//   const [isPaying, setIsPaying] = useState(false)
//   const [widgetError, setWidgetError] = useState('')
//   const [card, setCard] = useState({ number: '', expiry: '', cvc: '' })
//   const widgetContainerRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     setProject(getProject(draftId))
//   }, [draftId])

//   const reportItem = useMemo((): PurchaseItem => {
//     if (!fromReportId) return DEFAULT_REPORT_ITEM
//     const cartItem = getCart().find(i => i.reportId === fromReportId)
//     if (!cartItem) return DEFAULT_REPORT_ITEM
//     return { id: cartItem.reportId, label: cartItem.label, price: cartItem.priceGBP }
//   }, [fromReportId])

//   const total = useMemo(() => {
//     const addOnTotal = ADD_ONS.filter(a => addOnIds.has(a.id)).reduce((sum, a) => sum + a.price, 0)
//     return reportItem.price + addOnTotal
//   }, [addOnIds, reportItem])

//   function finalizePurchase() {
//     const items: PurchaseItem[] = [reportItem, ...ADD_ONS.filter(a => addOnIds.has(a.id))]
//     const { persisted } = updateProject(draftId, {
//       purchase: { items, total, paidAt: new Date().toISOString() },
//     })
//     setIsPaying(false)

//     if (!persisted) {
//       show("Payment succeeded but we couldn't save your report — please try again.", 'error')
//       return
//     }
//     if (fromReportId) {
//       removeFromCart(fromReportId)
//       markReportUnlocked(fromReportId)
//     }
//     show('Payment received — generating your report…', 'success')
//     router.push(`/dashboard/new/${draftId}/report`)
//   }

//   // Mounts the Revolut embedded checkout widget once the order total is
//   // known — same integration as the standalone /payment reference page:
//   // fetch publicKey/mode from /api/payments/config, then hand the SDK a
//   // createOrder callback that hits /api/payments/create-embedded-order.
//   // Only runs when PAYMENT_METHOD === 'revolut'.
//   // NOTE: this hook (and every hook in this component) must run on every
//   // render, so it lives above the early `if (project === undefined) return`
//   // / `if (!project...) return` checks below — hooks can't come after a
//   // conditional return, or React throws "Rendered more hooks than during
//   // the previous render" the moment `project` flips from undefined to set.
//   useEffect(() => {
//     if (PAYMENT_METHOD !== 'revolut') return
//     if (!project || !widgetContainerRef.current || total <= 0) return
//     let destroyWidget: (() => void) | undefined
//     let cancelled = false

//     async function init() {
//       try {
//         const configRes = await fetch('/api/payments/config')
//         const config = await configRes.json()
//         if (!config.success) throw new Error(config.message || 'Failed to load payment config')

//         const { publicKey, mode } = config.data
//         if (!publicKey) throw new Error('Payments are not configured yet — missing Revolut public key.')

//         const RevolutCheckout = await import('@revolut/checkout')
//         if (cancelled) return

//         const { destroy } = await RevolutCheckout.default.embeddedCheckout({
//           publicToken: publicKey,
//           mode: mode === 'prod' ? 'prod' : 'sandbox',
//           locale: 'auto',
//           target: widgetContainerRef.current!,

//           createOrder: async () => {
//             const response = await fetch('/api/payments/create-embedded-order', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({
//                 amount: Math.round(total * 100), // minor units (pence)
//                 currency: 'GBP',
//                 description: reportItem.label,
//                 reportId: fromReportId ?? undefined,
//                 projectId: draftId,
//               }),
//             })
//             const data = await response.json()
//             if (!data.success) throw new Error(data.message || data.error || 'Order creation failed')
//             return { publicId: data.data.publicId }
//           },

//           onSuccess: () => {
//             finalizePurchase()
//           },

//           onError: ({ error: checkoutError }) => {
//             setWidgetError(checkoutError.message)
//             setIsPaying(false)
//           },

//           onCancel: () => {
//             setIsPaying(false)
//           },
//         })
//         destroyWidget = destroy
//       } catch (err: any) {
//         if (!cancelled) setWidgetError(err.message || 'Could not load the payment widget.')
//       }
//     }

//     init()
//     return () => {
//       cancelled = true
//       destroyWidget?.()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [project, total])

//   if (project === undefined) {
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
//   }

//   if (!project || !project.address || !project.constraints) {
//     if (typeof window !== 'undefined') router.replace(`/dashboard/new/${draftId}/address`)
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
//   }

//   function toggleAddOn(id: string) {
//     setAddOnIds(prev => {
//       const next = new Set(prev)
//       if (next.has(id)) next.delete(id)
//       else next.add(id)
//       return next
//     })
//   }

//   const cardValid = card.number.trim().length >= 12 && card.expiry.trim().length >= 4 && card.cvc.trim().length >= 3

//   async function handleMockPay() {
//     if (!cardValid) {
//       show('Enter a card number, expiry and CVC to continue.', 'error')
//       return
//     }
//     setIsPaying(true)
//     // Mock processing latency — same shape a real payment confirmation call would have.
//     await new Promise(resolve => window.setTimeout(resolve, 1200))
//     finalizePurchase()
//   }

//   return (
//     <div className="max-w-[560px] mx-auto">
//       <button
//         onClick={() => router.push(`/dashboard/new/${draftId}/snapshot`)}
//         className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
//       >
//         ← Back to snapshot
//       </button>

//       <h1 className="font-display text-[26px] text-[#E8F0FF] mb-6">Review your order</h1>

//       <div className="rounded-[14px] border border-white/[0.08] bg-[#141C30] p-4 mb-6">
//         <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
//           <div>
//             <p className="text-[13.5px] font-semibold text-[#E8F0FF]">{reportItem.label}</p>
//             <p className="text-[12px] text-[#5A6A8A] mt-1">
//               {project.address.line1} · {project.title} · {project.address.council}
//             </p>
//           </div>
//           <p className="text-[15px] font-semibold text-[#E8F0FF] shrink-0">£{reportItem.price}</p>
//         </div>

//         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mt-4 mb-3">
//           Recommended add-ons
//         </p>
//         <div className="space-y-3">
//           {ADD_ONS.map(a => {
//             const added = addOnIds.has(a.id)
//             return (
//               <div key={a.id} className="flex items-center justify-between gap-3">
//                 <div>
//                   <p className="text-[13px] font-medium text-[#E8F0FF]">{a.label}</p>
//                   <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">{a.detail}</p>
//                 </div>
//                 <div className="flex items-center gap-2.5 shrink-0">
//                   <span className="text-[13px] font-semibold text-[#E8F0FF]">£{a.price}</span>
//                   <button
//                     type="button"
//                     onClick={() => toggleAddOn(a.id)}
//                     className={cn(
//                       'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
//                       added
//                         ? 'border-[#135BEC]/40 bg-[rgba(19,91,236,0.1)] text-[#135BEC]'
//                         : 'border-white/[0.14] text-[#A8B8D8] hover:border-white/[0.28] hover:text-[#E8F0FF]'
//                     )}
//                   >
//                     {added ? '✓ Added' : '+ Add'}
//                   </button>
//                 </div>
//               </div>
//             )
//           })}
//         </div>

//         <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08]">
//           <p className="text-[13px] font-semibold text-[#E8F0FF]">Total</p>
//           <p className="font-display text-[20px] text-[#135BEC]">£{total}</p>
//         </div>
//       </div>

//       <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6">
//         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3.5">
//           Payment details
//         </p>

//         {widgetError && (
//           <p className="mb-3 rounded-[10px] border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-300">
//             {widgetError}
//           </p>
//         )}

//         {PAYMENT_METHOD === 'revolut' ? (
//           // Revolut embedded checkout widget mounts here — same integration
//           // as the /payment reference page (@revolut/checkout embeddedCheckout).
//           <div ref={widgetContainerRef} className="min-h-[220px]" />
//         ) : (
//           <div className="space-y-3.5">
//             <Field label="Card number">
//               <input
//                 type="text"
//                 inputMode="numeric"
//                 placeholder="1234 5678 9012 3456"
//                 value={card.number}
//                 onChange={e => setCard(c => ({ ...c, number: e.target.value }))}
//                 className={inputClass}
//               />
//             </Field>
//             <div className="grid grid-cols-2 gap-3">
//               <Field label="Expiry">
//                 <input
//                   type="text"
//                   placeholder="MM / YY"
//                   value={card.expiry}
//                   onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
//                   className={inputClass}
//                 />
//               </Field>
//               <Field label="CVC">
//                 <input
//                   type="text"
//                   inputMode="numeric"
//                   placeholder="123"
//                   value={card.cvc}
//                   onChange={e => setCard(c => ({ ...c, cvc: e.target.value }))}
//                   className={inputClass}
//                 />
//               </Field>
//             </div>
//           </div>
//         )}
//       </div>

//       {PAYMENT_METHOD === 'mock' && (
//         <button
//           type="button"
//           onClick={handleMockPay}
//           disabled={isPaying}
//           className="w-full px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)] disabled:opacity-60 disabled:cursor-not-allowed mb-3"
//         >
//           {isPaying ? 'Processing…' : `🔒 Pay and generate report · £${total}`}
//         </button>
//       )}

//       <p className="text-center text-[12px] text-[#5A6A8A]">
//         Payment taken before report is released
//       </p>
//     </div>
//   )
// }

// const inputClass = cn(
//   'w-full rounded-[10px] px-3.5 py-2.5 text-[13.5px]',
//   'bg-[#141C30] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
//   'border border-white/[0.12] outline-none transition-all',
//   'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]'
// )

// function Field({ label, children }: { label: string; children: React.ReactNode }) {
//   return (
//     <label className="block">
//       <span className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">{label}</span>
//       {children}
//     </label>
//   )
// }



// // // 'use client'

// // // import { useEffect, useMemo, useState } from 'react'
// // // import { useParams, useRouter, useSearchParams } from 'next/navigation'
// // // import { getProject, updateProject, type Project, type PurchaseItem } from '@/lib/projects'
// // // import { getCart, removeFromCart } from '@/lib/cart'
// // // import { markReportUnlocked } from '@/lib/reportStorage'
// // // import { useToast } from '@/components/ui/Toast'
// // // import { cn } from '@/lib/cn'

// // // const DEFAULT_REPORT_ITEM: PurchaseItem = { id: 'report', label: 'Planning eligibility report', price: 49 }

// // // const ADD_ONS: (PurchaseItem & { detail: string })[] = [
// // //   { id: 'consultant-review', label: 'Consultant review of report', price: 99, detail: 'A planning consultant checks your result and flags risks' },
// // //   { id: 'site-plan',         label: 'Site plan & location plan',   price: 35, detail: 'Ordnance Survey-based · Required for most applications' },
// // //   { id: 'floor-plans',       label: 'Existing & proposed floor plans', price: 145, detail: 'CAD drawings by our team · Ready for submission' },
// // // ]

// // // /**
// // //  * /dashboard/new/[draftId]/checkout
// // //  * ────────────────────────────────────
// // //  * Reached either from the snapshot's "Get eligibility report" choice
// // //  * (default £49 item), or from the chat report flow's paywall — where
// // //  * ?fromReport=<id> points at the exact RPT-002/003 tier that was added
// // //  * to cart, so the price/label shown here matches what the person was
// // //  * quoted in chat rather than the flat default. Requires the snapshot's
// // //  * prerequisites (address + constraints) to already be saved — the
// // //  * chat-report claim path fills those in itself before redirecting here.
// // //  */
// // // export default function CheckoutPage() {
// // //   const params = useParams<{ draftId: string }>()
// // //   const searchParams = useSearchParams()
// // //   const router = useRouter()
// // //   const { show } = useToast()
// // //   const draftId = params.draftId
// // //   const fromReportId = searchParams.get('fromReport')

// // //   const [project, setProject] = useState<Project | null | undefined>(undefined)
// // //   const [addOnIds, setAddOnIds] = useState<Set<string>>(new Set())
// // //   const [card, setCard] = useState({ number: '', expiry: '', cvc: '' })
// // //   const [isPaying, setIsPaying] = useState(false)

// // //   useEffect(() => {
// // //     setProject(getProject(draftId))
// // //   }, [draftId])

// // //   const reportItem = useMemo((): PurchaseItem => {
// // //     if (!fromReportId) return DEFAULT_REPORT_ITEM
// // //     const cartItem = getCart().find(i => i.reportId === fromReportId)
// // //     if (!cartItem) return DEFAULT_REPORT_ITEM
// // //     return { id: cartItem.reportId, label: cartItem.label, price: cartItem.priceGBP }
// // //   }, [fromReportId])

// // //   const total = useMemo(() => {
// // //     const addOnTotal = ADD_ONS.filter(a => addOnIds.has(a.id)).reduce((sum, a) => sum + a.price, 0)
// // //     return reportItem.price + addOnTotal
// // //   }, [addOnIds, reportItem])

// // //   if (project === undefined) {
// // //     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
// // //   }

// // //   if (!project || !project.address || !project.constraints) {
// // //     if (typeof window !== 'undefined') router.replace(`/dashboard/new/${draftId}/address`)
// // //     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
// // //   }

// // //   function toggleAddOn(id: string) {
// // //     setAddOnIds(prev => {
// // //       const next = new Set(prev)
// // //       if (next.has(id)) next.delete(id)
// // //       else next.add(id)
// // //       return next
// // //     })
// // //   }

// // //   const cardValid = card.number.trim().length >= 12 && card.expiry.trim().length >= 4 && card.cvc.trim().length >= 3

// // //   async function handlePay() {
// // //     if (!cardValid) {
// // //       show('Enter a card number, expiry and CVC to continue.', 'error')
// // //       return
// // //     }
// // //     setIsPaying(true)
// // //     // Mock processing latency — same shape a real Stripe confirm-payment call would have.
// // //     await new Promise(resolve => window.setTimeout(resolve, 1200))

// // //     const items: PurchaseItem[] = [reportItem, ...ADD_ONS.filter(a => addOnIds.has(a.id))]
// // //     const { persisted } = updateProject(draftId, {
// // //       purchase: { items, total, paidAt: new Date().toISOString() },
// // //     })
// // //     setIsPaying(false)

// // //     if (!persisted) {
// // //       show("Payment succeeded but we couldn't save your report — please try again.", 'error')
// // //       return
// // //     }
// // //     if (fromReportId) {
// // //       removeFromCart(fromReportId)
// // //       markReportUnlocked(fromReportId)
// // //     }
// // //     show('Payment received — generating your report…', 'success')
// // //     router.push(`/dashboard/new/${draftId}/report`)
// // //   }

// // //   return (
// // //     <div className="max-w-[560px] mx-auto">
// // //       <button
// // //         onClick={() => router.push(`/dashboard/new/${draftId}/snapshot`)}
// // //         className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
// // //       >
// // //         ← Back to snapshot
// // //       </button>

// // //       <h1 className="font-display text-[26px] text-[#E8F0FF] mb-6">Review your order</h1>

// // //       <div className="rounded-[14px] border border-white/[0.08] bg-[#141C30] p-4 mb-6">
// // //         <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
// // //           <div>
// // //             <p className="text-[13.5px] font-semibold text-[#E8F0FF]">{reportItem.label}</p>
// // //             <p className="text-[12px] text-[#5A6A8A] mt-1">
// // //               {project.address.line1} · {project.title} · {project.address.council}
// // //             </p>
// // //           </div>
// // //           <p className="text-[15px] font-semibold text-[#E8F0FF] shrink-0">£{reportItem.price}</p>
// // //         </div>

// // //         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mt-4 mb-3">
// // //           Recommended add-ons
// // //         </p>
// // //         <div className="space-y-3">
// // //           {ADD_ONS.map(a => {
// // //             const added = addOnIds.has(a.id)
// // //             return (
// // //               <div key={a.id} className="flex items-center justify-between gap-3">
// // //                 <div>
// // //                   <p className="text-[13px] font-medium text-[#E8F0FF]">{a.label}</p>
// // //                   <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">{a.detail}</p>
// // //                 </div>
// // //                 <div className="flex items-center gap-2.5 shrink-0">
// // //                   <span className="text-[13px] font-semibold text-[#E8F0FF]">£{a.price}</span>
// // //                   <button
// // //                     type="button"
// // //                     onClick={() => toggleAddOn(a.id)}
// // //                     className={cn(
// // //                       'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
// // //                       added
// // //                         ? 'border-[#135BEC]/40 bg-[rgba(19,91,236,0.1)] text-[#135BEC]'
// // //                         : 'border-white/[0.14] text-[#A8B8D8] hover:border-white/[0.28] hover:text-[#E8F0FF]'
// // //                     )}
// // //                   >
// // //                     {added ? '✓ Added' : '+ Add'}
// // //                   </button>
// // //                 </div>
// // //               </div>
// // //             )
// // //           })}
// // //         </div>

// // //         <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08]">
// // //           <p className="text-[13px] font-semibold text-[#E8F0FF]">Total</p>
// // //           <p className="font-display text-[20px] text-[#135BEC]">£{total}</p>
// // //         </div>
// // //       </div>

// // //       <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6">
// // //         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3.5">
// // //           Payment details
// // //         </p>
// // //         <div className="space-y-3.5">
// // //           <Field label="Card number">
// // //             <input
// // //               type="text"
// // //               inputMode="numeric"
// // //               placeholder="1234 5678 9012 3456"
// // //               value={card.number}
// // //               onChange={e => setCard(c => ({ ...c, number: e.target.value }))}
// // //               className={inputClass}
// // //             />
// // //           </Field>
// // //           <div className="grid grid-cols-2 gap-3">
// // //             <Field label="Expiry">
// // //               <input
// // //                 type="text"
// // //                 placeholder="MM / YY"
// // //                 value={card.expiry}
// // //                 onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
// // //                 className={inputClass}
// // //               />
// // //             </Field>
// // //             <Field label="CVC">
// // //               <input
// // //                 type="text"
// // //                 inputMode="numeric"
// // //                 placeholder="123"
// // //                 value={card.cvc}
// // //                 onChange={e => setCard(c => ({ ...c, cvc: e.target.value }))}
// // //                 className={inputClass}
// // //               />
// // //             </Field>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <button
// // //         type="button"
// // //         onClick={handlePay}
// // //         disabled={isPaying}
// // //         className="w-full px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)] disabled:opacity-60 disabled:cursor-not-allowed mb-3"
// // //       >
// // //         {isPaying ? 'Processing…' : `🔒 Pay and generate report · £${total}`}
// // //       </button>
// // //       <p className="text-center text-[12px] text-[#5A6A8A]">
// // //         Payment taken before report is released · Secured by Stripe
// // //       </p>
// // //     </div>
// // //   )
// // // }

// // // const inputClass = cn(
// // //   'w-full rounded-[10px] px-3.5 py-2.5 text-[13.5px]',
// // //   'bg-[#141C30] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
// // //   'border border-white/[0.12] outline-none transition-all',
// // //   'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]'
// // // )

// // // function Field({ label, children }: { label: string; children: React.ReactNode }) {
// // //   return (
// // //     <label className="block">
// // //       <span className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">{label}</span>
// // //       {children}
// // //     </label>
// // //   )
// // // }

// // 'use client'

// // import { useEffect, useMemo, useRef, useState } from 'react'
// // import { useParams, useRouter, useSearchParams } from 'next/navigation'
// // import { getProject, updateProject, type Project, type PurchaseItem } from '@/lib/projects'
// // import { getCart, removeFromCart } from '@/lib/cart'
// // import { markReportUnlocked } from '@/lib/reportStorage'
// // import { useToast } from '@/components/ui/Toast'
// // import { cn } from '@/lib/cn'

// // const DEFAULT_REPORT_ITEM: PurchaseItem = { id: 'report', label: 'Planning eligibility report', price: 49 }

// // const ADD_ONS: (PurchaseItem & { detail: string })[] = [
// //   { id: 'consultant-review', label: 'Consultant review of report', price: 99, detail: 'A planning consultant checks your result and flags risks' },
// //   { id: 'site-plan',         label: 'Site plan & location plan',   price: 35, detail: 'Ordnance Survey-based · Required for most applications' },
// //   { id: 'floor-plans',       label: 'Existing & proposed floor plans', price: 145, detail: 'CAD drawings by our team · Ready for submission' },
// // ]

// // /**
// //  * /dashboard/new/[draftId]/checkout
// //  * ────────────────────────────────────
// //  * Reached either from the snapshot's "Get eligibility report" choice
// //  * (default £49 item), or from the chat report flow's paywall — where
// //  * ?fromReport=<id> points at the exact RPT-002/003 tier that was added
// //  * to cart, so the price/label shown here matches what the person was
// //  * quoted in chat rather than the flat default. Requires the snapshot's
// //  * prerequisites (address + constraints) to already be saved — the
// //  * chat-report claim path fills those in itself before redirecting here.
// //  */
// // export default function CheckoutPage() {
// //   const params = useParams<{ draftId: string }>()
// //   const searchParams = useSearchParams()
// //   const router = useRouter()
// //   const { show } = useToast()
// //   const draftId = params.draftId
// //   const fromReportId = searchParams.get('fromReport')

// //   const [project, setProject] = useState<Project | null | undefined>(undefined)
// //   const [addOnIds, setAddOnIds] = useState<Set<string>>(new Set())
// //   const [isPaying, setIsPaying] = useState(false)
// //   const [widgetError, setWidgetError] = useState('')
// //   const widgetContainerRef = useRef<HTMLDivElement>(null)

// //   useEffect(() => {
// //     setProject(getProject(draftId))
// //   }, [draftId])

// //   const reportItem = useMemo((): PurchaseItem => {
// //     if (!fromReportId) return DEFAULT_REPORT_ITEM
// //     const cartItem = getCart().find(i => i.reportId === fromReportId)
// //     if (!cartItem) return DEFAULT_REPORT_ITEM
// //     return { id: cartItem.reportId, label: cartItem.label, price: cartItem.priceGBP }
// //   }, [fromReportId])

// //   const total = useMemo(() => {
// //     const addOnTotal = ADD_ONS.filter(a => addOnIds.has(a.id)).reduce((sum, a) => sum + a.price, 0)
// //     return reportItem.price + addOnTotal
// //   }, [addOnIds, reportItem])

// //   function finalizePurchase() {
// //     const items: PurchaseItem[] = [reportItem, ...ADD_ONS.filter(a => addOnIds.has(a.id))]
// //     const { persisted } = updateProject(draftId, {
// //       purchase: { items, total, paidAt: new Date().toISOString() },
// //     })
// //     setIsPaying(false)

// //     if (!persisted) {
// //       show("Payment succeeded but we couldn't save your report — please try again.", 'error')
// //       return
// //     }
// //     if (fromReportId) {
// //       removeFromCart(fromReportId)
// //       markReportUnlocked(fromReportId)
// //     }
// //     show('Payment received — generating your report…', 'success')
// //     router.push(`/dashboard/new/${draftId}/report`)
// //   }

// //   // Mounts the Revolut embedded checkout widget once the order total is
// //   // known — same integration as the standalone /payment reference page:
// //   // fetch publicKey/mode from /api/payments/config, then hand the SDK a
// //   // createOrder callback that hits /api/payments/create-embedded-order.
// //   // NOTE: this hook (and every hook in this component) must run on every
// //   // render, so it lives above the early `if (project === undefined) return`
// //   // / `if (!project...) return` checks below — hooks can't come after a
// //   // conditional return, or React throws "Rendered more hooks than during
// //   // the previous render" the moment `project` flips from undefined to set.
// //   useEffect(() => {
// //     if (!project || !widgetContainerRef.current || total <= 0) return
// //     let destroyWidget: (() => void) | undefined
// //     let cancelled = false

// //     async function init() {
// //       try {
// //         const configRes = await fetch('/api/payments/config')
// //         const config = await configRes.json()
// //         if (!config.success) throw new Error(config.message || 'Failed to load payment config')

// //         const { publicKey, mode } = config.data
// //         if (!publicKey) throw new Error('Payments are not configured yet — missing Revolut public key.')

// //         const RevolutCheckout = await import('@revolut/checkout')
// //         if (cancelled) return

// //         const { destroy } = await RevolutCheckout.default.embeddedCheckout({
// //           publicToken: publicKey,
// //           mode: mode === 'prod' ? 'prod' : 'sandbox',
// //           locale: 'auto',
// //           target: widgetContainerRef.current!,

// //           createOrder: async () => {
// //             const response = await fetch('/api/payments/create-embedded-order', {
// //               method: 'POST',
// //               headers: { 'Content-Type': 'application/json' },
// //               body: JSON.stringify({
// //                 amount: Math.round(total * 100), // minor units (pence)
// //                 currency: 'GBP',
// //                 description: reportItem.label,
// //                 reportId: fromReportId ?? undefined,
// //                 projectId: draftId,
// //               }),
// //             })
// //             const data = await response.json()
// //             if (!data.success) throw new Error(data.message || data.error || 'Order creation failed')
// //             return { publicId: data.data.publicId }
// //           },

// //           onSuccess: () => {
// //             finalizePurchase()
// //           },

// //           onError: ({ error: checkoutError }) => {
// //             setWidgetError(checkoutError.message)
// //             setIsPaying(false)
// //           },

// //           onCancel: () => {
// //             setIsPaying(false)
// //           },
// //         })
// //         destroyWidget = destroy
// //       } catch (err: any) {
// //         if (!cancelled) setWidgetError(err.message || 'Could not load the payment widget.')
// //       }
// //     }

// //     init()
// //     return () => {
// //       cancelled = true
// //       destroyWidget?.()
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [project, total])

// //   if (project === undefined) {
// //     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
// //   }

// //   if (!project || !project.address || !project.constraints) {
// //     if (typeof window !== 'undefined') router.replace(`/dashboard/new/${draftId}/address`)
// //     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
// //   }

// //   function toggleAddOn(id: string) {
// //     setAddOnIds(prev => {
// //       const next = new Set(prev)
// //       if (next.has(id)) next.delete(id)
// //       else next.add(id)
// //       return next
// //     })
// //   }

// //   return (
// //     <div className="max-w-[560px] mx-auto">
// //       <button
// //         onClick={() => router.push(`/dashboard/new/${draftId}/snapshot`)}
// //         className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
// //       >
// //         ← Back to snapshot
// //       </button>

// //       <h1 className="font-display text-[26px] text-[#E8F0FF] mb-6">Review your order</h1>

// //       <div className="rounded-[14px] border border-white/[0.08] bg-[#141C30] p-4 mb-6">
// //         <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
// //           <div>
// //             <p className="text-[13.5px] font-semibold text-[#E8F0FF]">{reportItem.label}</p>
// //             <p className="text-[12px] text-[#5A6A8A] mt-1">
// //               {project.address.line1} · {project.title} · {project.address.council}
// //             </p>
// //           </div>
// //           <p className="text-[15px] font-semibold text-[#E8F0FF] shrink-0">£{reportItem.price}</p>
// //         </div>

// //         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mt-4 mb-3">
// //           Recommended add-ons
// //         </p>
// //         <div className="space-y-3">
// //           {ADD_ONS.map(a => {
// //             const added = addOnIds.has(a.id)
// //             return (
// //               <div key={a.id} className="flex items-center justify-between gap-3">
// //                 <div>
// //                   <p className="text-[13px] font-medium text-[#E8F0FF]">{a.label}</p>
// //                   <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">{a.detail}</p>
// //                 </div>
// //                 <div className="flex items-center gap-2.5 shrink-0">
// //                   <span className="text-[13px] font-semibold text-[#E8F0FF]">£{a.price}</span>
// //                   <button
// //                     type="button"
// //                     onClick={() => toggleAddOn(a.id)}
// //                     className={cn(
// //                       'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
// //                       added
// //                         ? 'border-[#135BEC]/40 bg-[rgba(19,91,236,0.1)] text-[#135BEC]'
// //                         : 'border-white/[0.14] text-[#A8B8D8] hover:border-white/[0.28] hover:text-[#E8F0FF]'
// //                     )}
// //                   >
// //                     {added ? '✓ Added' : '+ Add'}
// //                   </button>
// //                 </div>
// //               </div>
// //             )
// //           })}
// //         </div>

// //         <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08]">
// //           <p className="text-[13px] font-semibold text-[#E8F0FF]">Total</p>
// //           <p className="font-display text-[20px] text-[#135BEC]">£{total}</p>
// //         </div>
// //       </div>

// //       <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6">
// //         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3.5">
// //           Payment details
// //         </p>

// //         {widgetError && (
// //           <p className="mb-3 rounded-[10px] border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-300">
// //             {widgetError}
// //           </p>
// //         )}

// //         {/* Revolut embedded checkout widget mounts here — same integration
// //            as the /payment reference page (@revolut/checkout embeddedCheckout). */}
// //         <div ref={widgetContainerRef} className="min-h-[220px]" />
// //       </div>

// //       <p className="text-center text-[12px] text-[#5A6A8A]">
// //         Payment taken before report is released · Secured by Revolut
// //       </p>
// //     </div>
// //   )
// // }

// // 'use client'

// // import { useEffect, useMemo, useState } from 'react'
// // import { useParams, useRouter, useSearchParams } from 'next/navigation'
// // import { getProject, updateProject, type Project, type PurchaseItem } from '@/lib/projects'
// // import { getCart, removeFromCart } from '@/lib/cart'
// // import { markReportUnlocked } from '@/lib/reportStorage'
// // import { useToast } from '@/components/ui/Toast'
// // import { cn } from '@/lib/cn'

// // const DEFAULT_REPORT_ITEM: PurchaseItem = { id: 'report', label: 'Planning eligibility report', price: 49 }

// // const ADD_ONS: (PurchaseItem & { detail: string })[] = [
// //   { id: 'consultant-review', label: 'Consultant review of report', price: 99, detail: 'A planning consultant checks your result and flags risks' },
// //   { id: 'site-plan',         label: 'Site plan & location plan',   price: 35, detail: 'Ordnance Survey-based · Required for most applications' },
// //   { id: 'floor-plans',       label: 'Existing & proposed floor plans', price: 145, detail: 'CAD drawings by our team · Ready for submission' },
// // ]

// // /**
// //  * /dashboard/new/[draftId]/checkout
// //  * ────────────────────────────────────
// //  * Reached either from the snapshot's "Get eligibility report" choice
// //  * (default £49 item), or from the chat report flow's paywall — where
// //  * ?fromReport=<id> points at the exact RPT-002/003 tier that was added
// //  * to cart, so the price/label shown here matches what the person was
// //  * quoted in chat rather than the flat default. Requires the snapshot's
// //  * prerequisites (address + constraints) to already be saved — the
// //  * chat-report claim path fills those in itself before redirecting here.
// //  */
// // export default function CheckoutPage() {
// //   const params = useParams<{ draftId: string }>()
// //   const searchParams = useSearchParams()
// //   const router = useRouter()
// //   const { show } = useToast()
// //   const draftId = params.draftId
// //   const fromReportId = searchParams.get('fromReport')

// //   const [project, setProject] = useState<Project | null | undefined>(undefined)
// //   const [addOnIds, setAddOnIds] = useState<Set<string>>(new Set())
// //   const [card, setCard] = useState({ number: '', expiry: '', cvc: '' })
// //   const [isPaying, setIsPaying] = useState(false)

// //   useEffect(() => {
// //     setProject(getProject(draftId))
// //   }, [draftId])

// //   const reportItem = useMemo((): PurchaseItem => {
// //     if (!fromReportId) return DEFAULT_REPORT_ITEM
// //     const cartItem = getCart().find(i => i.reportId === fromReportId)
// //     if (!cartItem) return DEFAULT_REPORT_ITEM
// //     return { id: cartItem.reportId, label: cartItem.label, price: cartItem.priceGBP }
// //   }, [fromReportId])

// //   const total = useMemo(() => {
// //     const addOnTotal = ADD_ONS.filter(a => addOnIds.has(a.id)).reduce((sum, a) => sum + a.price, 0)
// //     return reportItem.price + addOnTotal
// //   }, [addOnIds, reportItem])

// //   if (project === undefined) {
// //     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
// //   }

// //   if (!project || !project.address || !project.constraints) {
// //     if (typeof window !== 'undefined') router.replace(`/dashboard/new/${draftId}/address`)
// //     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
// //   }

// //   function toggleAddOn(id: string) {
// //     setAddOnIds(prev => {
// //       const next = new Set(prev)
// //       if (next.has(id)) next.delete(id)
// //       else next.add(id)
// //       return next
// //     })
// //   }

// //   const cardValid = card.number.trim().length >= 12 && card.expiry.trim().length >= 4 && card.cvc.trim().length >= 3

// //   async function handlePay() {
// //     if (!cardValid) {
// //       show('Enter a card number, expiry and CVC to continue.', 'error')
// //       return
// //     }
// //     setIsPaying(true)
// //     // Mock processing latency — same shape a real Stripe confirm-payment call would have.
// //     await new Promise(resolve => window.setTimeout(resolve, 1200))

// //     const items: PurchaseItem[] = [reportItem, ...ADD_ONS.filter(a => addOnIds.has(a.id))]
// //     const { persisted } = updateProject(draftId, {
// //       purchase: { items, total, paidAt: new Date().toISOString() },
// //     })
// //     setIsPaying(false)

// //     if (!persisted) {
// //       show("Payment succeeded but we couldn't save your report — please try again.", 'error')
// //       return
// //     }
// //     if (fromReportId) {
// //       removeFromCart(fromReportId)
// //       markReportUnlocked(fromReportId)
// //     }
// //     show('Payment received — generating your report…', 'success')
// //     router.push(`/dashboard/new/${draftId}/report`)
// //   }

// //   return (
// //     <div className="max-w-[560px] mx-auto">
// //       <button
// //         onClick={() => router.push(`/dashboard/new/${draftId}/snapshot`)}
// //         className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
// //       >
// //         ← Back to snapshot
// //       </button>

// //       <h1 className="font-display text-[26px] text-[#E8F0FF] mb-6">Review your order</h1>

// //       <div className="rounded-[14px] border border-white/[0.08] bg-[#141C30] p-4 mb-6">
// //         <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
// //           <div>
// //             <p className="text-[13.5px] font-semibold text-[#E8F0FF]">{reportItem.label}</p>
// //             <p className="text-[12px] text-[#5A6A8A] mt-1">
// //               {project.address.line1} · {project.title} · {project.address.council}
// //             </p>
// //           </div>
// //           <p className="text-[15px] font-semibold text-[#E8F0FF] shrink-0">£{reportItem.price}</p>
// //         </div>

// //         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mt-4 mb-3">
// //           Recommended add-ons
// //         </p>
// //         <div className="space-y-3">
// //           {ADD_ONS.map(a => {
// //             const added = addOnIds.has(a.id)
// //             return (
// //               <div key={a.id} className="flex items-center justify-between gap-3">
// //                 <div>
// //                   <p className="text-[13px] font-medium text-[#E8F0FF]">{a.label}</p>
// //                   <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">{a.detail}</p>
// //                 </div>
// //                 <div className="flex items-center gap-2.5 shrink-0">
// //                   <span className="text-[13px] font-semibold text-[#E8F0FF]">£{a.price}</span>
// //                   <button
// //                     type="button"
// //                     onClick={() => toggleAddOn(a.id)}
// //                     className={cn(
// //                       'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
// //                       added
// //                         ? 'border-[#135BEC]/40 bg-[rgba(19,91,236,0.1)] text-[#135BEC]'
// //                         : 'border-white/[0.14] text-[#A8B8D8] hover:border-white/[0.28] hover:text-[#E8F0FF]'
// //                     )}
// //                   >
// //                     {added ? '✓ Added' : '+ Add'}
// //                   </button>
// //                 </div>
// //               </div>
// //             )
// //           })}
// //         </div>

// //         <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08]">
// //           <p className="text-[13px] font-semibold text-[#E8F0FF]">Total</p>
// //           <p className="font-display text-[20px] text-[#135BEC]">£{total}</p>
// //         </div>
// //       </div>

// //       <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6">
// //         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3.5">
// //           Payment details
// //         </p>
// //         <div className="space-y-3.5">
// //           <Field label="Card number">
// //             <input
// //               type="text"
// //               inputMode="numeric"
// //               placeholder="1234 5678 9012 3456"
// //               value={card.number}
// //               onChange={e => setCard(c => ({ ...c, number: e.target.value }))}
// //               className={inputClass}
// //             />
// //           </Field>
// //           <div className="grid grid-cols-2 gap-3">
// //             <Field label="Expiry">
// //               <input
// //                 type="text"
// //                 placeholder="MM / YY"
// //                 value={card.expiry}
// //                 onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
// //                 className={inputClass}
// //               />
// //             </Field>
// //             <Field label="CVC">
// //               <input
// //                 type="text"
// //                 inputMode="numeric"
// //                 placeholder="123"
// //                 value={card.cvc}
// //                 onChange={e => setCard(c => ({ ...c, cvc: e.target.value }))}
// //                 className={inputClass}
// //               />
// //             </Field>
// //           </div>
// //         </div>
// //       </div>

// //       <button
// //         type="button"
// //         onClick={handlePay}
// //         disabled={isPaying}
// //         className="w-full px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)] disabled:opacity-60 disabled:cursor-not-allowed mb-3"
// //       >
// //         {isPaying ? 'Processing…' : `🔒 Pay and generate report · £${total}`}
// //       </button>
// //       <p className="text-center text-[12px] text-[#5A6A8A]">
// //         Payment taken before report is released · Secured by Stripe
// //       </p>
// //     </div>
// //   )
// // }

// // const inputClass = cn(
// //   'w-full rounded-[10px] px-3.5 py-2.5 text-[13.5px]',
// //   'bg-[#141C30] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
// //   'border border-white/[0.12] outline-none transition-all',
// //   'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]'
// // )

// // function Field({ label, children }: { label: string; children: React.ReactNode }) {
// //   return (
// //     <label className="block">
// //       <span className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">{label}</span>
// //       {children}
// //     </label>
// //   )
// // }

// 'use client'

// import { useEffect, useMemo, useRef, useState } from 'react'
// import { useParams, useRouter, useSearchParams } from 'next/navigation'
// import { getProject, updateProject, type Project, type PurchaseItem } from '@/lib/projects'
// import { getCart, removeFromCart } from '@/lib/cart'
// import { markReportUnlocked } from '@/lib/reportStorage'
// import { useToast } from '@/components/ui/Toast'
// import { cn } from '@/lib/cn'

// const DEFAULT_REPORT_ITEM: PurchaseItem = { id: 'report', label: 'Planning eligibility report', price: 49 }

// const ADD_ONS: (PurchaseItem & { detail: string })[] = [
//   { id: 'consultant-review', label: 'Consultant review of report', price: 99, detail: 'A planning consultant checks your result and flags risks' },
//   { id: 'site-plan',         label: 'Site plan & location plan',   price: 35, detail: 'Ordnance Survey-based · Required for most applications' },
//   { id: 'floor-plans',       label: 'Existing & proposed floor plans', price: 145, detail: 'CAD drawings by our team · Ready for submission' },
// ]

// /**
//  * /dashboard/new/[draftId]/checkout
//  * ────────────────────────────────────
//  * Reached either from the snapshot's "Get eligibility report" choice
//  * (default £49 item), or from the chat report flow's paywall — where
//  * ?fromReport=<id> points at the exact RPT-002/003 tier that was added
//  * to cart, so the price/label shown here matches what the person was
//  * quoted in chat rather than the flat default. Requires the snapshot's
//  * prerequisites (address + constraints) to already be saved — the
//  * chat-report claim path fills those in itself before redirecting here.
//  */
// export default function CheckoutPage() {
//   const params = useParams<{ draftId: string }>()
//   const searchParams = useSearchParams()
//   const router = useRouter()
//   const { show } = useToast()
//   const draftId = params.draftId
//   const fromReportId = searchParams.get('fromReport')

//   const [project, setProject] = useState<Project | null | undefined>(undefined)
//   const [addOnIds, setAddOnIds] = useState<Set<string>>(new Set())
//   const [isPaying, setIsPaying] = useState(false)
//   const [widgetError, setWidgetError] = useState('')
//   const widgetContainerRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     setProject(getProject(draftId))
//   }, [draftId])

//   const reportItem = useMemo((): PurchaseItem => {
//     if (!fromReportId) return DEFAULT_REPORT_ITEM
//     const cartItem = getCart().find(i => i.reportId === fromReportId)
//     if (!cartItem) return DEFAULT_REPORT_ITEM
//     return { id: cartItem.reportId, label: cartItem.label, price: cartItem.priceGBP }
//   }, [fromReportId])

//   const total = useMemo(() => {
//     const addOnTotal = ADD_ONS.filter(a => addOnIds.has(a.id)).reduce((sum, a) => sum + a.price, 0)
//     return reportItem.price + addOnTotal
//   }, [addOnIds, reportItem])

//   function finalizePurchase() {
//     const items: PurchaseItem[] = [reportItem, ...ADD_ONS.filter(a => addOnIds.has(a.id))]
//     const { persisted } = updateProject(draftId, {
//       purchase: { items, total, paidAt: new Date().toISOString() },
//     })
//     setIsPaying(false)

//     if (!persisted) {
//       show("Payment succeeded but we couldn't save your report — please try again.", 'error')
//       return
//     }
//     if (fromReportId) {
//       removeFromCart(fromReportId)
//       markReportUnlocked(fromReportId)
//     }
//     show('Payment received — generating your report…', 'success')
//     router.push(`/dashboard/new/${draftId}/report`)
//   }

//   // Mounts the Revolut embedded checkout widget once the order total is
//   // known — same integration as the standalone /payment reference page:
//   // fetch publicKey/mode from /api/payments/config, then hand the SDK a
//   // createOrder callback that hits /api/payments/create-embedded-order.
//   // NOTE: this hook (and every hook in this component) must run on every
//   // render, so it lives above the early `if (project === undefined) return`
//   // / `if (!project...) return` checks below — hooks can't come after a
//   // conditional return, or React throws "Rendered more hooks than during
//   // the previous render" the moment `project` flips from undefined to set.
//   useEffect(() => {
//     if (!project || !widgetContainerRef.current || total <= 0) return
//     let destroyWidget: (() => void) | undefined
//     let cancelled = false

//     async function init() {
//       try {
//         const configRes = await fetch('/api/payments/config')
//         const config = await configRes.json()
//         if (!config.success) throw new Error(config.message || 'Failed to load payment config')

//         const { publicKey, mode } = config.data
//         if (!publicKey) throw new Error('Payments are not configured yet — missing Revolut public key.')

//         const RevolutCheckout = await import('@revolut/checkout')
//         if (cancelled) return

//         const { destroy } = await RevolutCheckout.default.embeddedCheckout({
//           publicToken: publicKey,
//           mode: mode === 'prod' ? 'prod' : 'sandbox',
//           locale: 'auto',
//           target: widgetContainerRef.current!,

//           createOrder: async () => {
//             const response = await fetch('/api/payments/create-embedded-order', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({
//                 amount: Math.round(total * 100), // minor units (pence)
//                 currency: 'GBP',
//                 description: reportItem.label,
//                 reportId: fromReportId ?? undefined,
//                 projectId: draftId,
//               }),
//             })
//             const data = await response.json()
//             if (!data.success) throw new Error(data.message || data.error || 'Order creation failed')
//             return { publicId: data.data.publicId }
//           },

//           onSuccess: () => {
//             finalizePurchase()
//           },

//           onError: ({ error: checkoutError }) => {
//             setWidgetError(checkoutError.message)
//             setIsPaying(false)
//           },

//           onCancel: () => {
//             setIsPaying(false)
//           },
//         })
//         destroyWidget = destroy
//       } catch (err: any) {
//         if (!cancelled) setWidgetError(err.message || 'Could not load the payment widget.')
//       }
//     }

//     init()
//     return () => {
//       cancelled = true
//       destroyWidget?.()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [project, total])

//   if (project === undefined) {
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
//   }

//   if (!project || !project.address || !project.constraints) {
//     if (typeof window !== 'undefined') router.replace(`/dashboard/new/${draftId}/address`)
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
//   }

//   function toggleAddOn(id: string) {
//     setAddOnIds(prev => {
//       const next = new Set(prev)
//       if (next.has(id)) next.delete(id)
//       else next.add(id)
//       return next
//     })
//   }

//   return (
//     <div className="max-w-[560px] mx-auto">
//       <button
//         onClick={() => router.push(`/dashboard/new/${draftId}/snapshot`)}
//         className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
//       >
//         ← Back to snapshot
//       </button>

//       <h1 className="font-display text-[26px] text-[#E8F0FF] mb-6">Review your order</h1>

//       <div className="rounded-[14px] border border-white/[0.08] bg-[#141C30] p-4 mb-6">
//         <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
//           <div>
//             <p className="text-[13.5px] font-semibold text-[#E8F0FF]">{reportItem.label}</p>
//             <p className="text-[12px] text-[#5A6A8A] mt-1">
//               {project.address.line1} · {project.title} · {project.address.council}
//             </p>
//           </div>
//           <p className="text-[15px] font-semibold text-[#E8F0FF] shrink-0">£{reportItem.price}</p>
//         </div>

//         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mt-4 mb-3">
//           Recommended add-ons
//         </p>
//         <div className="space-y-3">
//           {ADD_ONS.map(a => {
//             const added = addOnIds.has(a.id)
//             return (
//               <div key={a.id} className="flex items-center justify-between gap-3">
//                 <div>
//                   <p className="text-[13px] font-medium text-[#E8F0FF]">{a.label}</p>
//                   <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">{a.detail}</p>
//                 </div>
//                 <div className="flex items-center gap-2.5 shrink-0">
//                   <span className="text-[13px] font-semibold text-[#E8F0FF]">£{a.price}</span>
//                   <button
//                     type="button"
//                     onClick={() => toggleAddOn(a.id)}
//                     className={cn(
//                       'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
//                       added
//                         ? 'border-[#135BEC]/40 bg-[rgba(19,91,236,0.1)] text-[#135BEC]'
//                         : 'border-white/[0.14] text-[#A8B8D8] hover:border-white/[0.28] hover:text-[#E8F0FF]'
//                     )}
//                   >
//                     {added ? '✓ Added' : '+ Add'}
//                   </button>
//                 </div>
//               </div>
//             )
//           })}
//         </div>

//         <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08]">
//           <p className="text-[13px] font-semibold text-[#E8F0FF]">Total</p>
//           <p className="font-display text-[20px] text-[#135BEC]">£{total}</p>
//         </div>
//       </div>

//       <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6">
//         <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3.5">
//           Payment details
//         </p>

//         {widgetError && (
//           <p className="mb-3 rounded-[10px] border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-300">
//             {widgetError}
//           </p>
//         )}

//         {/* Revolut embedded checkout widget mounts here — same integration
//            as the /payment reference page (@revolut/checkout embeddedCheckout). */}
//         <div ref={widgetContainerRef} className="min-h-[220px]" />
//       </div>

//       <p className="text-center text-[12px] text-[#5A6A8A]">
//         Payment taken before report is released · Secured by Revolut
//       </p>
//     </div>
//   )
// }

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { getProject, updateProject, type Project, type PurchaseItem } from '@/lib/projects'
import { getCart, removeFromCart } from '@/lib/cart'
import { markReportUnlocked } from '@/lib/reportStorage'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'

const DEFAULT_REPORT_ITEM: PurchaseItem = { id: 'report', label: 'Planning eligibility report', price: 49 }

const ADD_ONS: (PurchaseItem & { detail: string })[] = [
  { id: 'consultant-review', label: 'Consultant review of report', price: 99, detail: 'A planning consultant checks your result and flags risks' },
  { id: 'site-plan',         label: 'Site plan & location plan',   price: 35, detail: 'Ordnance Survey-based · Required for most applications' },
  { id: 'floor-plans',       label: 'Existing & proposed floor plans', price: 145, detail: 'CAD drawings by our team · Ready for submission' },
]

/**
 * Payment method for this page. 'mock' simulates a successful card
 * charge client-side with no external calls — switch to 'revolut' to
 * use the live @revolut/checkout embedded widget again once the
 * integration issue with /api/payments/config /
 * /api/payments/create-embedded-order is sorted out. Nothing else in
 * this file needs to change either way.
 */
const PAYMENT_METHOD: 'mock' | 'revolut' = 'mock'

/**
 * /dashboard/new/[draftId]/checkout
 * ────────────────────────────────────
 * Reached either from the snapshot's "Get eligibility report" choice
 * (default £49 item), or from the chat report flow's paywall — where
 * ?fromReport=<id> points at the exact RPT-002/003 tier that was added
 * to cart, so the price/label shown here matches what the person was
 * quoted in chat rather than the flat default. Requires the snapshot's
 * prerequisites (address + constraints) to already be saved — the
 * chat-report claim path fills those in itself before redirecting here.
 */
export default function CheckoutPage() {
  const params = useParams<{ draftId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { show } = useToast()
  const draftId = params.draftId
  const fromReportId = searchParams.get('fromReport')

  const [project, setProject] = useState<Project | null | undefined>(undefined)
  const [addOnIds, setAddOnIds] = useState<Set<string>>(new Set())
  const [isPaying, setIsPaying] = useState(false)
  const [widgetError, setWidgetError] = useState('')
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' })
  const widgetContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setProject(getProject(draftId))
  }, [draftId])

  const reportItem = useMemo((): PurchaseItem => {
    if (!fromReportId) return DEFAULT_REPORT_ITEM
    const cartItem = getCart().find(i => i.reportId === fromReportId)
    if (!cartItem) return DEFAULT_REPORT_ITEM
    return { id: cartItem.reportId, label: cartItem.label, price: cartItem.priceGBP }
  }, [fromReportId])

  const total = useMemo(() => {
    const addOnTotal = ADD_ONS.filter(a => addOnIds.has(a.id)).reduce((sum, a) => sum + a.price, 0)
    return reportItem.price + addOnTotal
  }, [addOnIds, reportItem])

  function finalizePurchase() {
    const items: PurchaseItem[] = [reportItem, ...ADD_ONS.filter(a => addOnIds.has(a.id))]
    const { persisted } = updateProject(draftId, {
      purchase: { items, total, paidAt: new Date().toISOString() },
    })
    setIsPaying(false)

    if (!persisted) {
      show("Payment succeeded but we couldn't save your report — please try again.", 'error')
      return
    }
    if (fromReportId) {
      removeFromCart(fromReportId)
      markReportUnlocked(fromReportId)
      show('Payment received — unlocking your report…', 'success')
      router.push(`/dashboard/reports/${fromReportId}`)
      return
    }
    show('Payment received — generating your report…', 'success')
    router.push(`/dashboard/new/${draftId}/report`)
  }

  // Mounts the Revolut embedded checkout widget once the order total is
  // known — same integration as the standalone /payment reference page:
  // fetch publicKey/mode from /api/payments/config, then hand the SDK a
  // createOrder callback that hits /api/payments/create-embedded-order.
  // Only runs when PAYMENT_METHOD === 'revolut'.
  // NOTE: this hook (and every hook in this component) must run on every
  // render, so it lives above the early `if (project === undefined) return`
  // / `if (!project...) return` checks below — hooks can't come after a
  // conditional return, or React throws "Rendered more hooks than during
  // the previous render" the moment `project` flips from undefined to set.
  useEffect(() => {
    if (PAYMENT_METHOD !== 'revolut') return
    if (!project || !widgetContainerRef.current || total <= 0) return
    let destroyWidget: (() => void) | undefined
    let cancelled = false

    async function init() {
      try {
        const configRes = await fetch('/api/payments/config')
        const config = await configRes.json()
        if (!config.success) throw new Error(config.message || 'Failed to load payment config')

        const { publicKey, mode } = config.data
        if (!publicKey) throw new Error('Payments are not configured yet — missing Revolut public key.')

        const RevolutCheckout = await import('@revolut/checkout')
        if (cancelled) return

        const { destroy } = await RevolutCheckout.default.embeddedCheckout({
          publicToken: publicKey,
          mode: mode === 'prod' ? 'prod' : 'sandbox',
          locale: 'auto',
          target: widgetContainerRef.current!,

          createOrder: async () => {
            const response = await fetch('/api/payments/create-embedded-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: Math.round(total * 100), // minor units (pence)
                currency: 'GBP',
                description: reportItem.label,
                reportId: fromReportId ?? undefined,
                projectId: draftId,
              }),
            })
            const data = await response.json()
            if (!data.success) throw new Error(data.message || data.error || 'Order creation failed')
            return { publicId: data.data.publicId }
          },

          onSuccess: () => {
            finalizePurchase()
          },

          onError: ({ error: checkoutError }) => {
            setWidgetError(checkoutError.message)
            setIsPaying(false)
          },

          onCancel: () => {
            setIsPaying(false)
          },
        })
        destroyWidget = destroy
      } catch (err: any) {
        if (!cancelled) setWidgetError(err.message || 'Could not load the payment widget.')
      }
    }

    init()
    return () => {
      cancelled = true
      destroyWidget?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, total])

  if (project === undefined) {
    return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
  }

  if (!project || !project.address || !project.constraints) {
    if (typeof window !== 'undefined') router.replace(`/dashboard/new/${draftId}/address`)
    return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
  }

  function toggleAddOn(id: string) {
    setAddOnIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const cardValid = card.number.trim().length >= 12 && card.expiry.trim().length >= 4 && card.cvc.trim().length >= 3

  async function handleMockPay() {
    if (!cardValid) {
      show('Enter a card number, expiry and CVC to continue.', 'error')
      return
    }
    setIsPaying(true)
    // Mock processing latency — same shape a real payment confirmation call would have.
    await new Promise(resolve => window.setTimeout(resolve, 1200))
    finalizePurchase()
  }

  return (
    <div className="max-w-[560px] mx-auto">
      <button
        onClick={() => router.push(`/dashboard/new/${draftId}/snapshot`)}
        className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
      >
        ← Back to snapshot
      </button>

      <h1 className="font-display text-[26px] text-[#E8F0FF] mb-6">Review your order</h1>

      <div className="rounded-[14px] border border-white/[0.08] bg-[#141C30] p-4 mb-6">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <p className="text-[13.5px] font-semibold text-[#E8F0FF]">{reportItem.label}</p>
            <p className="text-[12px] text-[#5A6A8A] mt-1">
              {project.address.line1} · {project.title} · {project.address.council}
            </p>
          </div>
          <p className="text-[15px] font-semibold text-[#E8F0FF] shrink-0">£{reportItem.price}</p>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mt-4 mb-3">
          Recommended add-ons
        </p>
        <div className="space-y-3">
          {ADD_ONS.map(a => {
            const added = addOnIds.has(a.id)
            return (
              <div key={a.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-medium text-[#E8F0FF]">{a.label}</p>
                  <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">{a.detail}</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[13px] font-semibold text-[#E8F0FF]">£{a.price}</span>
                  <button
                    type="button"
                    onClick={() => toggleAddOn(a.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
                      added
                        ? 'border-[#135BEC]/40 bg-[rgba(19,91,236,0.1)] text-[#135BEC]'
                        : 'border-white/[0.14] text-[#A8B8D8] hover:border-white/[0.28] hover:text-[#E8F0FF]'
                    )}
                  >
                    {added ? '✓ Added' : '+ Add'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08]">
          <p className="text-[13px] font-semibold text-[#E8F0FF]">Total</p>
          <p className="font-display text-[20px] text-[#135BEC]">£{total}</p>
        </div>
      </div>

      <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3.5">
          Payment details
        </p>

        {widgetError && (
          <p className="mb-3 rounded-[10px] border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-300">
            {widgetError}
          </p>
        )}

        {PAYMENT_METHOD === 'revolut' ? (
          // Revolut embedded checkout widget mounts here — same integration
          // as the /payment reference page (@revolut/checkout embeddedCheckout).
          <div ref={widgetContainerRef} className="min-h-[220px]" />
        ) : (
          <div className="space-y-3.5">
            <Field label="Card number">
              <input
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                value={card.number}
                onChange={e => setCard(c => ({ ...c, number: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Expiry">
                <input
                  type="text"
                  placeholder="MM / YY"
                  value={card.expiry}
                  onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
                  className={inputClass}
                />
              </Field>
              <Field label="CVC">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="123"
                  value={card.cvc}
                  onChange={e => setCard(c => ({ ...c, cvc: e.target.value }))}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        )}
      </div>

      {PAYMENT_METHOD === 'mock' && (
        <button
          type="button"
          onClick={handleMockPay}
          disabled={isPaying}
          className="w-full px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)] disabled:opacity-60 disabled:cursor-not-allowed mb-3"
        >
          {isPaying ? 'Processing…' : `🔒 Pay and generate report · £${total}`}
        </button>
      )}

      <p className="text-center text-[12px] text-[#5A6A8A]">
        Payment taken before report is released
      </p>
    </div>
  )
}

const inputClass = cn(
  'w-full rounded-[10px] px-3.5 py-2.5 text-[13.5px]',
  'bg-[#141C30] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
  'border border-white/[0.12] outline-none transition-all',
  'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]'
)

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">{label}</span>
      {children}
    </label>
  )
}