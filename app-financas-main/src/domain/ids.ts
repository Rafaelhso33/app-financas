export function uid(prefix = 'id'): string {
  // UUID v4-lite (bom o suficiente para uso local)
  const s = crypto.getRandomValues(new Uint8Array(16))
  // set version + variant
  s[6] = (s[6] & 0x0f) | 0x40
  s[8] = (s[8] & 0x3f) | 0x80
  const hex = [...s].map(b => b.toString(16).padStart(2, '0')).join('')
  return `${prefix}_${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function nowIso(): string {
  return new Date().toISOString()
}
