import React from 'react'
import type { Bill, Competencia } from '@/domain/types'
import { listBills, ensureBillsForCompetencia, setBillStatus } from '@/services/billsService'
import { getSavedCompetencia, saveCompetencia } from '@/services/competenciaStore'
import { totalsForCompetencia, vencendoEm2Dias, billsForCompetencia } from '@/services/dashboardService'
import { formatBRL } from '@/services/money'
import { listAssets, ensureAssetsForCompetencia, totalAssetsForCompetencia } from '@/services/assetsService'
import { listCredit, parcelaDaCompetencia } from '@/services/creditService'
import { getUserName, logout } from '@/services/authService'
import { PieChart } from '../components/PieChart'
import { CompetenciaPicker } from '../components/CompetenciaPicker'
import { Toast } from '../components/Toast'
import { dueDateForCompetencia } from '@/services/date'
import { settingsRepo } from '@/storage/repositories'
import { notify, requestNotificationPermission } from '@/services/notifications'
import { EmptyState } from '../components/EmptyState'

export default function DashboardPage() {
  const [competencia, setCompetencia] = React.useState<Competencia>(getSavedCompetencia())
  const [bills, setBills] = React.useState<Bill[]>([])
  const [assetsTotal, setAssetsTotal] = React.useState<number>(0)
  const [creditTotal, setCreditTotal] = React.useState<number>(0)
  const [userName, setUserName] = React.useState<string>('')
  const [toast, setToast] = React.useState<string>('')

  async function refresh() {
    await ensureBillsForCompetencia(competencia)
    await ensureAssetsForCompetencia(competencia)
    const [b, a, c] = await Promise.all([listBills(), listAssets(), listCredit()])
    setBills(b)
    setAssetsTotal(totalAssetsForCompetencia(a, competencia))
    const creditMes = c
      .map(p => parcelaDaCompetencia(p, competencia))
      .filter(Boolean)
      .reduce((s, x) => s + ((x as any).valorParcela || 0), 0)
    setCreditTotal(creditMes)

const name = await getUserName()
setUserName(name ?? '')
  }

  React.useEffect(()=>{
    saveCompetencia(competencia)
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competencia])

  const filtered = billsForCompetencia(bills, competencia)
  const totals = totalsForCompetencia(filtered, competencia)
  const passivos = totals.total + creditTotal
  const ativos = assetsTotal
  const saldo = ativos - passivos
  const soon = vencendoEm2Dias(filtered, competencia)

  // notificação: dispara quando existir algo vencendo em 2 dias e notificações ativas
  React.useEffect(()=>{
    ;(async ()=>{
      if (soon.length === 0) return
      const settings = await settingsRepo.get()
      if (!settings?.notificacoesAtivas) return
      // notificar só uma vez por sessão (simples)
      const key = `notified_${competencia}`
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
      notify('Contas vencendo em breve', `${soon.length} conta(s) vencendo em até 2 dias.`)
    })()
  }, [soon.length, competencia])

  async function enableNotifications(){
    const perm = await requestNotificationPermission()
    if (perm !== 'granted') {
      setToast('Sem permissão de notificação. Você ainda verá o aviso aqui no app.')
      return
    }
    const s = await settingsRepo.get()
    if (s) await settingsRepo.set({ ...s, notificacoesAtivas: true, atualizadoEm: new Date().toISOString() })
    setToast('Notificações ativadas ✅')
  }

  return (
    <>
      {toast && <Toast message={toast} onClose={()=>setToast('')} />}

      <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
        <div className="card" style={{padding:12, width:'100%', marginBottom:12}}>
          <div style={{display:'flex', justifyContent:'space-between', gap:10, alignItems:'center'}}>
            <div>
              <div className="h2">Olá{userName ? `, ${userName}` : ''} 👋</div>
              <div className="muted" style={{fontSize:12}}>Seu painel do mês</div>
            </div>
            <button className="btn" onClick={()=>{ logout(); window.location.href='/login' }}>Sair</button>
          </div>
        </div>

        <div>
          <div className="h1">Dashboard</div>
          <div className="muted">Visão geral da competência</div>
        </div>
        <CompetenciaPicker value={competencia} onChange={setCompetencia} />
      </div>

      <div style={{height:10}} />

      <div className="row">
  <div className="card col">
    <div className="h2">Ativos</div>
    <div className="kpi">{formatBRL(ativos)}</div>
    <div className="muted" style={{fontSize:12}}>Entradas do mês</div>
  </div>
  <div className="card col">
    <div className="h2">Passivos</div>
    <div className="kpi">{formatBRL(passivos)}</div>
    <div className="muted" style={{fontSize:12}}>Contas + cartão + pagamentos de empréstimo</div>
  </div>
  <div className="card col">
    <div className="h2">Saldo</div>
    <div className="kpi">{formatBRL(saldo)}</div>
    <div className="muted" style={{fontSize:12}}>Ativos - Passivos</div>
  </div>
</div>

<div style={{height:12}} />

<PieChart
        title="Gráfico do mês (Ativos x Passivos)"
        slices={[
          { label: 'Ativos', value: ativos, color: 'rgba(34,197,94,.75)' },
          { label: 'Passivos', value: passivos, color: 'rgba(239,68,68,.75)' },
        ]}
        centerLabel="Saldo"
        centerValue={saldo}
      />

<div style={{height:12}} />

      <div className="h1">Vencendo em 2 dias</div>
      <div className="muted" style={{marginTop:4}}>Contas pendentes com vencimento próximo.</div>
      <div style={{height:10}} />

      {soon.length === 0 ? (
        <EmptyState title="Nada vencendo em 2 dias 🎉" description="Quando faltar 2 dias (ou menos) para o vencimento, vai aparecer aqui." />
      ) : (
        <div className="list">
          {soon.map(({bill, dias})=>{
            const due = dueDateForCompetencia(competencia, bill.vencimentoDia)
            const color = dias < 0 ? 'danger' : (dias === 0 ? 'warn' : 'warn')
            return (
              <div key={bill.id} className="card">
                <div className="item">
                  <div className="item-main">
                    <div className="item-title">{bill.nome}</div>
                    <div className="item-sub">{bill.categoria} • vence em {due} • {dias < 0 ? `atrasado (${Math.abs(dias)}d)` : `faltam ${dias}d`}</div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
                    <span className={"pill " + color}>{formatBRL(bill.valor)}</span>
                    <div style={{display:'flex', gap:8}}>
                      <button className="btn small ok" onClick={async ()=>{ await setBillStatus(bill.id, competencia, 'PAGO'); refresh() }}>Marcar pago</button>
                      <button className="btn small" onClick={async ()=>{ await setBillStatus(bill.id, competencia, 'PENDENTE'); refresh() }}>Pendente</button>
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
