import { describe, it, expect } from 'vitest'
import { dueDateForCompetencia, daysUntilDue, lastDayOfMonth } from './date'

describe('regras de data', ()=>{
  it('ajusta vencimento para último dia do mês (fevereiro)', ()=>{
    const c = '2026-02'
    expect(lastDayOfMonth(c)).toBe(28)
    expect(dueDateForCompetencia(c, 31)).toBe('2026-02-28')
  })

  it('regra de 2 dias (<=2)', ()=>{
    const c = '2026-03'
    const today = new Date('2026-03-08T10:00:00Z')
    // vencimento dia 10 => faltam 2 dias
    expect(daysUntilDue(c, 10, today)).toBe(2)
    // vencimento dia 9 => faltam 1 dia
    expect(daysUntilDue(c, 9, today)).toBe(1)
  })
})
