import React from 'react'
import type { Competencia, CreditPurchase } from '@/domain/types'
import { CompetenciaPicker } from '../components/CompetenciaPicker'
import { EmptyState } from '../components/EmptyState'
import { MoneyInput } from '../components/MoneyInput'
import { getSavedCompetencia, saveCompetencia } from '@/services/competenciaStore'
import { listCredit, ensureCreditForCompetencia, createPurchase, updatePurchase, removePurchase, parcelaDaCompetencia } from '@/services/creditService'
import { formatBRL } from '@/services/money'

type FormState = {
  id?: string
  descricao: string
  valorTotal: number
  dataCompra: string
  parcelasTotal: number
}

const todayISO = () => new Date().toISOString().slice(0, 10)

const emptyForm: FormState = {
  descricao: '',
  valorTotal: 0,
  dataCompra: todayISO(),
  parcelasTotal: 1
}

export default function CreditPage() {
  const [competencia, setCompetencia] = React.useState<Competencia>(getSavedCompetencia())
  const [all, setAll] = React.useState<CreditPurchase[]>([])
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [errors, setErrors] = React.useState<Record<string,string>>({})

  async function refresh(){
    await ensureCreditForCompetencia(competencia)
    setAll(await listCredit())
  }

  React.useEffect(()=>{
    saveCompetencia(competencia)
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competencia])

  const rows = all
    .map(p => parcelaDaCompetencia(p, competencia))
    .filter(Boolean) as Array<ReturnType<typeof parcelaDaCompetencia>>

  const totalMes = rows.reduce((s, x:any)=> s + (x?.valorParcela || 0), 0)

  function validate(f: FormState){
    const e: Record<string,string> = {}
    if (!f.descricao.trim()) e.descricao = 'Descrição é obrigatória'
    if (!(f.valorTotal > 0)) e.valorTotal = 'Valor precisa ser maior que 0'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.dataCompra)) e.dataCompra = 'Data inválida'
    if (!(f.parcelasTotal >= 1 && f.parcelasTotal <= 120)) e.parcelasTotal = 'Parcelas deve ser 1..120'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(){
    try {
      if (!validate(form)) return

      if (!form.id) {
        await createPurchase({
          descricao: form.descricao,
          valorTotal: form.valorTotal,
          dataCompra: form.dataCompra,
          parcelasTotal: form.parcelasTotal,
          competenciaAtual: competencia
        } as any)
      } else {
        await updatePurchase(form.id, {
          descricao: form.descricao,
          valorTotal: form.valorTotal,
          dataCompra: form.dataCompra,
          parcelasTotal: form.parcelasTotal
        })
      }

      setForm({ ...emptyForm, dataCompra: todayISO() })
      setErrors({})
      await refresh()
    } catch (e:any) {
      console.error(e)
      alert('Erro ao salvar compra: ' + (e?.message ?? String(e)))
    }
  }

  function edit(p: CreditPurchase){
    setForm({
      id: p.id,
      descricao: p.descricao,
      valorTotal: p.valorTotal,
      dataCompra: p.dataCompra,
      parcelasTotal: p.parcelasTotal
    })
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  return (
    <>
      <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <div className="h1">Cartão de Crédito</div>
          <div className="muted">Compras parceladas por competência (mês)</div>
        </div>
        <CompetenciaPicker value={competencia} onChange={setCompetencia} />
      </div>

      <div style={{height:10}} />

      <div className="row">
        <div className="card col">
          <div className="h2">Total do cartão (mês)</div>
          <div className="kpi">{formatBRL(totalMes)}</div>
          <div className="muted" style={{fontSize:12}}>Competência {competencia}</div>
        </div>
        <div className="card col">
          <div className="h2">Como calcula a parcela</div>
          <div className="muted" style={{fontSize:13}}>
            Pelo mês da <b>data da compra</b> + mês selecionado. Ex: compra 11 e mês 02 ⇒ parcela 3/total.
          </div>
        </div>
      </div>

      <div style={{height:12}} />

      <div className="card">
        <div className="h1">{form.id ? 'Editar compra' : 'Nova compra'}</div>
        <div className="grid2">
          <div>
            <label>Descrição</label>
            <input className="input" value={form.descricao} onChange={e=>setForm(f=>({...f, descricao:e.target.value}))} placeholder="Ex: Mercado" />
            {errors.descricao && <div className="muted" style={{color:'var(--danger)', fontSize:12}}>{errors.descricao}</div>}
          </div>

          <div>
            <label>Valor total</label>
            <MoneyInput value={form.valorTotal} onChange={(v)=>setForm(f=>({...f, valorTotal:v}))} />
            {errors.valorTotal && <div className="muted" style={{color:'var(--danger)', fontSize:12}}>{errors.valorTotal}</div>}
          </div>

          <div>
            <label>Data da compra</label>
            <input className="input" type="date" value={form.dataCompra} onChange={e=>setForm(f=>({...f, dataCompra:e.target.value}))} />
            {errors.dataCompra && <div className="muted" style={{color:'var(--danger)', fontSize:12}}>{errors.dataCompra}</div>}
          </div>

          <div>
            <label>Parcelas</label>
            <input className="input" type="number" min={1} max={120} value={form.parcelasTotal} onChange={e=>setForm(f=>({...f, parcelasTotal: Number(e.target.value)}))} />
            {errors.parcelasTotal && <div className="muted" style={{color:'var(--danger)', fontSize:12}}>{errors.parcelasTotal}</div>}
          </div>
        </div>

        <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
          <button className="btn primary" onClick={submit}>{form.id ? 'Salvar' : 'Adicionar'}</button>
          {form.id && <button className="btn" onClick={()=>{ setForm({ ...emptyForm, dataCompra: todayISO() }); setErrors({}) }}>Cancelar</button>}
        </div>
      </div>

      <div style={{height:12}} />

      {rows.length === 0 ? (
        <EmptyState title="Sem compras neste mês" description="Adicione uma compra acima. Compras parceladas aparecem no mês correspondente." />
      ) : (
        <div className="list">
          {rows.map((x:any)=>(
            <div key={x.id} className="card">
              <div className="item">
                <div className="item-main">
                  <div className="item-title">{x.descricao}</div>
                  <div className="item-sub">
                    compra: {x.dataCompra} • parcela {x.parcelaAtual}/{x.parcelasTotal}
                  </div>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
                  <span className="pill warn">{formatBRL(x.valorParcela)}</span>
                  <div style={{display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end'}}>
                    <button className="btn small" onClick={()=>edit(x.raw)}>Editar</button>
                    <button className="btn small danger" onClick={async ()=>{
                      if (confirm('Excluir compra?')) { await removePurchase(x.id); refresh() }
                    }}>Excluir</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
