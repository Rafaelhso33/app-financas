import { createBill } from './billsService'
import { createAsset } from './assetsService'
import { createPurchase } from './creditService'
import { createLoan, addPayment } from './loansService'
import { settingsRepo, billsRepo, creditRepo, loansRepo } from '@/storage/repositories'
import { nowIso } from '@/domain/ids'
import { getCompetencia, addMonthsCompetencia } from './date'

export async function seedIfEmpty(): Promise<void> {
  const [bills, credit, loans] = await Promise.all([
    billsRepo.list(),
    creditRepo.list(),
    loansRepo.list(),
  ])

  // Se já existir qualquer dado principal, não semeia.
  if ((bills?.length || 0) + (credit?.length || 0) + (loans?.length || 0) > 0) return

  const c = getCompetencia()

  await settingsRepo.set({
    moeda: 'BRL',
    notificacoesAtivas: false,
    authEnabled: false,
    criadoEm: nowIso(),
    atualizadoEm: nowIso(),
  } as any)

  // Ativos (seed)
  await createAsset({
    nome: 'Salário',
    categoria: 'Salário',
    valor: 3500,
    recorrente: true,
    observacoes: 'Exemplo de ativo mensal',
    competencia: c,
  })

  await createAsset({
    nome: 'Poupança',
    categoria: 'Poupança',
    valor: 300,
    recorrente: true,
    observacoes: 'Depósito mensal',
    competencia: c,
  })

  // Contas (seed)
  await createBill({
    nome: 'Aluguel',
    categoria: 'Casa',
    valor: 1200,
    vencimentoDia: 5,
    recorrente: true,
    observacoes: 'Exemplo recorrente',
    competencia: c,
  })

  await createBill({
    nome: 'Internet',
    categoria: 'Casa',
    valor: 110,
    vencimentoDia: 12,
    recorrente: true,
    observacoes: '',
  })

  await createBill({
    nome: 'IPTU (parcela única)',
    categoria: 'Impostos',
    valor: 350,
    vencimentoDia: 20,
    recorrente: false,
    observacoes: 'Exemplo não recorrente',
  })

  // Cartão (seed)
  await createPurchase({
    descricao: 'Tênis (3x)',
    valorTotal: 300,
    dataCompra: new Date().toISOString().slice(0, 10),
    parcelasTotal: 3,
    competenciaAtual: c,
  } as any)

  await createPurchase({
    descricao: 'Notebook (12x)',
    valorTotal: 2400,
    dataCompra: new Date().toISOString().slice(0, 10),
    parcelasTotal: 12,
    competenciaAtual: addMonthsCompetencia(c, -1),
  } as any)

  // Empréstimo (seed)
  const loan = await createLoan({
    descricao: 'Empréstimo carro',
    valorEmprestimo: 5000,
    dataInicio: new Date().toISOString().slice(0, 10),
  })
  await addPayment(loan.id, new Date().toISOString().slice(0, 10), 350)
}
