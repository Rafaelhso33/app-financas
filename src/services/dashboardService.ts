import type { Bill, Competencia, Asset, CreditPurchase, Loan } from '@/domain/types'
import { dueDateForCompetencia, daysUntilDue, addMonthsCompetencia, parseCompetencia } from './date'
import { parcelasPagasAteHoje } from './creditService'
import { loanTotals } from './loansService'

export function billsForCompetencia(all: Bill[], competencia: Competencia): Bill[] {
  return all.filter(b => {
    const has = !!b.statusPorMes?.[competencia]
    if (b.recorrente) return true
    return has
  })
}

export function totalsForCompetencia(bills: Bill[], competencia: Competencia, loanPaymentsTotal = 0, savingsTotal = 0) {
  let pago = 0, pendente = 0
  for (const b of bills) {
    const st = b.statusPorMes?.[competencia]?.status
    if (!st) continue
    if (st === 'PAGO') pago += b.valor
    else pendente += b.valor
  }
  const total = pago + pendente + loanPaymentsTotal + savingsTotal
  const pctPago = total > 0 ? (pago / total) : 0
  return { pago, pendente, total, pctPago, loanPaymentsTotal, savingsTotal }
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

export type MonthlyEvolutionPoint = {
  competencia: string
  label: string
  contas: number
  contasVar: number | null
  cartoes: number
  cartoesVar: number | null
  emprestimos: number
  emprestimosVar: number | null
  poupanca: number
  poupancaVar: number | null
  ativos: number
  ativosVar: number | null
  patrimonioLiquido: number
}

function getPreviousCompetencia(comp: Competencia): Competencia {
  const p = parseCompetencia(comp as any)
  let m = p.month - 1
  let y = p.year
  if (m < 1) {
    m = 12
    y -= 1
  }
  return `${y}-${String(m).padStart(2, '0')}` as Competencia
}

export function calculateMonthlyEvolution(
  bills: Bill[],
  assets: Asset[],
  credits: CreditPurchase[],
  loans: Loan[],
  targetCompetencia: Competencia
): MonthlyEvolutionPoint[] {
  // Gerar últimos 12 meses até targetCompetencia
  const comps: Competencia[] = []
  let curr = targetCompetencia
  for (let i = 0; i < 12; i++) {
    comps.unshift(curr)
    curr = getPreviousCompetencia(curr)
  }

  const points: MonthlyEvolutionPoint[] = []
  let prevContas = 0
  let prevCartoes = 0
  let prevEmprestimos = 0
  let prevPoupanca = 0
  let prevAtivos = 0

  for (let idx = 0; idx < comps.length; idx++) {
    const comp = comps[idx]
    const p = parseCompetencia(comp as any)
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const label = `${monthNames[p.month - 1]}/${String(p.year).slice(2)}`

    // 1. Contas (soma das bills da competência, pagas + pendentes)
    const bList = billsForCompetencia(bills, comp)
    const contasVal = bList.reduce((acc, b) => {
      const st = b.statusPorMes?.[comp]
      if (b.recorrente || st) {
        return acc + b.valor
      }
      return acc
    }, 0)

    // 2. Cartões (saldo devedor na competência)
    let cartoesVal = 0
    for (const c of credits) {
      // verifica se a compra está ativa nesta competência
      let isAtiva = false
      for (let i = 0; i < c.parcelasTotal; i++) {
        if (addMonthsCompetencia(c.competenciaInicio, i) === comp) {
          isAtiva = true
          break
        }
      }
      if (isAtiva) {
        cartoesVal += c.valorTotal / c.parcelasTotal
      }
    }

    // 3. Empréstimos (saldo devedor total acumulado ou pagamentos da competência / saldo devedor na época)
    let emprestimosVal = 0
    for (const l of loans) {
      if (l.dataInicio.slice(0, 7) <= comp) {
        const pagantesAte = (l.pagamentos || [])
          .filter(pay => pay.data.slice(0, 7) <= comp)
          .reduce((s, pay) => s + (pay.valor || 0), 0)
        const saldoDevedorLoan = Math.max(0, l.valorEmprestimo - pagantesAte)
        emprestimosVal += saldoDevedorLoan
      }
    }

    // 4. Poupança
    let poupancaVal = 0
    for (const a of assets) {
      if (a.categoria.toLowerCase().includes('poupança') || a.categoria.toLowerCase().includes('poupanca')) {
        const val = a.valorPorMes?.[comp] ?? (a.recorrente ? (a.valor ?? 0) : 0)
        poupancaVal += val
      }
    }

    // 5. Ativos (demais ativos exceto poupança)
    let ativosVal = 0
    for (const a of assets) {
      if (!(a.categoria.toLowerCase().includes('poupança') || a.categoria.toLowerCase().includes('poupanca'))) {
        const val = a.valorPorMes?.[comp] ?? (a.recorrente ? (a.valor ?? 0) : 0)
        ativosVal += val
      }
    }

    // Variações percentuais em relação ao mês anterior
    const calcVar = (currVal: number, prevVal: number) => {
      if (prevVal === 0) return null
      return ((currVal - prevVal) / prevVal) * 100
    }

    const contasVar = idx === 0 ? null : calcVar(contasVal, prevContas)
    const cartoesVar = idx === 0 ? null : calcVar(cartoesVal, prevCartoes)
    const emprestimosVar = idx === 0 ? null : calcVar(emprestimosVal, prevEmprestimos)
    const poupancaVar = idx === 0 ? null : calcVar(poupancaVal, prevPoupanca)
    const ativosVar = idx === 0 ? null : calcVar(ativosVal, prevAtivos)

    // Patrimônio líquido = (Ativos + Poupança) - (Contas pendentes/total + Cartões + Empréstimos)
    const patrimonioLiquido = (ativosVal + poupancaVal) - (contasVal + cartoesVal + emprestimosVal)

    points.push({
      competencia: comp,
      label,
      contas: contasVal,
      contasVar,
      cartoes: cartoesVal,
      cartoesVar,
      emprestimos: emprestimosVal,
      emprestimosVar,
      poupanca: poupancaVal,
      poupancaVar,
      ativos: ativosVal,
      ativosVar,
      patrimonioLiquido
    })

    prevContas = contasVal
    prevCartoes = cartoesVal
    prevEmprestimos = emprestimosVal
    prevPoupanca = poupancaVal
    prevAtivos = ativosVal
  }

  return points
}
