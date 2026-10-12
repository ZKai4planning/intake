/** Escapes regex special characters so a keyword can be used inside `new RegExp(...)` safely. */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * True if `keyword` (single word or a multi-word phrase) appears in `text`
 * on word boundaries — not merely as a raw substring. This is what
 * prevents e.g. "rental" from matching inside "parental", or "develop"
 * matching inside "redevelop".
 */
export function hasWholeWord(text: string, keyword: string): boolean {
  const pattern = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'i')
  return pattern.test(text)
}
