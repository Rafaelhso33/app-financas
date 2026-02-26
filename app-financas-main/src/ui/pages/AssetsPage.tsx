import React from 'react'
import type { Asset, Competencia } from '@/domain/types'
import { CompetenciaPicker } from '../components/CompetenciaPicker'
import { EmptyState } from '../components/EmptyState'
import { MoneyInput } from '../components/MoneyInput'
import { getSavedCompetencia, saveCompetencia } from '@/services/competenciaStore'
import { listAssets, ensureAssetsForCompetencia, createAsset, updateAssetMeta, removeAsset, setAssetValueForCompetencia, assetsForCompetencia } from '@/services/assetsService'
import { formatBRL } from '@/services/money'

type FormState = {
  id?: string
  nome: string
  categoria: string
  valor: number
  recorrente: boolean
  observacoes: string
}

const emptyForm: FormState = {
  nome: '',
  categoria: 'Outros',
  valor: 0,
  recorrente: true,
  observacoes: ''
}

export default function AssetsPage() {
  const [competencia, setCompetencia] = React.useState<Competencia>(getSavedCompetencia())
  const [all, setAll] = React.useState<Asset[]>([])
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [errors, setErrors] = React.useState<Record<string,string>>({})

  async function refresh(){
    await ensureAssetsForCompetencia(competencia)
    setAll(await listAssets())
  }

  React.useEffect(()=>{
    saveCompetencia(competencia)
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competencia])

  const rows = assetsForCompetencia(all, competencia)
  const total = rows.reduce((s,x)=> s + (x.valor||0), 0)

  function validate(f: FormState){
    const e: Record<string,string> = {}
    if (!f.nome.trim()) e.nome = 'Nome é obrigatório'
    if (!f.categoria.trim()) e.categoria = 'Categoria é obrigatória'
    if (!(f.valor > 0)) e.valor = 'Valor precisa ser maior que 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(){
    if (!validate(form)) return
    if (!form.id) {
      await createAsset({
        nome: form.nome,
        categoria: form.categoria,
        valor: form.valor,
        recorrente: form.recorrente,
        observacoes: form.observacoes,
        competencia
      })
    } else {
      await updateAssetMeta(form.id, {
        nome: form.nome,
        categoria: form.categoria,
        valor: form.valor,
        recorrente: form.recorrente,
        observacoes: form.observacoes
      })
      // também atualiza valor do mês atual para refletir valor editado (conveniência)
      await setAssetValueForCompetencia(form.id, competencia, form.valor)
    }
    setForm(emptyForm)
    setErrors({})
    refresh()
  }

  function edit(a: Asset){
    const v = a.valorPorMes?.[competencia] ?? a.valor
    setForm({
      id: a.id,
      nome: a.nome,
      categoria: a.categoria,
      valor: v,
      recorrente: a.recorrente,
      observacoes: a.observacoes ?? ''
    })
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  return (
    <>
      <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <div className="h1">Ativos</div>
          <div className="muted">Entradas (salário, adiantamento, poupança...)</div>
        </div>
        <CompetenciaPicker value={competencia} onChange={setCompetencia} />
      </div>

      <div style={{height:10}} />

      <div className="row">
        <div className="card col">
          <div className="h2">Total de ativos (mês)</div>
          <div className="kpi">{formatBRL(total)}</div>
          <div className="muted" style={{fontSize:12}}>Soma dos ativos na competência {competencia}</div>
        </div>
        <div className="card col">
          <div className="h2">Como funciona</div>
          <div className="muted" style={{fontSize:13}}>
            Ativos recorrentes aparecem automaticamente todo mês. Você pode ajustar o valor mês a mês.
          </div>
        </div>
      </div>

      <div style={{height:12}} />

      <div className="card">
        <div className="h1">{form.id ? 'Editar ativo' : 'Novo ativo'}</div>
        <div className="grid2">
          <div>
            <label>Nome</label>
            <input className="input" value={form.nome} onChange={e=>setForm(f=>({...f, nome:e.target.value}))} placeholder="Ex: Salário" />
            {errors.nome && <div className="muted" style={{color:'var(--danger)', fontSize:12}}>{errors.nome}</div>}
          </div>
          <div>
            <label>Categoria</label>
            <input className="input" value={form.categoria} onChange={e=>setForm(f=>({...f, categoria:e.target.value}))} placeholder="Ex: Adiantamento" />
            {errors.categoria && <div className="muted" style={{color:'var(--danger)', fontSize:12}}>{errors.categoria}</div>}
          </div>
          <div>
            <label>Valor (este mês)</label>
            <MoneyInput value={form.valor} onChange={(v)=>setForm(f=>({...f, valor:v}))} />
            {errors.valor && <div className="muted" style={{color:'var(--danger)', fontSize:12}}>{errors.valor}</div>}
          </div>
          <div>
            <label>Recorrente?</label>
            <select className="input" value={form.recorrente ? 'SIM':'NAO'} onChange={e=>setForm(f=>({...f, recorrente: e.target.value==='SIM'}))}>
              <option value="SIM">Sim (aparece todo mês)</option>
              <option value="NAO">Não (só no mês de criação)</option>
            </select>
          </div>
          <div>
            <label>Observações</label>
            <input className="input" value={form.observacoes} onChange={e=>setForm(f=>({...f, observacoes:e.target.value}))} placeholder="Opcional" />
          </div>
        </div>
        <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
          <button className="btn primary" onClick={submit}>{form.id ? 'Salvar' : 'Adicionar'}</button>
          {form.id && <button className="btn" onClick={()=>{ setForm(emptyForm); setErrors({}) }}>Cancelar</button>}
        </div>
      </div>

      <div style={{height:12}} />

      {rows.length === 0 ? (
        <EmptyState title="Sem ativos aqui ainda" description="Crie um ativo acima e ele vai aparecer nesta lista." />
      ) : (
        <div className="list">
          {rows.map(({asset, valor})=>(
            <div key={asset.id} className="card">
              <div className="item">
                <div className="item-main">
                  <div className="item-title">{asset.nome}</div>
                  <div className="item-sub">{asset.categoria} • {asset.recorrente ? 'recorrente' : 'não recorrente'} • competência {competencia}</div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
                  <span className="pill ok">{formatBRL(valor)}</span>
                  <div style={{display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end'}}>
                    <button className="btn small" onClick={()=>edit(asset)}>Editar</button>
                    <button className="btn small danger" onClick={async ()=>{ if(confirm('Excluir ativo?')){ await removeAsset(asset.id); refresh() } }}>Excluir</button>
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
