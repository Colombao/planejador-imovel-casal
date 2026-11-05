# 🏠 Planejador Patrimonial & Imóvel do Casal (Next.js + GitHub Pages)

Aplicação interativa construída em **Next.js 14 (Static Export)** + **TypeScript** + **Tailwind CSS**, estruturada sob metodologia **CFA / CFP® / CNPI** para planejamento de compra de imóvel (R$ 350 mil a R$ 400 mil, sem FGTS) combinado com crescimento patrimonial em casal.

## ✨ Funcionalidades Principais

1. **Simulador das 3 Caixas em Tempo Real:**
   - **Caixa 1 (Reserva Blindada):** R$ 30.000 em CDB 100% CDI Liquidez Diária / Tesouro Selic.
   - **Caixa 2 (Fundo do Imóvel):** R$ 10.000 em CDB 120% CDI + R$ 15.000 em 100% CDI + novos aportes em LCI/LCA isentas de Imposto de Renda.
   - **Caixa 3 (Crescimento de Longo Prazo):** Tesouro IPCA+ 2032 + ETFs Globais (`WRLD11`/`IVVB11`) ou FIIs.
2. **Divisão Proporcional Justa do Casal:**
   - Calcula automaticamente o percentual exato de participação de cada parceiro no contrato do imóvel com base no capital inicial (ex-reserva) e nos aportes mensais.
   - **Botão "Compartilhar c/ Namorada"**: gera um link com todos os parâmetros codificados na URL para enviar no WhatsApp.
3. **Comparador Imóvel Pronto vs. Imóvel na Planta (MCMV Faixa 3/4 & SFH):**
   - Simula **Crédito Associativo (Caixa)** vs. **Financiamento só nas Chaves (INCC sobre 80% do saldo)** vs. **Juntar Investindo e Comprar Pronto**.
   - Sliders de teste de estresse para **INCC anual** e **Kit Chaves (Piso, Marcenaria e Reforma)**.
4. **Guia Didático de Investimentos + Calculadora LCI/LCA vs. CDB:**
   - Conversor instantâneo de equivalência entre taxas isentas de IR (LCI/LCA) e taxas brutas de CDB conforme a tabela regressiva.
5. **Rotina Mensal & Checklist Persistente:**
   - Salva automaticamente os dados e o progresso do checklist no navegador (`localStorage`).

## 🚀 Como Rodar Localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## 📦 Build Estático (GitHub Pages)

O projeto já está configurado com `output: 'export'` no `next.config.mjs` e possui workflow completo do GitHub Actions em `.github/workflows/deploy.yml` para publicação automática no **GitHub Pages** a cada `push` na branch `main`.
