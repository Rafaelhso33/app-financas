import type { Competencia, CreditPurchase } from '@/domain/types'
import { creditRepo } from '@/storage/repositories'
import { nowIso, uid } from '@/domain/ids'
import { addMonthsCompetencia, parseCompetencia } from './date'

function monthsDiffCompetencia(a: string, b: string): number {
  const pa = parseCompetencia(a as any)
  const pb = parseCompetencia(b as any)
  return (pb.year - pa.year) * 12 + (pb.month - pa.month)
}

export async function ensureCreditForCompetencia(_competencia: Competencia): Promise<void> {
  // Compras de cartão não precisam de "seed" por mês.
  return
}

export async function listCredit(): Promise<CreditPurchase[]> {
  const all = await creditRepo.list()
  // mais recente primeiro
  return all.sort((a, b) => b.dataCompra.localeCompare(a.dataCompra))
}

export async function createPurchase(input: Omit<CreditPurchase,'id'|'criadoEm'|'atualizadoEm'|'parcelaAtual'|'competenciaInicio'> & { competenciaAtual?: Competencia }): Promise<CreditPurchase> {
  const competenciaInicio = input.dataCompra.slice(0, 7) as Competencia
  const competenciaAtual = (input.competenciaAtual ?? (new Date().toISOString().slice(0,7) as Competencia))
  const diff = monthsDiffCompetencia(competenciaInicio, competenciaAtual)
  const parcelaAtual = Math.min(input.parcelasTotal, Math.max(1, diff + 1))

  const p: CreditPurchase = {
    id: uid('cc'),
    descricao: input.descricao.trim(),
    valorTotal: input.valorTotal,
    dataCompra: input.dataCompra,
    parcelasTotal: input.parcelasTotal,
    parcelaAtual,
    competenciaInicio,
    criadoEm: nowIso(),
    atualizadoEm: nowIso()
  }
  await creditRepo.upsert(p)
  return p
}

export async function updatePurchase(id: string, patch: Partial<Omit<CreditPurchase,'id'|'criadoEm'>>): Promise<void> {
  const found = await creditRepo.get(id)
  if (!found) return

  const dataCompra = (patch.dataCompra ?? found.dataCompra)
  const competenciaInicio = (dataCompra.slice(0,7) as Competencia)
  const parcelasTotal = (patch.parcelasTotal ?? found.parcelasTotal)

  const merged: CreditPurchase = {
    ...found,
    ...patch,
    dataCompra,
    competenciaInicio,
    parcelasTotal,
    // mantém parcelaAtual consistente (não passa do total)
    parcelaAtual: Math.min(patch.parcelaAtual ?? found.parcelaAtual, parcelasTotal),
    atualizadoEm: nowIso()
  }
  await creditRepo.upsert(merged)
}

export async function removePurchase(id: string): Promise<void> {
  await creditRepo.remove(id)
}

export function compraEstaNaCompetencia(p: CreditPurchase, competencia: Competencia): boolean {
  // aparece de competenciaInicio até competenciaInicio + (parcelasTotal-1)
  for (let i = 0; i < p.parcelasTotal; i++) {
    if (addMonthsCompetencia(p.competenciaInicio, i) === competencia) return true
  }
  return false
}

export type ParcelaView = {
  id: string
  descricao: string
  dataCompra: string
  parcelaAtual: number
  parcelasTotal: number
  valorParcela: number
  raw: CreditPurchase
}

export function parcelaDaCompetencia(p: CreditPurchase, competencia: Competencia): ParcelaView | null {
  for (let i = 0; i < p.parcelasTotal; i++) {
    if (addMonthsCompetencia(p.competenciaInicio, i) === competencia) {
      return {
        id: p.id,
        descricao: p.descricao,
        dataCompra: p.dataCompra,
        parcelaAtual: i + 1,
        parcelasTotal: p.parcelasTotal,
        valorParcela: p.valorTotal / p.parcelasTotal,
        raw: p
      }
    }
  }
  return null
}


// Compat: versão antiga chamava isso na virada do mês.
// Hoje a parcela é calculada dinamicamente por competência, então não precisa avançar nada.
export async function advanceCreditForCompetencia(_competencia: string): Promise<void> {
  return
}
