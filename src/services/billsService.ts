import { billsRepo } from '@/storage/repositories'
import type { Bill, BillStatus, Competencia } from '@/domain/types'
import { nowIso, uid } from '@/domain/ids'
import { getCompetencia } from './date'

export async function listBills(): Promise<Bill[]> {
  const bills = await billsRepo.list()
  return bills.sort((a,b)=> a.nome.localeCompare(b.nome))
}

export async function createBill(input: Omit<Bill, 'id'|'criadoEm'|'atualizadoEm'|'statusPorMes'> & { statusInicial?: BillStatus; competencia?: Competencia }): Promise<Bill> {
  const competencia = input.competencia ?? getCompetencia()
  const statusInicial = input.statusInicial ?? 'PENDENTE'
  const bill: Bill = {
    id: uid('bill'),
    nome: input.nome.trim(),
    categoria: input.categoria.trim() || 'Geral',
    valor: input.valor,
    vencimentoDia: input.vencimentoDia,
    recorrente: input.recorrente,
    observacoes: input.observacoes?.trim(),
    criadoEm: nowIso(),
    atualizadoEm: nowIso(),
    statusPorMes: { [competencia]: { status: statusInicial } }
  }
  await billsRepo.upsert(bill)
  return bill
}

export async function updateBillMeta(id: string, patch: Partial<Pick<Bill,'nome'|'categoria'|'valor'|'vencimentoDia'|'recorrente'|'observacoes'>>): Promise<void> {
  const bill = await billsRepo.get(id)
  if (!bill) return
  const updated: Bill = { ...bill, ...patch, atualizadoEm: nowIso() }
  await billsRepo.upsert(updated)
}

export async function setBillStatus(id: string, competencia: Competencia, status: BillStatus): Promise<void> {
  const bill = await billsRepo.get(id)
  if (!bill) return
  const entry = { status, pagoEm: status === 'PAGO' ? new Date().toISOString().slice(0,10) : undefined }
  const updated: Bill = {
    ...bill,
    atualizadoEm: nowIso(),
    statusPorMes: { ...bill.statusPorMes, [competencia]: entry }
  }
  await billsRepo.upsert(updated)
}

export async function removeBill(id: string): Promise<void> {
  await billsRepo.remove(id)
}

export async function ensureBillsForCompetencia(competencia: Competencia): Promise<void> {
  // regra: contas recorrentes "aparecem" todo mês.
  // aqui garantimos que, para o novo mês, exista um statusPorMes com PENDENTE (se não existir).
  const bills = await billsRepo.list()
  for (const b of bills) {
    if (!b.recorrente) continue
    if (!b.statusPorMes[competencia]) {
      const updated: Bill = {
        ...b,
        atualizadoEm: nowIso(),
        statusPorMes: { ...b.statusPorMes, [competencia]: { status: 'PENDENTE' } }
      }
      await billsRepo.upsert(updated)
    }
  }
}
