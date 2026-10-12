/**
 * download.ts
 * ────────────
 * Tiny client-side "download as file" helper used by the snapshot and
 * paid-report screens. Builds a plain-text Blob and clicks a throwaway
 * anchor — no PDF/docx dependency needed for the mock deliverable.
 *
 * API swap point: once the backend can render a real PDF, swap the
 * callers to fetch a signed file URL instead of building text here.
 */
export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
