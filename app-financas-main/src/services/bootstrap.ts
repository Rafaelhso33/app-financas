import { seedIfEmpty } from './seed'

export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  try {
    await navigator.serviceWorker.register('/sw.js')
  } catch (e) {
    console.warn('SW register failed', e)
  }
}

export async function bootstrap(): Promise<void> {
  await registerServiceWorker()
  await seedIfEmpty()
}
