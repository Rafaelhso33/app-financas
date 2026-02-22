import type { Loan, LoanPayment } from '@/domain/types'
import { loansRepo } from '@/storage/repositories'
import { nowIso, uid } from '@/domain/ids'

export async function listLoans(): Promise<Loan[]> {
  const all = await loansRepo.list()
  return all.sort((a,b)=> b.dataInicio.localeCompare(a.dataInicio))
}

export function loanTotals(l: Loan): { valorPago: number; saldoDevedor: number; progresso: number } {
  const valorPago = (l.pagamentos ?? []).reduce((s,p)=> s + (p.valor||0), 0)
  const saldoDevedor = Math.max(0, l.valorEmprestimo - valorPago)
  const progresso = l.valorEmprestimo > 0 ? Math.min(1, valorPago / l.valorEmprestimo) : 0
  return { valorPago, saldoDevedor, progresso }
}

export async function createLoan(input: Omit<Loan,'id'|'criadoEm'|'atualizadoEm'|'pagamentos'>): Promise<Loan> {
  const l: Loan = {
    ...input,
    id: uid('loan'),
    pagamentos: [],
    criadoEm: nowIso(),
    atualizadoEm: nowIso()
  }
  await loansRepo.upsert(l)
  return l
}

export async function updateLoan(id: string, patch: Partial<Omit<Loan,'id'|'criadoEm'>>): Promise<void> {
  const all = await loansRepo.list()
  const found = all.find(x=>x.id===id)
  if (!found) return
  const merged: Loan = { ...found, ...patch, atualizadoEm: nowIso() }
  await loansRepo.upsert(merged)
}

export async function removeLoan(id: string): Promise<void> {
  await loansRepo.remove(id)
}

export async function addPayment(loanId: string, data: string, valor: number): Promise<void> {
  const all = await loansRepo.list()
  const found = all.find(x=>x.id===loanId)
  if (!found) return
  const payment: LoanPayment = { id: uid('pay'), data, valor }
  const merged: Loan = {
    ...found,
    pagamentos: [...(found.pagamentos||[]), payment].sort((a,b)=> a.data.localeCompare(b.data)),
    atualizadoEm: nowIso()
  }
  await loansRepo.upsert(merged)
}

export async function removePayment(loanId: string, paymentId: string): Promise<void> {
  const all = await loansRepo.list()
  const found = all.find(x=>x.id===loanId)
  if (!found) return
  const merged: Loan = {
    ...found,
    pagamentos: (found.pagamentos||[]).filter(p=>p.id!==paymentId),
    atualizadoEm: nowIso()
  }
  await loansRepo.upsert(merged)
}

export async function updatePayment(loanId: string, paymentId: string, patch: Partial<Pick<LoanPayment,'data'|'valor'>>): Promise<void> {
  const all = await loansRepo.list()
  const found = all.find(x=>x.id===loanId)
  if (!found) return
  const pagamentos = (found.pagamentos||[]).map(p=> p.id===paymentId ? ({...p, ...patch}) : p).sort((a,b)=> a.data.localeCompare(b.data))
  const merged: Loan = { ...found, pagamentos, atualizadoEm: nowIso() }
  await loansRepo.upsert(merged)
}


import type { Competencia } from '@/domain/types'

export function paymentsTotalForCompetencia(l: Loan, competencia: Competencia): number {
  const prefix = competencia + '-'
  return (l.pagamentos ?? []).filter(p => p.data.startsWith(prefix)).reduce((s,p)=> s + (p.valor||0), 0)
}
