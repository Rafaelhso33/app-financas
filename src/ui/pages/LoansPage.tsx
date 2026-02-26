import React from 'react'
import type { Loan } from '@/domain/types'
import { EmptyState } from '../components/EmptyState'
import { MoneyInput } from '../components/MoneyInput'
import { listLoans, createLoan, updateLoan, removeLoan, addPayment, removePayment, updatePayment, loanTotals } from '@/services/loansService'
import { formatBRL } from '@/services/money'

type LoanForm = {
  id?: string
  descricao: string
  valorEmprestimo: number
  dataInicio: string
}

export default function LoansPage() {
  const [all, setAll] = React.useState<Loan[]>([])
  const [expanded, setExpanded] = React.useState<string>('')

  const [form, setForm] = React.useState<LoanForm>({
    descricao: '',
    valorEmprestimo: 0,
    dataInicio: new Date().toISOString().slice(0,10)
  })
  const [errors, setErrors] = React.useState<Record<string,string>>({})

  async function refresh(){ setAll(await listLoans()) }
  React.useEffect(()=>{ refresh() }, [])

  const dashboard = React.useMemo(() => {
    const totals = all.map(loanTotals)
    const totalEmprestimos = all.reduce((acc, l) => acc + (l.valorEmprestimo ?? 0), 0)
    const totalPago = totals.reduce((acc, t) => acc + (t.valorPago ?? 0), 0)
    const totalFalta = totals.reduce((acc, t) => acc + (t.saldoDevedor ?? 0), 0)
    return { totalEmprestimos, totalPago, totalFalta }
  }, [all])

  function validate(f: LoanForm){
    const e: Record<string,string> = {}
    if (!f.descricao.trim()) e.descricao = 'Descrição é obrigatória'
    if (!(f.valorEmprestimo > 0)) e.valorEmprestimo = 'Valor precisa ser maior que 0'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.dataInicio)) e.dataInicio = 'Data inválida'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(){
    if (!validate(form)) return
    if (!form.id) {
      await createLoan({ descricao: form.descricao, valorEmprestimo: form.valorEmprestimo, dataInicio: form.dataInicio })
    } else {
      await updateLoan(form.id, { descricao: form.descricao, valorEmprestimo: form.valorEmprestimo, dataInicio: form.dataInicio })
    }
    setForm({ descricao:'', valorEmprestimo:0, dataInicio:new Date().toISOString().slice(0,10) })
    setErrors({})
    refresh()
  }

  function edit(l: Loan){
    setForm({ id:l.id, descricao:l.descricao, valorEmprestimo:l.valorEmprestimo, dataInicio:l.dataInicio })
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  return (
    <>
      <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <div className="h1">Empréstimos</div>
          <div className="muted">Pagamentos + saldo automático</div>
        </div>
      </div>

      <div style={{height:10}} />

      <div className="card">
        <div className="h1">{form.id ? 'Editar empréstimo' : 'Novo empréstimo'}</div>
        <div className="grid2">
          <div>
            <label>Descrição</label>
            <input className="input" value={form.descricao} onChange={e=>setForm(f=>({...f, descricao:e.target.value}))} placeholder="Ex: Empréstimo carro" />
            {errors.descricao && <div className="muted" style={{color:'var(--danger)', fontSize:12}}>{errors.descricao}</div>}
          </div>
          <div>
            <label>Valor do empréstimo</label>
            <MoneyInput value={form.valorEmprestimo} onChange={(v)=>setForm(f=>({...f, valorEmprestimo:v}))} />
            {errors.valorEmprestimo && <div className="muted" style={{color:'var(--danger)', fontSize:12}}>{errors.valorEmprestimo}</div>}
          </div>
          <div>
            <label>Data início</label>
            <input className="input" type="date" value={form.dataInicio} onChange={e=>setForm(f=>({...f, dataInicio:e.target.value}))} />
            {errors.dataInicio && <div className="muted" style={{color:'var(--danger)', fontSize:12}}>{errors.dataInicio}</div>}
          </div>
        </div>
        <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
          <button className="btn primary" onClick={submit}>{form.id ? 'Salvar' : 'Adicionar'}</button>
          {form.id && <button className="btn" onClick={()=>{ setForm({descricao:'',valorEmprestimo:0,dataInicio:new Date().toISOString().slice(0,10)}); setErrors({}) }}>Cancelar</button>}
        </div>
      </div>

      <div style={{height:12}} />

      {all.length > 0 && (
        <div className="grid3" style={{marginBottom:12}}>
          <div className="card">
            <div className="muted">Total emprestado</div>
            <div className="h1">{formatBRL(dashboard.totalEmprestimos)}</div>
          </div>
          <div className="card">
            <div className="muted">Já pagou</div>
            <div className="h1" style={{color:'var(--ok)'}}>{formatBRL(dashboard.totalPago)}</div>
          </div>
          <div className="card">
            <div className="muted">Ainda falta</div>
            <div className="h1" style={{color:'var(--warn)'}}>{formatBRL(dashboard.totalFalta)}</div>
          </div>
        </div>
      )}

      {all.length === 0 ? (
        <EmptyState title="Sem empréstimos" description="Crie um empréstimo para controlar pagamentos e saldo." />
      ) : (
        <div className="list">
          {all.map(l=>{
            const t = loanTotals(l)
            const isOpen = expanded === l.id
            return (
              <div key={l.id} className="card">
                <div className="item">
                  <div className="item-main">
                    <div className="item-title">{l.descricao}</div>
                    <div className="item-sub">Início: {l.dataInicio}</div>
                    <div style={{height:10}} />
                    <div className="progress" aria-label="Progresso">
                      <div style={{width: `${(t.progresso*100).toFixed(0)}%`}} />
                    </div>
                    <div className="muted" style={{fontSize:12, marginTop:6}}>
                      Pago: <b>{formatBRL(t.valorPago)}</b> • Falta: <b>{formatBRL(t.saldoDevedor)}</b> • Total: {formatBRL(l.valorEmprestimo)}
                    </div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
                    <button className="btn small" onClick={()=> setExpanded(isOpen ? '' : l.id)}>{isOpen ? 'Fechar' : 'Detalhes'}</button>
                    <button className="btn small" onClick={()=>edit(l)}>Editar</button>
                    <button className="btn small danger" onClick={async ()=>{ if(confirm('Excluir empréstimo?')){ await removeLoan(l.id); refresh() } }}>Excluir</button>
                  </div>
                </div>

                {isOpen && (
                  <>
                    <hr />
                    <LoanPayments loan={l} onChange={refresh} />
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

function LoanPayments(props: { loan: Loan; onChange: ()=>void }) {
  const [data, setData] = React.useState(new Date().toISOString().slice(0,10))
  const [valor, setValor] = React.useState(0)

  async function add(){
    if (!data || !(valor > 0)) return
    await addPayment(props.loan.id, data, valor)
    setValor(0)
    props.onChange()
  }

  return (
    <div>
      <div className="h1">Pagamentos</div>
      <div className="muted" style={{fontSize:12}}>Adicione/remova pagamentos. Saldo recalcula automaticamente.</div>

      <div style={{height:10}} />

      <div className="grid2">
        <div>
          <label>Data</label>
          <input className="input" type="date" value={data} onChange={e=>setData(e.target.value)} />
        </div>
        <div>
          <label>Valor</label>
          <MoneyInput value={valor} onChange={setValor} />
        </div>
      </div>

      <div style={{display:'flex', gap:8, marginTop:10}}>
        <button className="btn ok" onClick={add}>Adicionar pagamento</button>
      </div>

      <div style={{height:10}} />

      {props.loan.pagamentos.length === 0 ? (
        <EmptyState title="Nenhum pagamento ainda" description="Adicione o primeiro pagamento acima." />
      ) : (
        <div className="list">
          {props.loan.pagamentos.map(p=>(
            <div key={p.id} className="card" style={{background:'rgba(255,255,255,.02)'}}>
              <div className="item">
                <div className="item-main">
                  <div className="item-title">{formatBRL(p.valor)}</div>
                  <div className="item-sub">{p.data}</div>
                </div>
                <div style={{display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end'}}>
                  <button className="btn small" onClick={async ()=>{
                    const nv = prompt('Novo valor (ex: 123,45)', String(p.valor).replace('.',','))
                    if (nv === null) return
                    const n = Number(nv.replace('.','').replace(',','.'))
                    if (!Number.isFinite(n) || n<=0) return
                    await updatePayment(props.loan.id, p.id, { valor: n })
                    props.onChange()
                  }}>Editar valor</button>
                  <button className="btn small danger" onClick={async ()=>{
                    if (confirm('Remover pagamento?')) {
                      await removePayment(props.loan.id, p.id)
                      props.onChange()
                    }
                  }}>Remover</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
