import type { Asset, Competencia } from '@/domain/types'
import { assetsRepo } from '@/storage/repositories'
import { nowIso, uid } from '@/domain/ids'
import { getCompetencia } from './date'

export async function listAssets(): Promise<Asset[]> {
  const all = await assetsRepo.list()
  return all.sort((a,b)=> a.nome.localeCompare(b.nome))
}

export async function createAsset(input: Omit<Asset,'id'|'criadoEm'|'atualizadoEm'|'valorPorMes'> & { competencia?: Competencia }): Promise<Asset> {
  const competencia = input.competencia ?? getCompetencia()
  const a: Asset = {
    id: uid('asset'),
    nome: input.nome.trim(),
    categoria: input.categoria.trim() || 'Outros',
    valor: input.valor,
    recorrente: input.recorrente,
    observacoes: input.observacoes?.trim(),
    criadoEm: nowIso(),
    atualizadoEm: nowIso(),
    valorPorMes: { [competencia]: input.valor }
  }
  await assetsRepo.upsert(a)
  return a
}

export async function updateAssetMeta(id: string, patch: Partial<Pick<Asset,'nome'|'categoria'|'valor'|'recorrente'|'observacoes'>>): Promise<void> {
  const a = await assetsRepo.get(id)
  if (!a) return
  const updated: Asset = { ...a, ...patch, atualizadoEm: nowIso() }
  await assetsRepo.upsert(updated)
}

export async function setAssetValueForCompetencia(id: string, competencia: Competencia, valor: number): Promise<void> {
  const a = await assetsRepo.get(id)
  if (!a) return
  const updated: Asset = {
    ...a,
    atualizadoEm: nowIso(),
    valorPorMes: { ...a.valorPorMes, [competencia]: valor }
  }
  await assetsRepo.upsert(updated)
}

export async function removeAsset(id: string): Promise<void> {
  await assetsRepo.remove(id)
}

export async function ensureAssetsForCompetencia(competencia: Competencia): Promise<void> {
  // ativos recorrentes devem existir (valorPorMes) em todo mês
  const all = await assetsRepo.list()
  for (const a of all) {
    if (!a.recorrente) continue
    if (a.valorPorMes?.[competencia] === undefined) {
      const updated: Asset = {
        ...a,
        atualizadoEm: nowIso(),
        valorPorMes: { ...a.valorPorMes, [competencia]: a.valor }
      }
      await assetsRepo.upsert(updated)
    }
  }
}

export function assetsForCompetencia(all: Asset[], competencia: Competencia): Array<{ asset: Asset; valor: number }> {
  return all
    .map(a => {
      const has = a.valorPorMes?.[competencia] !== undefined
      if (a.recorrente) return { asset: a, valor: a.valorPorMes?.[competencia] ?? a.valor }
      if (!has) return null
      return { asset: a, valor: a.valorPorMes[competencia] }
    })
    .filter(Boolean) as any
}

export function totalAssetsForCompetencia(all: Asset[], competencia: Competencia): number {
  return assetsForCompetencia(all, competencia).reduce((s,x)=> s + (x.valor || 0), 0)
}
