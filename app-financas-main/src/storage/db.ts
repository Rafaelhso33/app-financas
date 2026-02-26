import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { AppData, Bill, CreditPurchase, Loan, Settings } from '@/domain/types'

const DB_NAME = 'finance_pwa_db'
const DB_VERSION = 2

interface FinanceDB extends DBSchema {
  assets: { key: string; value: import('@/domain/types').Asset }

  bills: { key: string; value: Bill }
  credit: { key: string; value: CreditPurchase }
  loans: { key: string; value: Loan }
  settings: { key: string; value: Settings } // single key 'settings'
}

let dbPromise: Promise<IDBPDatabase<FinanceDB>> | null = null

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<FinanceDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('bills')) db.createObjectStore('bills', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('assets')) db.createObjectStore('assets', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('credit')) db.createObjectStore('credit', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('loans')) db.createObjectStore('loans', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings')
      }
    })
  }
  return dbPromise
}

export async function wipeAll() {
  const db = await getDb()
  await Promise.all([
    db.clear('bills'),
    db.clear('assets'),
    db.clear('credit'),
    db.clear('loans'),
    db.clear('settings')
  ])
}

export async function exportAll(): Promise<AppData> {
  const db = await getDb()
  const [bills, assets, credit, loans, settings] = await Promise.all([
    db.getAll('bills'),
    db.getAll('assets'),
    db.getAll('credit'),
    db.getAll('loans'),
    db.get('settings', 'settings')
  ])
  return {
    bills,
    assets,
    credit,
    loans,
    settings: settings ?? {
      moeda: 'BRL',
      notificacoesAtivas: false,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    },
    meta: { version: 1, exportedAt: new Date().toISOString() }
  }
}

export async function importAll(data: AppData): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(['bills', 'assets', 'credit', 'loans', 'settings'], 'readwrite')
  await Promise.all([
    tx.objectStore('bills').clear(),
    tx.objectStore('assets').clear(),
    tx.objectStore('credit').clear(),
    tx.objectStore('loans').clear(),
    tx.objectStore('settings').clear()
  ])
  for (const b of data.bills ?? []) await tx.objectStore('bills').put(b)
  for (const a of (data as any).assets ?? []) await tx.objectStore('assets').put(a)
  for (const c of data.credit ?? []) await tx.objectStore('credit').put(c)
  for (const l of data.loans ?? []) await tx.objectStore('loans').put(l)
  await tx.objectStore('settings').put(data.settings, 'settings')
  await tx.done
}
