'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Home, Loader2, MapPin, Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { confirmProperty, mediaUrl, searchProperties, toIntakeProperty } from '@/lib/intake/propertyClient'
import type { AddressSuggestion, ManualAddress, SearchResponse } from '@/lib/intake/propertyTypes'
import type { IntakeProperty } from '@/lib/intake/types'
import { PropertyImage, type ViewKind } from '../PropertyImage'
import { FieldError, IconField, SELECTED, IDLE, StepActions, StepCard } from '../ui'

interface Props {
  value: IntakeProperty | null
  onChange: (v: IntakeProperty | null) => void
  onBack: () => void
  onNext: () => void
}

const UK_POSTCODE = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/

export function PropertyCard({ value, onChange, onBack, onNext }: Props) {
  const [query, setQuery] = useState(value?.fullAddress ?? '')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchNote, setSearchNote] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState('')
  const [view, setView] = useState<ViewKind>('street-view')
  const [manualOpen, setManualOpen] = useState(false)
  const [manual, setManual] = useState<ManualAddress>({ line1: '', town: '', postcode: '' })
  const [manualError, setManualError] = useState('')
  const [nextTried, setNextTried] = useState(false)

  const skipSearch = useRef(false)
  const searchAbort = useRef<AbortController | null>(null)
  const confirmAbort = useRef<AbortController | null>(null)

  // Debounced type-ahead.
  useEffect(() => {
    if (skipSearch.current) {
      skipSearch.current = false
      return
    }
    const q = query.trim()
    searchAbort.current?.abort()
    if (value || q.length < 3) {
      setResults(null)
      setSearchNote('')
      setSearching(false)
      return
    }
    setSearching(true)
    const controller = new AbortController()
    searchAbort.current = controller
    const timer = setTimeout(async () => {
      const res = await searchProperties(q, controller.signal)
      if (controller.signal.aborted) return
      setSearching(false)
      if ('error' in res) {
        setResults(null)
        setSearchNote(res.error)
        return
      }
      setResults(res)
      setSearchNote(res.message ?? '')
    }, 350)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, value])

  useEffect(() => () => confirmAbort.current?.abort(), [])

  async function choose(a: AddressSuggestion) {
    skipSearch.current = true
    setQuery(a.fullAddress)
    setResults(null)
    setSearchNote('')
    await runConfirm({ id: a.id })
  }

  async function runConfirm(body: { id: string } | { manual: ManualAddress }) {
    confirmAbort.current?.abort()
    const controller = new AbortController()
    confirmAbort.current = controller
    setConfirming(true)
    setConfirmError('')
    const res = await confirmProperty(body, controller.signal)
    if (controller.signal.aborted) return
    setConfirming(false)
    if ('error' in res) {
      setConfirmError(res.error)
      return
    }
    skipSearch.current = true
    setQuery(res.data.address.fullAddress)
    setView(res.data.streetViewAvailable ? 'street-view' : res.data.address.lat != null && res.data.address.lng != null ? 'map' : 'aerial')
    setManualOpen(false)
    onChange(toIntakeProperty(res.data))
  }

  function onInput(v: string) {
    if (value) onChange(null)
    setConfirmError('')
    setNextTried(false)
    setQuery(v)
  }

  function searchAgain() {
    confirmAbort.current?.abort()
    setConfirming(false)
    onChange(null)
    setQuery('')
    setResults(null)
    setConfirmError('')
    setNextTried(false)
  }

  function submitManual() {
    if (!manual.line1.trim()) return setManualError('Please enter the first line of the address.')
    if (!UK_POSTCODE.test(manual.postcode.trim())) return setManualError('Please enter a valid UK postcode.')
    setManualError('')
    runConfirm({ manual: { ...manual, line1: manual.line1.trim(), town: manual.town?.trim(), postcode: manual.postcode.trim() } })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (value?.confirmed) onNext()
    else setNextTried(true)
  }

  const showList = !value && !confirming && results && (results.addresses.length > 0 || results.postcodes.length > 0)
  const noResults = !value && !confirming && !searching && query.trim().length >= 3 && results && !showList

  return (
    <StepCard icon={<Home className="h-[18px] w-[18px]" />} title="Property">
      <form onSubmit={submit} noValidate>
        <h3 className="text-[19px] font-semibold text-[#E8F0FF]">Tell us the property</h3>
        <p className="mb-4 mt-1 text-[13.5px] text-[#A8B8D8]">Enter the address or postcode.</p>

        {/* Search box + dropdown */}
        <div className="relative">
          <div className="flex items-center gap-3 rounded-[12px] border border-white/[0.10] bg-[#141C30] px-3.5 py-3 transition-all focus-within:border-[#135BEC] focus-within:shadow-[0_0_0_3px_rgba(19,91,236,0.15)]">
            <Search className="h-[18px] w-[18px] shrink-0 text-[#5A6A8A]" />
            <input
              value={query}
              onChange={e => onInput(e.target.value)}
              placeholder="e.g. 22 Example Road, London, E6 2AA"
              aria-label="Property address or postcode"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-[16px] text-[#E8F0FF] outline-none placeholder:text-[#55648A] focus-visible:outline-none sm:text-[14.5px]"
            />
            {(searching || confirming) && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#00D4FF]" />}
            {!searching && !confirming && query && (
              <button type="button" onClick={searchAgain} aria-label="Clear" className="text-[#5A6A8A] hover:text-[#E8F0FF]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {showList && results && (
            <ul
              role="listbox"
              className="absolute inset-x-0 top-[calc(100%+6px)] z-20 max-h-[264px] overflow-y-auto rounded-xl border border-white/[0.10] bg-[#0F1525] py-1 shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
            >
              {results.postcodes.map(pc => (
                <li key={pc}>
                  <button type="button" onClick={() => setQuery(pc)} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[13.5px] text-[#E8F0FF] hover:bg-white/[0.05]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#5A6A8A]" />
                    {pc}
                  </button>
                </li>
              ))}
              {results.addresses.map(a => (
                <li key={a.id}>
                  <button type="button" role="option" onClick={() => choose(a)} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-white/[0.05]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#5A6A8A]" />
                    <span className="min-w-0 flex-1 truncate text-[13.5px] text-[#E8F0FF]">{a.fullAddress}</span>
                    {a.propertyType && <span className="hidden shrink-0 text-[11.5px] text-[#5A6A8A] sm:inline">{a.propertyType}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {searchNote && !value && <p className="mt-2 text-[12.5px] leading-snug text-[#F59E0B]">{searchNote}</p>}
        {noResults && !searchNote && <p className="mt-2 text-[12.5px] text-[#A8B8D8]">No matching addresses. Check the spelling, or enter it manually below.</p>}
        {confirming && <p className="mt-3 text-[13px] text-[#A8B8D8]">Checking the property and planning data — this can take a few seconds…</p>}
        <FieldError>{confirmError}</FieldError>

        {/* Manual entry */}
        {!value && !confirming && (
          <div className="mt-3">
            {!manualOpen ? (
              <button type="button" onClick={() => setManualOpen(true)} className="text-[12.5px] font-medium text-[#00D4FF] hover:underline">
                Can&apos;t find it? Enter the address manually
              </button>
            ) : (
              <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
                <IconField icon={<Home className="h-[18px] w-[18px]" />} label="Address line 1" value={manual.line1} onChange={e => setManual({ ...manual, line1: e.target.value })} placeholder="22 Example Road" />
                <div className="grid grid-cols-2 gap-3">
                  <IconField icon={<MapPin className="h-[18px] w-[18px]" />} label="Town / city" value={manual.town ?? ''} onChange={e => setManual({ ...manual, town: e.target.value })} placeholder="London" />
                  <IconField icon={<MapPin className="h-[18px] w-[18px]" />} label="Postcode" value={manual.postcode} onChange={e => setManual({ ...manual, postcode: e.target.value })} placeholder="E6 2AA" autoCapitalize="characters" />
                </div>
                <FieldError>{manualError}</FieldError>
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setManualOpen(false)} className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8]">Cancel</button>
                  <button type="button" onClick={submitManual} className="rounded-full bg-[#135BEC] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#2A6BF0]">Use this address</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected property */}
        {value && (
          <div className="mt-5 space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.10] bg-[#141C30] p-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(value.applicationId, value.streetViewAvailable ? 'street-view' : 'aerial', value.fullAddress)}
                alt=""
                className="h-14 w-16 shrink-0 rounded-lg bg-[#1A2540] object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-semibold text-[#E8F0FF]">{value.line1}</p>
                <p className="truncate text-[12.5px] text-[#A8B8D8]">{[value.town, value.postcode].filter(Boolean).join(' · ')}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 shrink-0 text-[#00D4FF]" />
            </div>
            <p className="-mt-3 text-[12.5px] text-[#5A6A8A]">
              Not the right property?{' '}
              <button type="button" onClick={searchAgain} className="font-medium text-[#00D4FF] hover:underline">Search again</button>
            </p>

            <div>
              <p className="mb-2.5 text-[14px] font-medium text-[#E8F0FF]">Is this the correct property?</p>
              <PropertyImage
                applicationId={value.applicationId}
                label={value.fullAddress}
                view={view}
                onViewChange={setView}
                lat={value.lat}
                lng={value.lng}
                streetViewAvailable={value.streetViewAvailable}
                attribution={view === 'street-view' ? value.streetViewAttribution : value.aerialAttribution}
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onChange({ ...value, confirmed: true })}
                aria-pressed={value.confirmed}
                className={cn('flex w-full items-center gap-3 rounded-[12px] border px-4 py-3 text-left text-[14px] font-medium transition-all', value.confirmed ? SELECTED : IDLE)}
              >
                <CheckCircle2 className={cn('h-5 w-5', value.confirmed ? 'text-[#00D4FF]' : 'text-[#5A6A8A]')} />
                Yes, that&apos;s my property
              </button>
              <button type="button" onClick={searchAgain} className={cn('flex w-full items-center gap-3 rounded-[12px] border px-4 py-3 text-left text-[14px] font-medium transition-all', IDLE)}>
                <Search className="h-5 w-5 text-[#5A6A8A]" />
                No, choose another
              </button>
            </div>

            {value.confirmed && (value.facts.length > 0 || value.constraintFlags.length > 0 || value.council) && (
              <div className="rounded-xl border border-[#00D4FF]/20 bg-[rgba(0,212,255,0.05)] p-3.5 animate-fade-in">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#00D4FF]">What we found</p>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-2">
                  {value.council && (
                    <div className="flex justify-between gap-3"><dt className="text-[#5A6A8A]">Council</dt><dd className="text-right text-[#E8F0FF]">{value.council}</dd></div>
                  )}
                  {value.facts.map(f => (
                    <div key={f.label} className="flex justify-between gap-3"><dt className="text-[#5A6A8A]">{f.label}</dt><dd className="text-right text-[#E8F0FF]">{f.value}</dd></div>
                  ))}
                </dl>
                {value.constraintFlags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {value.constraintFlags.map(f => (
                      <span key={f} className="rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2.5 py-1 text-[11.5px] font-medium text-[#F59E0B]">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {value.demo && (
              <p className="text-[11.5px] text-[#F59E0B]/80">Demo data — connect the planning engine to see live property and planning information.</p>
            )}
          </div>
        )}

        <StepActions
          onBack={onBack}
          hint={nextTried && !value?.confirmed ? (value ? 'Please confirm this is your property to continue.' : 'Please choose your property to continue.') : undefined}
        />
      </form>
    </StepCard>
  )
}
