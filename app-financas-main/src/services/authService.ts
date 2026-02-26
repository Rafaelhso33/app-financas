import { settingsRepo } from '@/storage/repositories'

const SESSION_KEY = 'auth.session'

export function isLoggedIn(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export async function hasAuthEnabled(): Promise<boolean> {
  const s = await settingsRepo.get()
  return !!s?.authEnabled && !!s?.passwordHash
}

export async function getUserName(): Promise<string | undefined> {
  const s = await settingsRepo.get()
  return s?.userName
}

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  const bytes = Array.from(new Uint8Array(buf))
  return bytes.map(b => b.toString(16).padStart(2,'0')).join('')
}

export async function setupAuth(userName: string, password: string): Promise<void> {
  const s = await settingsRepo.get()
  const hash = await sha256(password)
  await settingsRepo.set({
    ...(s ?? { moeda: 'BRL', notificacoesAtivas: false, criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() }),
    userName: userName.trim(),
    passwordHash: hash,
    authEnabled: true,
    atualizadoEm: new Date().toISOString(),
  })
  sessionStorage.setItem(SESSION_KEY, '1')
}

export async function login(password: string): Promise<boolean> {
  const s = await settingsRepo.get()
  if (!s?.authEnabled || !s.passwordHash) return true
  const hash = await sha256(password)
  const ok = hash === s.passwordHash
  if (ok) sessionStorage.setItem(SESSION_KEY, '1')
  return ok
}
