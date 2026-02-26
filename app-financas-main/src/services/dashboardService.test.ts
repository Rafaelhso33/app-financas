import { describe, it, expect } from 'vitest'
import { vencendoEm2Dias } from './dashboardService'
import type { Bill } from '@/domain/types'

describe('dashboard - vencendo em 2 dias', ()=>{
  it('filtra somente pendentes e <=2 dias', ()=>{
    const bills: Bill[] = [
      {
        id:'1', nome:'A', categoria:'Geral', valor:10, vencimentoDia:10, recorrente:true,
        observacoes:'', criadoEm:'', atualizadoEm:'',
        statusPorMes: { '2026-03': { status:'PENDENTE' } }
      },
      {
        id:'2', nome:'B', categoria:'Geral', valor:10, vencimentoDia:20, recorrente:true,
        observacoes:'', criadoEm:'', atualizadoEm:'',
        statusPorMes: { '2026-03': { status:'PENDENTE' } }
      },
      {
        id:'3', nome:'C', categoria:'Geral', valor:10, vencimentoDia:10, recorrente:true,
        observacoes:'', criadoEm:'', atualizadoEm:'',
        statusPorMes: { '2026-03': { status:'PAGO', pagoEm:'2026-03-01' } }
      },
    ]
    const today = new Date('2026-03-08T10:00:00Z')
    const soon = vencendoEm2Dias(bills, '2026-03', today)
    expect(soon.map(x=>x.bill.id)).toEqual(['1'])
  })
})
