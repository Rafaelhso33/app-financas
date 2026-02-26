import { Competencia } from '@/domain/types'
import { getCompetencia } from './date'

const KEY = 'finance_pwa_competencia'

export function getSavedCompetencia(): Competencia {
  const v = localStorage.getItem(KEY)
  return (v && /^\d{4}-\d{2}$/.test(v)) ? (v as Competencia) : getCompetencia()
}

export function saveCompetencia(c: Competencia) {
  localStorage.setItem(KEY, c)
}
