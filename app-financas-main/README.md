# Finance PWA (offline) — Contas, Cartão e Empréstimos

PWA responsivo (mobile-first) para controle financeiro pessoal **100% local**, com **IndexedDB**, competência mensal, contas recorrentes, **ativos mensais** (salário/adiantamento/poupança), cartão parcelado e empréstimos.

## Stack escolhida (confirmando)

- **React + Vite + TypeScript**
- **IndexedDB** via biblioteca **idb**
- **React Router**
- **Ativos** (entradas) com recorrência mensal
- **PWA** via `vite-plugin-pwa` (manifest + service worker)
- **Testes** com **Vitest**

---

## Como rodar (passo a passo)

### 1) Pré-requisitos
- Instale **Node.js LTS** (v18+ recomendado)
- Instale o **VS Code**

### 2) Abrir o projeto
1. Baixe/descompacte este projeto.
2. No VS Code: `File > Open Folder...` e escolha a pasta `finance-pwa`.

### 3) Instalar dependências
No terminal do VS Code (menu `Terminal > New Terminal`):

```bash
npm install
```

### 4) Rodar em modo dev
```bash
npm run dev
```

Abra o endereço que aparecer (geralmente `http://localhost:5173`).

### 5) Build (produção) e preview
```bash
npm run build
npm run preview
```

### 6) Testes
```bash
npm test
```

---

## Como funciona a **competência (YYYY-MM)**

- O app trabalha por **competência** (ex: `2026-02`).
- Ao abrir o app:
  - ele carrega a competência salva
  - compara com a competência do calendário (mês atual)
  - se mudou o mês, ele aplica a **virada de competência**:
    - contas recorrentes ganham status `PENDENTE` no novo mês
    - compras do cartão ajustam `parcelaAtual` conforme o mês

Competência fica salva em `localStorage` (`finance_pwa_competencia`) apenas para lembrar o mês que você estava vendo.

---

## Notificações (lembrete em 2 dias)

- Se houver contas **PENDENTES** com vencimento em **2 dias ou menos**, elas aparecem em destaque.
- Se você ativar notificações em **Configurações**, o app tenta mandar uma notificação do navegador (quando permitido).
- Se o navegador negar, o app continua com **alerta visual** no Dashboard/Contas.

---

## Persistência (IndexedDB)

- Tudo é salvo localmente no IndexedDB (banco `finance_pwa_db`).
- Estrutura pronta para futuramente sincronizar (camadas `domain / services / storage / ui`).

---

## Estrutura de pastas

```
src/
  domain/        # modelos e tipos, ids, timestamps
  storage/       # IndexedDB (idb), repositórios, export/import
  services/      # regras de negócio (competência, parcelas, lembretes)
  ui/
    components/  # componentes reutilizáveis
    pages/       # telas por aba/rota
```

---

## Dados seed (para testes)

Na primeira execução (banco vazio) o app cria dados de exemplo:
- Contas (aluguel, internet, etc.)
- Compras parceladas (3x, 12x)
- Um empréstimo + pagamento

---

## Decisões de arquitetura (curtas)

- **UI** não acessa IndexedDB diretamente → usa `services`.
- **Services** implementam regras: competência, 2 dias, parcelas, saldo do empréstimo.
- **Storage** encapsula IndexedDB com `idb`, facilitando evolução para sync.

---

## Observações

- Máscaras simples:
  - moeda via `Intl.NumberFormat` + input com parse/format no blur
  - datas via `input type="date"`


## iOS / Android

- Funciona como PWA em Android e iOS.
- **Notificações Web**: em alguns iPhones/iOS e navegadores, o suporte pode ser limitado. Quando não houver permissão/suporte, o app usa **alerta visual** no Dashboard/Contas.


## Como acessar pelo iPhone (dev)

1) No PC, rode:

```bash
npm run dev -- --host
```

2) Descubra o IP do seu PC (Windows: `ipconfig` → IPv4, ex: `192.168.0.10`).

3) No iPhone, conecte no **mesmo Wi‑Fi** e abra no Safari:

`http://SEU_IP:5173`

4) Para instalar como app: botão **Compartilhar** → **Adicionar à Tela de Início**.

> Observação: para o Service Worker/offline funcionar 100%, o ideal é servir em **HTTPS** (ex: publicar no Vercel/Netlify). Em rede local HTTP no iPhone, algumas funções podem ser limitadas.
