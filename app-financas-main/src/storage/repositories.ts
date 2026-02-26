import { getDb } from './db'
import { Bill, CreditPurchase, Loan, Settings, Asset } from '@/domain/types'


export const assetsRepo = {
  async list(): Promise<Asset[]> {
    const db = await getDb()
    return db.getAll('assets')
  },
  async get(id: string): Promise<Asset | undefined> {
    const db = await getDb()
    return db.get('assets', id)
  },
  async upsert(a: Asset): Promise<void> {
    const db = await getDb()
    await db.put('assets', a)
  },
  async remove(id: string): Promise<void> {
    const db = await getDb()
    await db.delete('assets', id)
  }
}

export const billsRepo = {
  async list(): Promise<Bill[]> {
    const db = await getDb()
    return db.getAll('bills')
  },
  async get(id: string): Promise<Bill | undefined> {
    const db = await getDb()
    return db.get('bills', id)
  },
  async upsert(bill: Bill): Promise<void> {
    const db = await getDb()
    await db.put('bills', bill)
  },
  async remove(id: string): Promise<void> {
    const db = await getDb()
    await db.delete('bills', id)
  }
}

export const creditRepo = {
  async list(): Promise<CreditPurchase[]> {
    const db = await getDb()
    return db.getAll('credit')
  },
  async get(id: string): Promise<CreditPurchase | undefined> {
    const db = await getDb()
    return db.get('credit', id)
  },
  async upsert(p: CreditPurchase): Promise<void> {
    const db = await getDb()
    await db.put('credit', p)
  },
  async remove(id: string): Promise<void> {
    const db = await getDb()
    await db.delete('credit', id)
  }
}

export const loansRepo = {
  async list(): Promise<Loan[]> {
    const db = await getDb()
    return db.getAll('loans')
  },
  async upsert(l: Loan): Promise<void> {
    const db = await getDb()
    await db.put('loans', l)
  },
  async remove(id: string): Promise<void> {
    const db = await getDb()
    await db.delete('loans', id)
  }
}

export const settingsRepo = {
  async get(): Promise<Settings | undefined> {
    const db = await getDb()
    return db.get('settings', 'settings')
  },
  async set(settings: Settings): Promise<void> {
    const db = await getDb()
    await db.put('settings', settings, 'settings')
  }
}
