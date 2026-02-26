import React from 'react'
import { hasAuthEnabled, isLoggedIn } from '@/services/authService'

export function RequireAuth(props: { children: React.ReactNode }) {
  const [ok, setOk] = React.useState<boolean | null>(null)

  React.useEffect(()=>{
    ;(async ()=>{
      const enabled = await hasAuthEnabled()
      if (!enabled) { setOk(true); return }
      setOk(isLoggedIn())
    })()
  }, [])

  if (ok === null) return <div className="card">Carregando...</div>
  if (!ok) { window.location.href = '/login'; return null }
  return <>{props.children}</>
}
