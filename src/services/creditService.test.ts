import { describe, it, expect } from 'vitest'
import { parcelaDaCompetencia } from './creditService'
import type { CreditPurchase } from '@/domain/types'

describe('parcelas cartão', ()=>{
  it('calcula parcela correta por competência', ()=>{
    const p: CreditPurchase = {
      id:'x', descricao:'Teste', valorTotal: 300, dataCompra:'2026-02-01',
      parcelasTotal: 3, parcelaAtual:1, competenciaInicio:'2026-02',
      criadoEm:'', atualizadoEm:''
    }
    expect(parcelaDaCompetencia(p, '2026-02')?.parcelaAtual).toBe(1)
    expect(parcelaDaCompetencia(p, '2026-03')?.parcelaAtual).toBe(2)
    expect(parcelaDaCompetencia(p, '2026-04')?.parcelaAtual).toBe(3)
    expect(parcelaDaCompetencia(p, '2026-05')).toBe(null)
  })
})
