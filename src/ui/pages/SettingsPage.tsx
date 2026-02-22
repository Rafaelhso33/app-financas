import React from 'react'
import { exportAll, importAll, wipeAll } from '@/storage/db'
import { setupAuth } from '@/services/authService'
import { settingsRepo } from '@/storage/repositories'
import { requestNotificationPermission } from '@/services/notifications'

export default function SettingsPage() {
  const [notifs, setNotifs] = React.useState(false)
  const [fileText, setFileText] = React.useState('')

  const [authName, setAuthName] = React.useState('')
  const [authPass, setAuthPass] = React.useState('')
  const [authEnabled, setAuthEnabled] = React.useState(false)
  const [authMsg, setAuthMsg] = React.useState('')

  React.useEffect(()=>{
    ;(async ()=>{
      const s = await settingsRepo.get()
      setNotifs(!!s?.notificacoesAtivas)
      setAuthName(s?.userName ?? '')
      setAuthEnabled(!!s?.authEnabled && !!s?.passwordHash)
    })()
  }, [])

  async function toggleNotifs(){
    const perm = await requestNotificationPermission()
    const active = perm === 'granted'
    const s = await settingsRepo.get()
    if (s) await settingsRepo.set({ ...s, notificacoesAtivas: active, atualizadoEm: new Date().toISOString() } as any)
    setNotifs(active)
    alert(active ? 'Notificações ativadas ✅' : 'Notificações desativadas')
  }

  async function doExport(){
    const json = await exportAll()
    setFileText(JSON.stringify(json, null, 2))
    alert('Export gerado. Copie o texto ou salve em um arquivo.')
  }

  async function doImport(){
    try {
      const obj = JSON.parse(fileText)
      await importAll(obj)
      alert('Import concluído ✅')
      window.location.reload()
    } catch (e:any) {
      alert('JSON inválido: ' + (e?.message ?? String(e)))
    }
  }

  async function doWipe(){
    if (!confirm('Apagar TODOS os dados locais?')) return
    await wipeAll()
    alert('Dados apagados.')
    window.location.reload()
  }

  async function saveAuth(){
    setAuthMsg('')
    if (!authName.trim()) { setAuthMsg('Digite seu nome'); return }
    if (authPass.length < 4) { setAuthMsg('Senha precisa ter pelo menos 4'); return }
    await setupAuth(authName, authPass)
    setAuthPass('')
    setAuthEnabled(true)
    setAuthMsg('Login configurado ✅')
  }

  async function disableAuth(){
    const s = await settingsRepo.get()
    if (!s) return
    await settingsRepo.set({ ...s, authEnabled: false, passwordHash: undefined, atualizadoEm: new Date().toISOString() } as any)
    setAuthEnabled(false)
    setAuthMsg('Login desativado.')
  }

  return (
    <div>
      <div className="h1">Configurações</div>
      <div className="muted">Preferências e manutenção dos dados</div>

      <div style={{height:12}} />

      <div className="card">
        <div className="h2">Notificações</div>
        <div className="muted" style={{fontSize:12}}>Lembretes de contas próximas do vencimento.</div>
        <div style={{height:10}} />
        <button className={"btn " + (notifs ? "primary" : "")} onClick={toggleNotifs}>
          {notifs ? 'Ativas' : 'Ativar'}
        </button>
      </div>

      <div style={{height:12}} />

      <div className="card">
        <div className="h2">Login e senha</div>
        <div className="muted" style={{fontSize:12}}>Tudo fica só no seu aparelho (sem servidor).</div>

        <div style={{height:10}} />

        <div className="grid2">
          <div>
            <label>Nome</label>
            <input className="input" value={authName} onChange={e=>setAuthName(e.target.value)} placeholder="Ex: Rafa" />
          </div>
          <div>
            <label>Senha (mín. 4)</label>
            <input className="input" type="password" value={authPass} onChange={e=>setAuthPass(e.target.value)} placeholder="••••" />
          </div>
        </div>

        <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
          <button className="btn primary" onClick={saveAuth}>Salvar login</button>
          <button className="btn" onClick={disableAuth}>Desativar</button>
        </div>

        {authEnabled && <div className="muted" style={{fontSize:12, marginTop:8}}>Status: ativado</div>}
        {authMsg && <div className="muted" style={{marginTop:8}}>{authMsg}</div>}
      </div>

      <div style={{height:12}} />

      <div className="card">
        <div className="h2">Exportar / Importar</div>
        <div className="muted" style={{fontSize:12}}>Faça backup em JSON.</div>
        <div style={{height:10}} />
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button className="btn" onClick={doExport}>Exportar</button>
          <button className="btn" onClick={doImport}>Importar</button>
          <button className="btn danger" onClick={doWipe}>Apagar tudo</button>
        </div>
        <div style={{height:10}} />
        <textarea className="input" style={{minHeight:160}} value={fileText} onChange={e=>setFileText(e.target.value)} placeholder="Cole aqui o JSON para importar, ou gere via Exportar." />
      </div>
    </div>
  )
}
