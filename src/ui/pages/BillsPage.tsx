import React from 'react'
import type { Bill, Competencia } from '@/domain/types'
import { CompetenciaPicker } from '../components/CompetenciaPicker'
import { EmptyState } from '../components/EmptyState'
import { MoneyInput } from '../components/MoneyInput'
import { getSavedCompetencia, saveCompetencia } from '@/services/competenciaStore'
import { listBills, ensureBillsForCompetencia, createBill, updateBillMeta, removeBill, setBillStatus } from '@/services/billsService'
import { billsForCompetencia } from '@/services/dashboardService'
import { formatBRL } from '@/services/money'
import { dueDateForCompetencia, daysUntilDue } from '@/services/date'

type FormState = {
  id?: string
  nome: string
  categoria: string
  valor: number
  vencimentoDia: number
  recorrente: boolean
  observacoes: string
}

const emptyForm: FormState = {
  nome: '',
  categoria: 'Geral',
  valor: 0,
  vencimentoDia: 10,
  recorrente: true,
  observacoes: ''
}

export default function BillsPage() {
  const [competencia, setCompetencia] = React.useState<Competencia>(getSavedCompetencia())
  const [all, setAll] = React.useState<Bill[]>([])
  const [statusFilter, setStatusFilter] = React.useState<'TODOS'|'PAGO'|'PENDENTE'>('TODOS')
  const [catFilter, setCatFilter] = React.useState<string>('')

  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [errors, setErrors] = React.useState<Record<string,string>>({})

  async function refresh(){
    await ensureBillsForCompetencia(competencia)
    setAll(await listBills())
  }

  React.useEffect(()=>{
    saveCompetencia(competencia)
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competencia])

  const bills = billsForCompetencia(all, competencia)
const totals = bills.reduce((acc, b) => {
  const st = b.statusPorMes?.[competencia]?.status
  if (st === 'PAGO') acc.paid += b.valor
  else acc.pending += b.valor
  return acc
}, { paid: 0, pending: 0 })
  const categorias = Array.from(new Set(all.map(b=>b.categoria))).sort()

  const filtered = bills.filter(b=>{
    const st = b.statusPorMes?.[competencia]?.status
    if (statusFilter !== 'TODOS' && st !== statusFilter) return false
    if (catFilter && b.categoria !== catFilter) return false
    return true
  })

  function validate(f: FormState){
    const e: Record<string,string> = {}
    if (!f.nome.trim()) e.nome = 'Nome é obrigatório'
    if (!f.categoria.trim()) e.categoria = 'Categoria é obrigatória'
    if (!(f.valor > 0)) e.valor = 'Valor precisa ser maior que 0'
    if (!(f.vencimentoDia >= 1 && f.vencimentoDia <= 31)) e.vencimentoDia = 'Dia deve ser 1 a 31'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(){
    if (!validate(form)) return
    if (!form.id) {
      await createBill({
        nome: form.nome,
        categoria: form.categoria,
        valor: form.valor,
        vencimentoDia: form.vencimentoDia,
        recorrente: form.recorrente,
        observacoes: form.observacoes,
        competencia
      })
    } else {
      await updateBillMeta(form.id, {
        nome: form.nome,
        categoria: form.categoria,
        valor: form.valor,
        vencimentoDia: form.vencimentoDia,
        recorrente: form.recorrente,
        observacoes: form.observacoes
      })
    }
    setForm(emptyForm)
    setErrors({})
    refresh()
  }

  function editBill(b: Bill){
    setForm({
      id: b.id,
      nome: b.nome,
      categoria: b.categoria,
      valor: b.valor,
      vencimentoDia: b.vencimentoDia,
      recorrente: b.recorrente,
      observacoes: b.observacoes ?? ''
    })
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  return (
    <>
      <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <div className="h1">Contas</div>
          <div className="muted">CRUD + status por competência</div>
        </div>
        <CompetenciaPicker value={competencia} onChange={setCompetencia} />
      </div>

      <div style={{height:10}} />

      <div className="card">
        <div className="h1">{form.id ? 'Editar conta' : 'Nova conta'}</div>
        <div className="grid2">
          <div>
            <label>Nome</label>
            <input className="input" value={form.nome} onChange={e=>setForm(f=>({...f, nome:e.target.value}))} placeholder="Ex: Aluguel" />
            {errors.nome && <div className="muted" style={{color:'var(--danger)', fontSize:12}}>{errors.nome}</div>}
          </div>
          <div>
            <label>Categoria</label>
            <input className="input" value={form.categoria} onChange={e=>setForm(f=>({...f, categoria:e.target.value}))} placeholder="Ex: Casa" />
            {errors.categoria && <div className="muted" style={{color:'var(--danger)', fontSize:12}}>{errors.categoria}</div>}
          </div>
          <div>
            <label>Valor</label>
            <MoneyInput value={form.valor} onChange={(v)=>setForm(f=>({...f, valor:v}))} />
            {errors.valor && <div className="muted" style={{color:'var(--danger)', fontSize:12}}>{errors.valor}</div>}
          </div>
          <div>
            <label>Vencimento (dia 1-31)</label>
            <input className="input" type="number" min={1} max={31} value={form.vencimentoDia}
              onChange={e=>setForm(f=>({...f, vencimentoDia: Number(e.target.value)}))} />
            {errors.vencimentoDia && <div className="muted" style={{color:'var(--danger)', fontSize:12}}>{errors.vencimentoDia}</div>}
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
<div style={{height:10}} />

<div className="row">
  <div className="card col">
    <div className="h2">Total pago</div>
    <div className="kpi">{formatBRL(totals.paid)}</div>
    <div className="muted" style={{fontSize:12}}>Competência {competencia}</div>
  </div>
  <div className="card col">
    <div className="h2">Total pendente</div>
    <div className="kpi">{formatBRL(totals.pending)}</div>
    <div className="muted" style={{fontSize:12}}>Competência {competencia}</div>
  </div>
</div>

      <div style={{height:12}} />

      <div className="card">
        <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <div className="h1">Lista</div>
            <div className="muted" style={{fontSize:12}}>Filtre por status e categoria</div>
          </div>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <select className="input" style={{width:160}} value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)}>
              <option value="TODOS">Todos</option>
              <option value="PAGO">Pago</option>
              <option value="PENDENTE">Pendente</option>
            </select>
            <select className="input" style={{width:180}} value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
              <option value="">Todas categorias</option>
              {categorias.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{height:10}} />

      {filtered.length === 0 ? (
        <EmptyState title="Sem contas aqui ainda" description="Crie uma conta acima e ela vai aparecer nesta lista." />
      ) : (
        <div className="list">
          {filtered.map(b=>{
            const st = b.statusPorMes?.[competencia]?.status
            const due = dueDateForCompetencia(competencia, b.vencimentoDia)
            const dias = daysUntilDue(competencia, b.vencimentoDia, new Date())
            const warn = st === 'PENDENTE' && dias <= 2
            return (
              <div key={b.id} className="card" style={warn ? {borderColor:'rgba(245,158,11,.6)'} : undefined}>
                <div className="item">
                  <div className="item-main" style={{ flex: 1, minWidth: 0 }}>
                    <div className="item-title" style={{ whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.3 }}>{b.nome}</div>
                    <div className="item-sub">
                      {b.categoria} • vence em {due} • {b.recorrente ? 'recorrente' : 'não recorrente'}
                      {warn && <span> • <b style={{color:'var(--warn)'}}>vencendo em {Math.max(dias,0)} dia(s)</b></span>}
                    </div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
                    <span className={"pill " + (st === 'PAGO' ? 'ok' : 'warn')}>{formatBRL(b.valor)}</span>
                    <div style={{display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end'}}>
                      <button className="btn small ok" onClick={async ()=>{ await setBillStatus(b.id, competencia, 'PAGO'); refresh() }}>PAGO</button>
                      <button className="btn small" onClick={async ()=>{ await setBillStatus(b.id, competencia, 'PENDENTE'); refresh() }}>PENDENTE</button>
                      <button className="btn small" onClick={()=>editBill(b)}>Editar</button>
                      <button className="btn small danger" onClick={async ()=>{ if(confirm('Excluir conta?')){ await removeBill(b.id); refresh() } }}>Excluir</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
