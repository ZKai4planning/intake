// 'use client'

// import { useEffect, useState } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { getProject, updateProject, type Project } from '@/lib/projects'
// import { lookupAddresses, checkConstraints, councilFor, type AddressOption, type ConstraintResult } from '@/lib/constraints'
// import { useToast } from '@/components/ui/Toast'
// import { cn } from '@/lib/cn'

// /**
//  * /dashboard/new/[draftId]/address
//  * ──────────────────────────────────
//  * Step 3 of the application flow, right after the intake form is
//  * submitted: capture the property address, then auto-run the (mock)
//  * planning constraint check before handing off to the free snapshot.
//  *
//  * Revisit-safe: if this project already has an address + constraints
//  * saved (e.g. the person came back), the page opens with that already
//  * filled in instead of forcing them through the lookup again.
//  */
// export default function AddressCheckPage() {
//   const params = useParams<{ draftId: string }>()
//   const router = useRouter()
//   const { show } = useToast()
//   const draftId = params.draftId

//   const [project, setProject] = useState<Project | null | undefined>(undefined) // undefined = loading
//   const [postcode, setPostcode] = useState('')
//   const [options, setOptions] = useState<AddressOption[] | null>(null)
//   const [selected, setSelected] = useState<AddressOption | null>(null)
//   const [checking, setChecking] = useState(false)
//   const [constraints, setConstraints] = useState<ConstraintResult[] | null>(null)
//   const [isSaving, setIsSaving] = useState(false)

//   useEffect(() => {
//     const existing = getProject(draftId)
//     setProject(existing)
//     if (existing?.address) {
//       setPostcode(existing.address.postcode)
//       setOptions([{ id: 'existing', line1: existing.address.line1, city: existing.address.city, postcode: existing.address.postcode }])
//       setSelected({ id: 'existing', line1: existing.address.line1, city: existing.address.city, postcode: existing.address.postcode })
//     }
//     if (existing?.constraints) setConstraints(existing.constraints)
//   }, [draftId])

//   if (project === undefined) {
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
//   }

//   if (!project) {
//     if (typeof window !== 'undefined') router.replace('/dashboard/new/intent')
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
//   }

//   function handleFindAddress() {
//     if (!postcode.trim()) return
//     setOptions(lookupAddresses(postcode))
//     setSelected(null)
//     setConstraints(null)
//   }

//   function handleSelectAddress(option: AddressOption) {
//     setSelected(option)
//     setConstraints(null)
//     setChecking(true)
//     // Simulated latency for the (mock) constraint check — same shape as
//     // a real call to planning.data.gov.uk / Environment Agency would have.
//     window.setTimeout(() => {
//       setConstraints(checkConstraints(option.postcode))
//       setChecking(false)
//     }, 1500)
//   }

//   async function handleGenerateSnapshot() {
//     if (!selected || !constraints) return
//     setIsSaving(true)
//     const { persisted } = updateProject(draftId, {
//       address: {
//         postcode: selected.postcode,
//         line1:    selected.line1,
//         city:     selected.city,
//         council:  councilFor(selected.postcode),
//       },
//       constraints,
//     })
//     setIsSaving(false)
//     if (!persisted) {
//       show("Couldn't save your address — check your connection and try again.", 'error')
//       return
//     }
//     router.push(`/dashboard/new/${draftId}/snapshot`)
//   }

//   return (
//     <div className="max-w-[560px] mx-auto">
//       <button
//         onClick={() => router.push(`/dashboard/new/${draftId}`)}
//         className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
//       >
//         ← Back
//       </button>

//       <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#5A6A8A] mb-2">
//         Step 3 of 4 · Location &amp; address
//       </p>
//       <h1 className="font-display text-[26px] text-[#E8F0FF] mb-2">Where is the property?</h1>
//       <p className="text-[13.5px] text-[#A8B8D8] leading-relaxed mb-6">
//         Your postcode lets us automatically check planning constraints — conservation areas,
//         listed buildings, Article&nbsp;4 directions, flood zones, and more.
//       </p>

//       <div className="space-y-2.5 mb-4">
//         <label className="text-[13.5px] font-semibold text-[#E8F0FF]">Property postcode</label>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={postcode}
//             onChange={e => setPostcode(e.target.value)}
//             placeholder="e.g. SW1A 1AA"
//             className={cn(
//               'flex-1 rounded-[10px] px-3.5 py-2.5 text-[13.5px]',
//               'bg-[#141C30] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
//               'border border-white/[0.12] outline-none transition-all',
//               'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]'
//             )}
//           />
//           <button
//             type="button"
//             onClick={handleFindAddress}
//             disabled={!postcode.trim()}
//             className="px-4 py-2.5 rounded-[10px] text-[13.5px] font-semibold text-[#A8B8D8] border border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
//           >
//             🔍 Find address
//           </button>
//         </div>
//       </div>

//       {options && (
//         <div className="space-y-2.5 mb-6">
//           <label className="text-[13.5px] font-semibold text-[#E8F0FF]">Select your address</label>
//           <div className="space-y-2">
//             {options.map(opt => (
//               <button
//                 key={opt.id}
//                 type="button"
//                 onClick={() => handleSelectAddress(opt)}
//                 className={cn(
//                   'w-full text-left px-3.5 py-3 rounded-[10px] border text-[13.5px] transition-colors',
//                   selected?.id === opt.id
//                     ? 'border-[#135BEC] bg-[rgba(19,91,236,0.07)] text-[#E8F0FF]'
//                     : 'border-white/[0.12] bg-[#141C30] text-[#A8B8D8] hover:border-white/[0.24] hover:text-[#E8F0FF]'
//                 )}
//               >
//                 {opt.line1}, {opt.city}, {opt.postcode}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {selected && (
//         <div className="rounded-[14px] border border-[#135BEC]/60 bg-[rgba(19,91,236,0.05)] p-4 mb-4">
//           <div className="flex items-center gap-3 mb-3">
//             <span className="text-xl" aria-hidden="true">📍</span>
//             <div>
//               <p className="text-[13.5px] font-semibold text-[#E8F0FF]">
//                 {selected.line1}, {selected.city}, {selected.postcode}
//               </p>
//               <p className="text-[12px] text-[#5A6A8A] mt-0.5">{councilFor(selected.postcode)}</p>
//             </div>
//           </div>
//           <div className="flex flex-wrap gap-1.5">
//             <Chip label="✓ UPRN captured" tone="clear" />
//             <Chip label="✓ Coordinates stored" tone="clear" />
//             <Chip label="✓ Council identified" tone="clear" />
//           </div>
//         </div>
//       )}

//       {selected && (
//         <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6">
//           <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3">
//             Planning constraint check — running automatically
//           </p>

//           {checking && (
//             <p className="text-[13px] text-[#5A6A8A] py-2 inline-flex items-center gap-2">
//               <Spinner /> Checking planning.data.gov.uk &amp; Environment Agency…
//             </p>
//           )}

//           {!checking && constraints && (
//             <>
//               <div className="flex flex-wrap gap-1.5 mb-3">
//                 {constraints.map(c => (
//                   <Chip key={c.label} label={`${c.status === 'warning' ? '⚠' : '✓'} ${c.label}`} tone={c.status} />
//                 ))}
//               </div>

//               {constraints.some(c => c.status === 'warning') && (
//                 <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F59E0B]/30 bg-[rgba(245,158,11,0.08)] p-3 mb-4">
//                   <span className="text-[#F59E0B] shrink-0" aria-hidden="true">⚠</span>
//                   <p className="text-[12.5px] text-[#A8B8D8] leading-relaxed">
//                     A constraint that may restrict some works was detected. We&rsquo;ll factor this into your snapshot now.
//                   </p>
//                 </div>
//               )}

//               <button
//                 type="button"
//                 onClick={handleGenerateSnapshot}
//                 disabled={isSaving}
//                 className="w-full px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
//               >
//                 {isSaving ? 'Saving…' : 'Generate my free snapshot →'}
//               </button>
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// function Chip({ label, tone }: { label: string; tone: 'warning' | 'clear' }) {
//   return (
//     <span
//       className={cn(
//         'inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-medium border',
//         tone === 'warning'
//           ? 'bg-[rgba(245,158,11,0.1)] border-[#F59E0B]/30 text-[#FCD34D]'
//           : 'bg-[rgba(19,91,236,0.08)] border-[#135BEC]/30 text-[#135BEC]'
//       )}
//     >
//       {label}
//     </span>
//   )
// }

// function Spinner() {
//   return (
//     <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
//       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
//     </svg>
//   )
// }


'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProject, updateProject, type Project } from '@/lib/projects'
import { lookupAddresses, type AddressOption, type ConstraintResult } from '@/lib/constraints'
import { resolveAddressData } from '@/lib/liveAddressLookup'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'

/**
 * /dashboard/new/[draftId]/address
 * ──────────────────────────────────
 * Step 3 of the application flow, right after the intake form is
 * submitted: capture the property address, then auto-run the planning
 * constraint check (live postcodes.io + planning.data.gov.uk lookup,
 * see lib/liveAddressLookup.ts — falls back to a general estimate only
 * if that live lookup fails) before handing off to the free snapshot.
 *
 * Revisit-safe: if this project already has an address + constraints
 * saved (e.g. the person came back), the page opens with that already
 * filled in instead of forcing them through the lookup again.
 */
export default function AddressCheckPage() {
  const params = useParams<{ draftId: string }>()
  const router = useRouter()
  const { show } = useToast()
  const draftId = params.draftId

  const [project, setProject] = useState<Project | null | undefined>(undefined) // undefined = loading
  const [postcode, setPostcode] = useState('')
  const [options, setOptions] = useState<AddressOption[] | null>(null)
  const [selected, setSelected] = useState<AddressOption | null>(null)
  const [checking, setChecking] = useState(false)
  const [constraints, setConstraints] = useState<ConstraintResult[] | null>(null)
  const [council, setCouncil] = useState<string | null>(null)
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | undefined>(undefined)
  const [dataSource, setDataSource] = useState<'live' | 'estimate' | null>(null)
  const [dataNote, setDataNote] = useState<string | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const existing = getProject(draftId)
    setProject(existing)
    if (existing?.address) {
      setPostcode(existing.address.postcode)
      setOptions([{ id: 'existing', line1: existing.address.line1, city: existing.address.city, postcode: existing.address.postcode }])
      setSelected({ id: 'existing', line1: existing.address.line1, city: existing.address.city, postcode: existing.address.postcode })
      setCouncil(existing.address.council)
      if (typeof existing.address.latitude === 'number' && typeof existing.address.longitude === 'number') {
        setCoordinates({ latitude: existing.address.latitude, longitude: existing.address.longitude })
      }
      setDataSource(existing.address.dataSource ?? null)
      setDataNote(existing.address.dataNote)
    }
    if (existing?.constraints) setConstraints(existing.constraints)
  }, [draftId])

  if (project === undefined) {
    return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
  }

  if (!project) {
    if (typeof window !== 'undefined') router.replace('/dashboard/new/intent')
    return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
  }

  function handleFindAddress() {
    if (!postcode.trim()) return
    setOptions(lookupAddresses(postcode))
    setSelected(null)
    setConstraints(null)
  }

  async function handleSelectAddress(option: AddressOption) {
    setSelected(option)
    setConstraints(null)
    setCouncil(null)
    setCoordinates(undefined)
    setDataSource(null)
    setDataNote(undefined)
    setChecking(true)
    const resolved = await resolveAddressData(option.postcode)
    setConstraints(resolved.constraints)
    setCouncil(resolved.council)
    setCoordinates(resolved.coordinates)
    setDataSource(resolved.dataSource)
    setDataNote(resolved.dataNote)
    setChecking(false)
  }

  async function handleGenerateSnapshot() {
    if (!selected || !constraints || !council) return
    setIsSaving(true)
    const { persisted } = updateProject(draftId, {
      address: {
        postcode: selected.postcode,
        line1:    selected.line1,
        city:     selected.city,
        council,
        latitude:  coordinates?.latitude,
        longitude: coordinates?.longitude,
        dataSource: dataSource ?? undefined,
        dataNote,
      },
      constraints,
    })
    setIsSaving(false)
    if (!persisted) {
      show("Couldn't save your address — check your connection and try again.", 'error')
      return
    }
    router.push(`/dashboard/new/${draftId}/snapshot`)
  }

  return (
    <div className="max-w-[560px] mx-auto">
      <button
        onClick={() => router.push(`/dashboard/new/${draftId}`)}
        className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
      >
        ← Back
      </button>

      <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#5A6A8A] mb-2">
        Step 3 of 4 · Location &amp; address
      </p>
      <h1 className="font-display text-[26px] text-[#E8F0FF] mb-2">Where is the property?</h1>
      <p className="text-[13.5px] text-[#A8B8D8] leading-relaxed mb-6">
        Your postcode lets us automatically check planning constraints — conservation areas,
        listed buildings, Article&nbsp;4 directions, flood zones, and more.
      </p>

      <div className="space-y-2.5 mb-4">
        <label className="text-[13.5px] font-semibold text-[#E8F0FF]">Property postcode</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={postcode}
            onChange={e => setPostcode(e.target.value)}
            placeholder="e.g. SW1A 1AA"
            className={cn(
              'flex-1 rounded-[10px] px-3.5 py-2.5 text-[13.5px]',
              'bg-[#141C30] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
              'border border-white/[0.12] outline-none transition-all',
              'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]'
            )}
          />
          <button
            type="button"
            onClick={handleFindAddress}
            disabled={!postcode.trim()}
            className="px-4 py-2.5 rounded-[10px] text-[13.5px] font-semibold text-[#A8B8D8] border border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            🔍 Find address
          </button>
        </div>
      </div>

      {options && (
        <div className="space-y-2.5 mb-6">
          <label className="text-[13.5px] font-semibold text-[#E8F0FF]">Select your address</label>
          <div className="space-y-2">
            {options.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectAddress(opt)}
                className={cn(
                  'w-full text-left px-3.5 py-3 rounded-[10px] border text-[13.5px] transition-colors',
                  selected?.id === opt.id
                    ? 'border-[#135BEC] bg-[rgba(19,91,236,0.07)] text-[#E8F0FF]'
                    : 'border-white/[0.12] bg-[#141C30] text-[#A8B8D8] hover:border-white/[0.24] hover:text-[#E8F0FF]'
                )}
              >
                {opt.line1}, {opt.city}, {opt.postcode}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="rounded-[14px] border border-[#135BEC]/60 bg-[rgba(19,91,236,0.05)] p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl" aria-hidden="true">📍</span>
            <div>
              <p className="text-[13.5px] font-semibold text-[#E8F0FF]">
                {selected.line1}, {selected.city}, {selected.postcode}
              </p>
              <p className="text-[12px] text-[#5A6A8A] mt-0.5">{council ?? '…'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip label="✓ UPRN captured" tone="clear" />
            <Chip label="✓ Coordinates stored" tone="clear" />
            <Chip label="✓ Council identified" tone="clear" />
          </div>
        </div>
      )}

      {selected && (
        <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3">
            Planning constraint check — running automatically
          </p>

          {checking && (
            <p className="text-[13px] text-[#5A6A8A] py-2 inline-flex items-center gap-2">
              <Spinner /> Checking planning.data.gov.uk &amp; Environment Agency…
            </p>
          )}

          {!checking && constraints && (
            <>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {constraints.map(c => (
                  <Chip key={c.label} label={`${c.status === 'warning' ? '⚠' : '✓'} ${c.label}`} tone={c.status} />
                ))}
              </div>

              {constraints.some(c => c.status === 'warning') && (
                <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F59E0B]/30 bg-[rgba(245,158,11,0.08)] p-3 mb-4">
                  <span className="text-[#F59E0B] shrink-0" aria-hidden="true">⚠</span>
                  <p className="text-[12.5px] text-[#A8B8D8] leading-relaxed">
                    A constraint that may restrict some works was detected. We&rsquo;ll factor this into your snapshot now.
                  </p>
                </div>
              )}

              {dataSource === 'estimate' && dataNote && (
                <div className="flex items-start gap-2.5 rounded-[10px] border border-white/[0.12] bg-white/[0.03] p-3 mb-4">
                  <span className="text-[#5A6A8A] shrink-0" aria-hidden="true">ⓘ</span>
                  <p className="text-[12px] text-[#5A6A8A] leading-relaxed">{dataNote}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateSnapshot}
                disabled={isSaving}
                className="w-full px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving…' : 'Generate my free snapshot →'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Chip({ label, tone }: { label: string; tone: 'warning' | 'clear' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-medium border',
        tone === 'warning'
          ? 'bg-[rgba(245,158,11,0.1)] border-[#F59E0B]/30 text-[#FCD34D]'
          : 'bg-[rgba(19,91,236,0.08)] border-[#135BEC]/30 text-[#135BEC]'
      )}
    >
      {label}
    </span>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}