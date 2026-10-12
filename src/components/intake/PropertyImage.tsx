'use client'

import { useEffect, useState } from 'react'
import { Camera, ImageOff, Map as MapIcon, Satellite } from 'lucide-react'
import { cn } from '@/lib/cn'
import { mediaUrl } from '@/lib/intake/propertyClient'
import type { MediaKind } from '@/lib/intake/propertyTypes'
import { TileMap } from './TileMap'

export type ViewKind = MediaKind | 'map'

interface Props {
  applicationId: string
  label: string
  view: ViewKind
  onViewChange: (v: ViewKind) => void
  /** Property position — enables the Map view and the tile fallbacks. */
  lat?: number
  lng?: number
  streetViewAvailable: boolean
  attribution?: string | null
  className?: string
}

/** Large property photo with a Street view / Aerial toggle (design: "Street view" pill on the photo). */
export function PropertyImage({ applicationId, label, view, onViewChange, lat, lng, streetViewAvailable, attribution, className }: Props) {
  const hasCoords = lat != null && lng != null
  const src = mediaUrl(applicationId, view === 'map' ? 'aerial' : view, label)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => setState('loading'), [src])

  const noStreet = view === 'street-view' && !streetViewAvailable
  // Real tiles stand in whenever we have coordinates: the Map view, a missing
  // street photo ("map shown instead"), or an aerial image the engine couldn't supply.
  const showMap = hasCoords && (view === 'map' || noStreet)
  const showTileAerial = hasCoords && view === 'aerial' && state === 'error'
  const tilesOn = showMap || showTileAerial

  return (
    <div>
      <div className={cn('relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-[#141C30]', className)}>
        {!tilesOn && !noStreet && state !== 'error' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={view === 'aerial' ? `Aerial view of ${label}` : `Street view of ${label}`}
            onLoad={() => setState('ready')}
            onError={() => setState('error')}
            className={cn('h-full w-full object-cover transition-opacity duration-300', state === 'ready' ? 'opacity-100' : 'opacity-0')}
          />
        )}

        {state === 'loading' && !tilesOn && !noStreet && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#141C30] to-[#1A2540]" />}

        {tilesOn && lat != null && lng != null && (
          <>
            <TileMap
              lat={lat}
              lng={lng}
              layer={showTileAerial ? 'aerial' : 'streets'}
              zoom={showTileAerial ? 19 : 18}
              pin={!showTileAerial}
              label={`${showTileAerial ? 'Aerial view' : 'Map'} of ${label}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {noStreet && (
              <p className="absolute left-2.5 top-2.5 rounded-full bg-[#0A0E1A]/80 px-2.5 py-1 text-[11px] text-[#A8B8D8]">
                No street photo for this address – map shown instead
              </p>
            )}
          </>
        )}

        {!tilesOn && (noStreet || state === 'error') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <ImageOff className="h-6 w-6 text-[#5A6A8A]" />
            <p className="text-[13px] text-[#A8B8D8]">
              {noStreet ? 'No street photo is available for this address.' : 'We couldn’t load this image.'}
            </p>
            {noStreet && (
              <button type="button" onClick={() => onViewChange('aerial')} className="text-[12.5px] font-medium text-[#00D4FF] hover:underline">
                Show the aerial view instead
              </button>
            )}
          </div>
        )}

        <div className="absolute bottom-2.5 right-2.5 flex rounded-full border border-white/10 bg-[#0A0E1A]/75 p-0.5 backdrop-blur">
          {([
            ['street-view', 'Street view', Camera],
            ['aerial', 'Aerial', Satellite],
            ...(hasCoords ? ([['map', 'Map', MapIcon]] as const) : []),
          ] as const).map(([k, text, Icon]) => (
            <button
              key={k}
              type="button"
              onClick={() => onViewChange(k)}
              aria-pressed={view === k}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors',
                view === k ? 'bg-[#135BEC] text-white' : 'text-[#A8B8D8] hover:text-white',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {text}
            </button>
          ))}
        </div>
      </div>
      {attribution && !tilesOn && <p className="mt-1.5 text-[11px] text-[#5A6A8A]">{attribution}</p>}
    </div>
  )
}
