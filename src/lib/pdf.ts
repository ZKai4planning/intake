/**
 * pdf.ts
 * ───────
 * Client-side "download as PDF" helper used by the snapshot and paid
 * report screens (and the reports list). Renders a clean, single-column
 * document with a title block and a series of labelled sections —
 * enough structure for a real deliverable without pulling in a heavy
 * templating/layout engine.
 *
 * COPY PROTECTION — two layers, deliberately redundant:
 *  1. Every page is flattened to a raster image before it goes into the
 *     PDF — there is no text object anywhere in the file, so there is
 *     nothing to select or copy in ANY viewer, including browser-built
 *     -in ones (Chrome/Edge) that ignore PDF permission flags entirely.
 *     Trade-off, and it's a real one: this also removes text search and
 *     screen-reader accessibility. That's the deliberate choice here —
 *     see the conversation this shipped from before changing it back.
 *  2. The file is additionally saved with standard PDF permission flags
 *     restricting copy/modify (honoured by Acrobat, Preview, and most
 *     desktop readers — belt-and-braces on top of #1, not load-bearing
 *     by itself). Uses jsPDF's built-in RC4 40-bit handler, which is
 *     dated and trivially removable with tools like qpdf — real
 *     deterrent, not real security.
 *  There's no reliable way to block screenshots — see the conversation
 *  this shipped from for why that's out of scope.
 *
 * Built on jsPDF (loaded dynamically so it never lands in the initial
 * bundle — it's only needed at the moment someone clicks "Download").
 *
 * API swap point: once the backend can render a real PDF, swap the
 * callers to fetch a signed file URL instead of building one client-side.
 */

export interface PdfSection {
  heading: string
  /** Plain paragraphs, rendered in order before any bullets/items. */
  paragraphs?: string[]
  /** Bulleted lines, rendered after paragraphs. */
  bullets?: string[]
  /**
   * Label/detail pairs, rendered as a two-column RAG-style grid (label
   * bold with a colour dot, detail muted underneath) rather than a flat
   * list — matches the constraint-checklist layout used on the richer
   * report templates. Rendered after bullets.
   */
  items?: { label: string; detail: string; status?: 'clear' | 'warning' }[]
}

export interface PdfImagePage {
  heading: string
  /** Muted line under the heading, above the image — e.g. what the image shows and its data source. */
  description?: string
  /** PNG/JPEG data URL — e.g. from lib/staticMap.ts. */
  dataUrl: string
  /** Natural pixel size of the source image, used to preserve aspect ratio when it's scaled to page width. */
  widthPx: number
  heightPx: number
  /** Small print under the image — attribution, legend, etc. */
  caption?: string
}

export interface PdfDocumentInput {
  title: string
  /** Line(s) under the title — a single string, or an array to render as separate lines (e.g. coordinates on one line, ref/generated on the next). */
  subtitle?: string | string[]
  /** Optional small print shown once, right under the subtitle (disclaimers etc). */
  note?: string
  sections: PdfSection[]
  /** Each renders as its own page: heading, then the image scaled to content width, then an optional caption. */
  imagePages?: PdfImagePage[]
  /** Small print at the very bottom of every page. */
  footer?: string
  /**
   * Anti-piracy personalization: tiled diagonally across every page at
   * low opacity (e.g. the owner's name/email + a report reference), so
   * a leaked copy is visibly tied to the account it was generated for.
   * Keep this short — it repeats many times per page.
   */
  watermark?: string
}

const PAGE_MARGIN_PT = 48
const PAGE_W_PT = 595.28 // A4 pt
const PAGE_H_PT = 841.89
const CONTENT_W_PT = PAGE_W_PT - PAGE_MARGIN_PT * 2
// Space reserved at the top of EVERY page for the logo/tagline + page number
// (drawn in paintPage, not laid out as content) — content starts below this.
const HEADER_ZONE_PT = 40

// Rendered at 2.5x so text stays crisp once flattened to an image.
const SCALE = 2.5
const px = (pt: number) => pt * SCALE
const PAGE_W_PX = px(PAGE_W_PT)
const PAGE_H_PX = px(PAGE_H_PT)
const MARGIN_PX = px(PAGE_MARGIN_PT)
const CONTENT_W_PX = px(CONTENT_W_PT)
const HEADER_ZONE_PX = px(HEADER_ZONE_PT)
const CONTENT_TOP_PX = MARGIN_PX + HEADER_ZONE_PX

const FONT_STACK = 'Helvetica, Arial, sans-serif'
const BRAND_COLOR = 'rgb(0, 190, 105)' // close to the app's #135BEC on white
const TEXT_COLOR = 'rgb(20, 24, 34)'
const MUTED_COLOR = 'rgb(100, 110, 130)'
const DIVIDER_COLOR = 'rgb(220, 224, 232)'

type DrawOp =
  | { kind: 'text'; text: string; x: number; y: number; size: number; color: string; bold?: boolean; italic?: boolean }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number; color: string }
  | { kind: 'image'; dataUrl: string; x: number; y: number; width: number; height: number }
  | { kind: 'dot'; x: number; y: number; radius: number; color: string }

const RAG_COLOR: Record<'clear' | 'warning', string> = {
  clear: 'rgb(0, 166, 90)',
  warning: 'rgb(214, 120, 20)',
}

/**
 * Lays out the whole document into per-page draw-command lists, using
 * an offscreen canvas purely for text measurement/wrapping (mirrors
 * what jsPDF's splitTextToSize used to do). Pure layout — no painting,
 * no jsPDF — so it's easy to reason about pagination separately from
 * rendering.
 */
function layoutPages(doc: PdfDocumentInput): DrawOp[][] {
  const measure = document.createElement('canvas').getContext('2d')!
  let page: DrawOp[] = []
  const pages: DrawOp[][] = [page]
  let y = CONTENT_TOP_PX

  function font(size: number, bold = false, italic = false) {
    measure.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${px(size)}px ${FONT_STACK}`
  }

  function ensureSpace(needed: number) {
    if (y + needed > PAGE_H_PX - MARGIN_PX) {
      page = []
      pages.push(page)
      y = CONTENT_TOP_PX
    }
  }

  function wrap(text: string, maxWidth: number): string[] {
    const words = text.split(/\s+/)
    const lines: string[] = []
    let line = ''
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (line && measure.measureText(candidate).width > maxWidth) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    }
    if (line) lines.push(line)
    return lines
  }

  function writeWrapped(
    text: string,
    size: number,
    color: string,
    lineHeightPt: number,
    opts: { bold?: boolean; italic?: boolean; indentPt?: number } = {}
  ) {
    const indent = px(opts.indentPt ?? 0)
    font(size, opts.bold, opts.italic)
    const lineHeight = px(lineHeightPt)
    for (const line of wrap(text, CONTENT_W_PX - indent)) {
      ensureSpace(lineHeight)
      page.push({ kind: 'text', text: line, x: MARGIN_PX + indent, y, size, color, bold: opts.bold, italic: opts.italic })
      y += lineHeight
    }
  }

  // ── Title ────────────────────────────────────────────────────────
  writeWrapped(doc.title, 20, TEXT_COLOR, 25, { bold: true })
  y += px(2)

  // ── Subtitle ─────────────────────────────────────────────────────
  const subtitleLines = Array.isArray(doc.subtitle) ? doc.subtitle : doc.subtitle ? [doc.subtitle] : []
  for (const line of subtitleLines) writeWrapped(line, 10.5, MUTED_COLOR, 15)

  // ── Divider ──────────────────────────────────────────────────────
  y += px(6)
  page.push({ kind: 'line', x1: MARGIN_PX, y1: y, x2: PAGE_W_PX - MARGIN_PX, y2: y, color: DIVIDER_COLOR })
  y += px(20)

  // ── Note / disclaimer ────────────────────────────────────────────
  if (doc.note) {
    writeWrapped(doc.note, 9.5, MUTED_COLOR, 13, { italic: true })
    y += px(10)
  }

  // ── Sections ─────────────────────────────────────────────────────
  for (const section of doc.sections) {
    ensureSpace(px(30))
    writeWrapped(section.heading.toUpperCase(), 11.5, BRAND_COLOR, 16, { bold: true })
    y += px(4)

    for (const para of section.paragraphs ?? []) {
      writeWrapped(para, 10.5, TEXT_COLOR, 15)
      y += px(6)
    }

    for (const bullet of section.bullets ?? []) {
      ensureSpace(px(15))
      page.push({ kind: 'text', text: '\u2022', x: MARGIN_PX, y, size: 10.5, color: BRAND_COLOR })
      writeWrapped(bullet, 10.5, TEXT_COLOR, 15, { indentPt: 14 })
    }

    if (section.items?.length) {
      const GUTTER_PT = 20
      const DOT_GAP_PT = 12
      const colWidthPt = (CONTENT_W_PT - GUTTER_PT) / 2
      const colWidthPx = px(colWidthPt)
      const textWidthPx = colWidthPx - px(DOT_GAP_PT)
      const gutterPx = px(GUTTER_PT)
      const labelLineHeightPt = 14
      const detailLineHeightPt = 13

      function measureItem(item: { label: string; detail: string }) {
        font(10.5, true)
        const labelLines = wrap(item.label, textWidthPx)
        font(10, false)
        const detailLines = wrap(item.detail, textWidthPx)
        const height = labelLines.length * px(labelLineHeightPt) + detailLines.length * px(detailLineHeightPt) + px(3)
        return { labelLines, detailLines, height }
      }

      function drawItem(
        item: { label: string; detail: string; status?: 'clear' | 'warning' },
        m: ReturnType<typeof measureItem>,
        colX: number,
        rowY: number
      ) {
        const textX = colX + px(DOT_GAP_PT)
        page.push({
          kind: 'dot',
          x: colX + px(3),
          y: rowY + px(5),
          radius: px(3),
          color: RAG_COLOR[item.status ?? 'clear'],
        })
        let cy = rowY
        for (const line of m.labelLines) {
          page.push({ kind: 'text', text: line, x: textX, y: cy, size: 10.5, color: TEXT_COLOR, bold: true })
          cy += px(labelLineHeightPt)
        }
        cy += px(3)
        for (const line of m.detailLines) {
          page.push({ kind: 'text', text: line, x: textX, y: cy, size: 10, color: MUTED_COLOR })
          cy += px(detailLineHeightPt)
        }
      }

      const items = section.items
      for (let i = 0; i < items.length; i += 2) {
        const left = items[i]
        const right = items[i + 1]
        const leftM = measureItem(left)
        const rightM = right ? measureItem(right) : null
        const rowHeight = Math.max(leftM.height, rightM?.height ?? 0) + px(10)
        ensureSpace(rowHeight)
        drawItem(left, leftM, MARGIN_PX, y)
        if (right && rightM) drawItem(right, rightM, MARGIN_PX + colWidthPx + gutterPx, y)
        y += rowHeight
      }
    }
    y += px(12)
  }

  // ── Full-page images (map / area snapshot etc.) ─────────────────
  for (const imgPage of doc.imagePages ?? []) {
    // Always start an image page fresh, unless the current page is still empty.
    if (page.length > 0) {
      page = []
      pages.push(page)
      y = CONTENT_TOP_PX
    }

    writeWrapped(imgPage.heading, 16, TEXT_COLOR, 21, { bold: true })
    y += px(4)
    if (imgPage.description) {
      writeWrapped(imgPage.description, 9.5, MUTED_COLOR, 14)
    }
    y += px(10)

    const displayWidth = CONTENT_W_PX
    const displayHeight = (imgPage.heightPx / imgPage.widthPx) * displayWidth
    ensureSpace(displayHeight)
    page.push({ kind: 'image', dataUrl: imgPage.dataUrl, x: MARGIN_PX, y, width: displayWidth, height: displayHeight })
    y += displayHeight + px(10)

    if (imgPage.caption) {
      writeWrapped(imgPage.caption, 9.5, MUTED_COLOR, 13, { italic: true })
    }
  }

  return pages
}

/** Turns a data URL into a drawable, loaded HTMLImageElement — canvas drawImage() needs the image decoded first. */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('failed to load image for PDF page'))
    img.src = dataUrl
  })
}

/** Paints one page's draw ops (+ watermark + footer) onto a fresh canvas and returns a PNG data URL. Nothing here is real text — it's all pixels by the time it leaves this function. */
async function paintPage(ops: DrawOp[], pageIndex: number, doc: PdfDocumentInput): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = PAGE_W_PX
  canvas.height = PAGE_H_PX
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, PAGE_W_PX, PAGE_H_PX)

  // ── Letterhead — logo + tagline top-left, page number top-right,
  // drawn identically on every page rather than laid out as content ──
  ctx.textAlign = 'left'
  ctx.font = `bold ${px(13)}px ${FONT_STACK}`
  ctx.fillStyle = BRAND_COLOR
  ctx.fillText('AI4Planning', MARGIN_PX, MARGIN_PX + px(11))
  ctx.font = `${px(8)}px ${FONT_STACK}`
  ctx.fillStyle = MUTED_COLOR
  ctx.fillText('the planning cosmos', MARGIN_PX, MARGIN_PX + px(23))
  ctx.textAlign = 'right'
  ctx.font = `${px(9.5)}px ${FONT_STACK}`
  ctx.fillText(`Page ${pageIndex + 1}`, PAGE_W_PX - MARGIN_PX, MARGIN_PX + px(15))

  for (const op of ops) {
    if (op.kind === 'line') {
      ctx.strokeStyle = op.color
      ctx.lineWidth = px(1)
      ctx.beginPath()
      ctx.moveTo(op.x1, op.y1)
      ctx.lineTo(op.x2, op.y2)
      ctx.stroke()
    } else if (op.kind === 'image') {
      const img = await loadImage(op.dataUrl)
      ctx.drawImage(img, op.x, op.y, op.width, op.height)
    } else if (op.kind === 'dot') {
      ctx.fillStyle = op.color
      ctx.beginPath()
      ctx.arc(op.x, op.y, op.radius, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.font = `${op.italic ? 'italic ' : ''}${op.bold ? 'bold ' : ''}${px(op.size)}px ${FONT_STACK}`
      ctx.fillStyle = op.color
      ctx.textAlign = 'left'
      ctx.fillText(op.text, op.x, op.y)
    }
  }

  // ── Watermark — tiled, low-opacity, personal ───────────────────
  if (doc.watermark) {
    ctx.save()
    ctx.globalAlpha = 0.07
    ctx.fillStyle = TEXT_COLOR
    ctx.font = `bold ${px(11)}px ${FONT_STACK}`
    const stepX = px(220)
    const stepY = px(110)
    for (let wy = -stepY; wy < PAGE_H_PX + stepY; wy += stepY) {
      for (let wx = -stepX; wx < PAGE_W_PX + stepX; wx += stepX) {
        ctx.save()
        ctx.translate(wx, wy)
        ctx.rotate((-35 * Math.PI) / 180)
        ctx.fillText(doc.watermark, 0, 0)
        ctx.restore()
      }
    }
    ctx.restore()
  }

  // ── Footer ───────────────────────────────────────────────────────
  if (doc.footer) {
    const footerSize = 8.5
    const footerLineHeight = px(12)
    ctx.font = `${px(footerSize)}px ${FONT_STACK}`
    ctx.fillStyle = MUTED_COLOR
    ctx.textAlign = 'left'

    const words = doc.footer.split(/\s+/)
    const lines: string[] = []
    let line = ''
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (line && ctx.measureText(candidate).width > CONTENT_W_PX) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    }
    if (line) lines.push(line)

    const startY = PAGE_H_PX - px(24) - (lines.length - 1) * footerLineHeight
    lines.forEach((l, i) => ctx.fillText(l, MARGIN_PX, startY + i * footerLineHeight))
  }

  return canvas.toDataURL('image/png')
}

/** Random per-document owner password — governs the permission flags below, never shown to anyone. */
function ownerPassword(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
}

/**
 * Builds and downloads a PDF from a simple heading/paragraph/bullet
 * structure — flattened to per-page images (see file header for why)
 * and saved with copy/modify permissions restricted.
 */
export async function downloadPdfDocument(filename: string, doc: PdfDocumentInput): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const pages = layoutPages(doc)

  const pdf = new jsPDF({
    unit: 'pt',
    format: 'a4',
    encryption: {
      userPassword: '', // opens with no password — restriction is on copy/modify, not access
      ownerPassword: ownerPassword(),
      userPermissions: ['print'], // 'copy' and 'modify' deliberately omitted
    },
  })

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage()
    const dataUrl = await paintPage(pages[i], i, doc)
    pdf.addImage(dataUrl, 'PNG', 0, 0, PAGE_W_PT, PAGE_H_PT)
  }

  pdf.save(filename)
}