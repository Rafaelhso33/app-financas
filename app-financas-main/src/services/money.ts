export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

// aceita "1.234,56" / "1234,56" / "1234.56"
export function parseMoneyBR(input: string): number {
  const s = (input ?? '').trim()
  if (!s) return 0
  // remove tudo exceto dígitos, - , , .
  const clean = s.replace(/[^\d,.-]/g, '')
  // se tem vírgula, ela é decimal (pt-BR)
  if (clean.includes(',')) {
    const noDots = clean.replace(/\./g, '')
    const normalized = noDots.replace(',', '.')
    const n = Number(normalized)
    return Number.isFinite(n) ? n : 0
  }
  const n = Number(clean)
  return Number.isFinite(n) ? n : 0
}
