import React from 'react'
import { hasAuthEnabled, isLoggedIn, login, setupAuth } from '@/services/authService'

export default function LoginPage() {
  const [mode, setMode] = React.useState<'LOADING'|'LOGIN'|'SETUP'>('LOADING')
  const [userName, setUserName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string>('')

  React.useEffect(()=>{
    ;(async ()=>{
      const enabled = await hasAuthEnabled()
      if (!enabled) setMode('SETUP')
      else setMode('LOGIN')
    })()
  }, [])

  React.useEffect(()=>{
    if (isLoggedIn()) window.location.href = '/'
  }, [])

  async function onSubmit(){
    setError('')
    if (mode === 'SETUP') {
      if (!userName.trim()) return setError('Digite seu nome')
      if (password.length < 4) return setError('Senha precisa ter pelo menos 4 caracteres')
      await setupAuth(userName, password)
      window.location.href = '/'
      return
    }
    const ok = await login(password)
    if (!ok) setError('Senha incorreta')
    else window.location.href = '/'
  }

  return (
    <div className="card" style={{maxWidth:520, margin:'24px auto'}}>
      <div className="h1">{mode === 'SETUP' ? 'Criar acesso' : 'Entrar'}</div>
      <div className="muted" style={{marginTop:6}}>
        {mode === 'SETUP'
          ? 'Defina um nome e uma senha (fica tudo só no seu aparelho).'
          : 'Digite sua senha para acessar.'}
      </div>

      <div style={{height:12}} />

      {mode === 'SETUP' && (
        <div>
          <label>Nome</label>
          <input className="input" value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Ex: Rafa" />
          <div style={{height:10}} />
        </div>
      )}

      <label>Senha</label>
      <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••" />

      {error && <div className="muted" style={{color:'var(--danger)', marginTop:10}}>{error}</div>}

      <div style={{display:'flex', gap:8, marginTop:14}}>
        <button className="btn primary" onClick={onSubmit}>
          {mode === 'SETUP' ? 'Criar e entrar' : 'Entrar'}
        </button>
        {mode === 'LOGIN' && (
          <button className="btn" onClick={()=>{ setPassword(''); setError('') }}>
            Limpar
          </button>
        )}
      </div>

      <div style={{height:10}} />
      <div className="muted" style={{fontSize:12}}>
        Dica: se esquecer a senha, você pode apagar os dados do site no navegador (isso apaga os dados locais).
      </div>
    </div>
  )
}
