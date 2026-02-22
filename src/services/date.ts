import type { Competencia, ISODate } from '@/domain/types'

export function toISODate(d: Date): ISODate {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getCompetencia(date = new Date()): Competencia {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function parseCompetencia(c: Competencia): { year: number; month: number } {
  const [y, m] = c.split('-').map(Number)
  return { year: y, month: m } // month 1-12
}

export function addMonthsCompetencia(c: Competencia, delta: number): Competencia {
  const { year, month } = parseCompetencia(c)
  const d = new Date(year, month - 1, 1)
  d.setMonth(d.getMonth() + delta)
  return getCompetencia(d)
}

export function lastDayOfMonth(c: Competencia): number {
  const { year, month } = parseCompetencia(c)
  return new Date(year, month, 0).getDate()
}

export function dueDateForCompetencia(c: Competencia, vencimentoDia: number): ISODate {
  const { year, month } = parseCompetencia(c)
  const last = lastDayOfMonth(c)
  const day = Math.min(Math.max(1, vencimentoDia), last)
  return toISODate(new Date(year, month - 1, day))
}

export function daysUntilDue(c: Competencia, vencimentoDia: number, today = new Date()): number {
  const due = new Date(dueDateForCompetencia(c, vencimentoDia))
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diff = due.getTime() - t.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
