import type { Bill, Competencia } from '@/domain/types'
import { dueDateForCompetencia, daysUntilDue } from './date'

export function billsForCompetencia(all: Bill[], competencia: Competencia): Bill[] {
  return all.filter(b => {
    const has = !!b.statusPorMes?.[competencia]
    if (b.recorrente) return true // recorrentes sempre "existem" no mês (ensure cria status se faltando)
    return has // não recorrente só aparece no mês em que tem status
  })
}

export function totalsForCompetencia(bills: Bill[], competencia: Competencia) {
  let pago = 0, pendente = 0
  for (const b of bills) {
    const st = b.statusPorMes?.[competencia]?.status
    if (!st) continue
    if (st === 'PAGO') pago += b.valor
    else pendente += b.valor
  }
  const total = pago + pendente
  const pctPago = total > 0 ? (pago / total) : 0
  return { pago, pendente, total, pctPago }
}

export function vencendoEm2Dias(bills: Bill[], competencia: Competencia, today = new Date()) {
  return bills
    .filter(b => b.statusPorMes?.[competencia]?.status === 'PENDENTE')
    .map(b => ({
      bill: b,
      dueDate: dueDateForCompetencia(competencia, b.vencimentoDia),
      dias: daysUntilDue(competencia, b.vencimentoDia, today)
    }))
    .filter(x => x.dias <= 2)
    .sort((a,b)=> a.dias - b.dias)
}


export function sum(values: number[]): number {
  return values.reduce((a,b)=>a+(b||0),0)
}
