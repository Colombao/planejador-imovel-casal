export interface MarketIndicators {
  selic: number; // % a.a.
  cdi: number; // % a.a.
  ipca12m: number; // % acum. 12m
  incc12m: number; // % acum. 12m
  tesouroIpcaReal: number; // % a.a. acima do IPCA (ex: 7.92)
  tesouroPre: number; // % a.a. (ex: 14.94)
  usdBrl: number; // R$
  lastUpdated: string;
  source: "BCB_LIVE" | "FALLBACK_2026";
}

export const DEFAULT_MARKET_INDICATORS: MarketIndicators = {
  selic: 13.75,
  cdi: 13.65,
  ipca12m: 4.56,
  incc12m: 5.48,
  tesouroIpcaReal: 7.92,
  tesouroPre: 14.94,
  usdBrl: 5.78,
  lastUpdated: "05/11/2026 (Referência Copom)",
  source: "FALLBACK_2026",
};

export function getIrRateForMonths(months: number): number {
  const days = months * 30;
  if (days <= 180) return 0.225;
  if (days <= 360) return 0.20;
  if (days <= 720) return 0.175;
  return 0.15;
}

export interface AssetComparisonItem {
  id: string;
  name: string;
  recommendedBox: "Caixa 1 (Reserva)" | "Caixa 2 (Imóvel)" | "Caixa 3 (Crescimento)" | "Evitar";
  grossRule: string;
  grossAnnualPct: number;
  irPct: number;
  netAnnualPct: number;
  realAnnualPctOverIpca: number; // Fórmula de Fisher: ((1 + net) / (1 + ipca)) - 1
  netValueOn10kAfterMonths: number;
  liquidity: string;
  fgcOrSovereign: string;
  cioVerdict: string;
}

export function buildAssetRanking(
  mkt: MarketIndicators,
  months: number,
  lciCustomPctOfCdi: number = 91
): AssetComparisonItem[] {
  const ir = getIrRateForMonths(months);
  const ipcaDec = mkt.ipca12m / 100;

  const calcReal = (netPct: number) => {
    const netDec = netPct / 100;
    return (((1 + netDec) / (1 + ipcaDec)) - 1) * 100;
  };

  const calc10k = (netPct: number) => {
    const mRate = Math.pow(1 + netPct / 100, 1 / 12) - 1;
    return 10000 * Math.pow(1 + mRate, months);
  };

  // 1. Seu CDB 120% CDI
  const cdb120Gross = mkt.cdi * 1.2;
  const cdb120Net = cdb120Gross * (1 - ir);

  // 2. LCI / LCA Pós-Fixada (ex: 91% CDI) Isenta
  const lciGross = mkt.cdi * (lciCustomPctOfCdi / 100);
  const lciNet = lciGross; // Isenta de IR

  // 3. LCI / LCA IPCA+ (ex: IPCA + 6,60% a.a.) Isenta
  const lciIpcaSpread = Math.max(5.8, mkt.tesouroIpcaReal - 1.3);
  const lciIpcaGross = ((1 + ipcaDec) * (1 + lciIpcaSpread / 100) - 1) * 100;
  const lciIpcaNet = lciIpcaGross; // Isenta de IR

  // 4. Tesouro IPCA+ 2032 (IPCA + 7.92% a.a., tributado + 0.20% B3)
  const tesouroIpcaGross =
    ((1 + ipcaDec) * (1 + mkt.tesouroIpcaReal / 100) - 1) * 100;
  const tesouroIpcaNet = Math.max(0, tesouroIpcaGross * (1 - ir) - 0.2);

  // 5. Tesouro Prefixado 2029 (~14.94% a.a.)
  const tesouroPreGross = mkt.tesouroPre;
  const tesouroPreNet = Math.max(0, tesouroPreGross * (1 - ir) - 0.2);

  // 6. CDB 100% CDI / Tesouro Selic
  const cdb100Gross = mkt.cdi;
  const cdb100Net = cdb100Gross * (1 - ir);

  // 7. CDB 106% CDI (Banco Médio)
  const cdb106Gross = mkt.cdi * 1.06;
  const cdb106Net = cdb106Gross * (1 - ir);

  // 8. Poupança (0.5% a.m. + TR ~ 7.8% a.a.)
  const poupancaNet = 7.85;

  const items: AssetComparisonItem[] = [
    {
      id: "cdb-120",
      name: "CDB 120% do CDI (Seus R$ 10 mil atuais)",
      recommendedBox: "Caixa 2 (Imóvel)",
      grossRule: "120% do CDI",
      grossAnnualPct: cdb120Gross,
      irPct: ir * 100,
      netAnnualPct: cdb120Net,
      realAnnualPctOverIpca: calcReal(cdb120Net),
      netValueOn10kAfterMonths: calc10k(cdb120Net),
      liquidity: "No vencimento / Diária (conforme regra)",
      fgcOrSovereign: "Garantia FGC (até R$ 250 mil)",
      cioVerdict:
        "Excelente retorno líquido! Mantenha seus R$ 10.000 aqui até o vencimento como base da Caixa 2.",
    },
    {
      id: "lci-lca-pos",
      name: `LCI / LCA Pós-Fixada (${lciCustomPctOfCdi}% do CDI Isenta)`,
      recommendedBox: "Caixa 2 (Imóvel)",
      grossRule: `${lciCustomPctOfCdi}% do CDI (Zero IR)`,
      grossAnnualPct: lciGross,
      irPct: 0,
      netAnnualPct: lciNet,
      realAnnualPctOverIpca: calcReal(lciNet),
      netValueOn10kAfterMonths: calc10k(lciNet),
      liquidity: "Carência de 9 a 12 meses (Regra CMN)",
      fgcOrSovereign: "Garantia FGC (até R$ 250 mil)",
      cioVerdict: `Melhor escolha para os aportes mensais do imóvel em Jaraguá! Equivale a um CDB de ${(
        lciCustomPctOfCdi /
        (1 - ir)
      )
        .toFixed(1)
        .replace(".", ",")}% do CDI.`,
    },
    {
      id: "lci-lca-ipca",
      name: `LCI / LCA IPCA + ${lciIpcaSpread.toFixed(1).replace(".", ",")}% a.a. (Isenta)`,
      recommendedBox: "Caixa 2 (Imóvel)",
      grossRule: `IPCA + ${lciIpcaSpread.toFixed(1).replace(".", ",")}% (Zero IR)`,
      grossAnnualPct: lciIpcaGross,
      irPct: 0,
      netAnnualPct: lciIpcaNet,
      realAnnualPctOverIpca: calcReal(lciIpcaNet),
      netValueOn10kAfterMonths: calc10k(lciIpcaNet),
      liquidity: "No vencimento (12 a 36 meses)",
      fgcOrSovereign: "Garantia FGC (até R$ 250 mil)",
      cioVerdict:
        "Trava ganho real limpo de imposto e protege o poder de compra contra a alta do m² e do INCC em Jaraguá do Sul.",
    },
    {
      id: "tesouro-pre-2029",
      name: `Tesouro Prefixado 2029 (${mkt.tesouroPre.toFixed(2).replace(".", ",")}% a.a.)`,
      recommendedBox: "Caixa 3 (Crescimento)",
      grossRule: `${mkt.tesouroPre.toFixed(2).replace(".", ",")}% a.a. fixo`,
      grossAnnualPct: tesouroPreGross,
      irPct: ir * 100,
      netAnnualPct: tesouroPreNet,
      realAnnualPctOverIpca: calcReal(tesouroPreNet),
      netValueOn10kAfterMonths: calc10k(tesouroPreNet),
      liquidity: "D+1 (Sujeito a marcação a mercado)",
      fgcOrSovereign: "Risco Soberano (Tesouro Nacional)",
      cioVerdict:
        "Ótimo para travar taxa alta caso a Selic caia nos próximos anos, desde que você possa levar até 2029.",
    },
    {
      id: "tesouro-ipca-2032",
      name: `Tesouro IPCA+ 2032 (IPCA + ${mkt.tesouroIpcaReal.toFixed(2).replace(".", ",")}%)`,
      recommendedBox: "Caixa 3 (Crescimento)",
      grossRule: `IPCA + ${mkt.tesouroIpcaReal.toFixed(2).replace(".", ",")}% a.a.`,
      grossAnnualPct: tesouroIpcaGross,
      irPct: ir * 100,
      netAnnualPct: tesouroIpcaNet,
      realAnnualPctOverIpca: calcReal(tesouroIpcaNet),
      netValueOn10kAfterMonths: calc10k(tesouroIpcaNet),
      liquidity: "D+1 (Marcação a mercado se vender antes)",
      fgcOrSovereign: "Risco Soberano (Tesouro Nacional)",
      cioVerdict:
        "Pilar principal da Caixa 3 (Crescimento): juro real perto de 8% a.a. acima da inflação para multiplicar patrimônio.",
    },
    {
      id: "cdb-106",
      name: "CDB de Banco Médio (106% do CDI)",
      recommendedBox: "Caixa 2 (Imóvel)",
      grossRule: "106% do CDI",
      grossAnnualPct: cdb106Gross,
      irPct: ir * 100,
      netAnnualPct: cdb106Net,
      realAnnualPctOverIpca: calcReal(cdb106Net),
      netValueOn10kAfterMonths: calc10k(cdb106Net),
      liquidity: "Vencimento (1 a 2 anos)",
      fgcOrSovereign: "Garantia FGC (até R$ 250 mil)",
      cioVerdict:
        "Perde para uma LCI/LCA de 90%+ do CDI por causa do desconto de Imposto de Renda.",
    },
    {
      id: "cdb-100-selic",
      name: "CDB 100% CDI Liquidez Diária / Tesouro Selic",
      recommendedBox: "Caixa 1 (Reserva)",
      grossRule: "100% do CDI / Selic",
      grossAnnualPct: cdb100Gross,
      irPct: ir * 100,
      netAnnualPct: cdb100Net,
      realAnnualPctOverIpca: calcReal(cdb100Net),
      netValueOn10kAfterMonths: calc10k(cdb100Net),
      liquidity: "Imediata (D+0)",
      fgcOrSovereign: "Soberano / Grandes Bancos FGC",
      cioVerdict:
        "Indispensável para os R$ 30.000 da Reserva Blindada (Caixa 1). Não troque liquidez imediata por alguns décimos a mais.",
    },
    {
      id: "poupanca",
      name: "Caderneta de Poupança (Comparativo)",
      recommendedBox: "Evitar",
      grossRule: "0,5% a.m. + TR",
      grossAnnualPct: poupancaNet,
      irPct: 0,
      netAnnualPct: poupancaNet,
      realAnnualPctOverIpca: calcReal(poupancaNet),
      netValueOn10kAfterMonths: calc10k(poupancaNet),
      liquidity: "Aniversário mensal (perde giro se sacar antes)",
      fgcOrSovereign: "Garantia FGC",
      cioVerdict:
        "Rende quase 4% a menos ao ano que uma LCI/LCA ou CDB 100% CDI com o mesmo risco.",
    },
  ];

  return items.sort((a, b) => b.netAnnualPct - a.netAnnualPct);
}

export async function fetchLiveMarketIndicators(): Promise<MarketIndicators> {
  const result: MarketIndicators = { ...DEFAULT_MARKET_INDICATORS };
  let anyLive = false;

  try {
    // 1. Selic Meta (Série 432 BCB)
    const selicRes = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json"
    );
    if (selicRes.ok) {
      const data = await selicRes.json();
      if (data?.[0]?.valor) {
        result.selic = parseFloat(data[0].valor);
        result.cdi = Math.max(0.1, result.selic - 0.1);
        result.lastUpdated = `${data[0].data} (API Oficial Banco Central)`;
        anyLive = true;
      }
    }
  } catch {
    // Fallback
  }

  try {
    // 2. IPCA Acumulado 12 meses (Série 13522 BCB)
    const ipcaRes = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/1?formato=json"
    );
    if (ipcaRes.ok) {
      const data = await ipcaRes.json();
      if (data?.[0]?.valor) {
        result.ipca12m = parseFloat(data[0].valor);
        anyLive = true;
      }
    }
  } catch {
    // Fallback
  }

  try {
    // 3. INCC-M últimos 12 meses (Série 192 BCB)
    const inccRes = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.192/dados/ultimos/12?formato=json"
    );
    if (inccRes.ok) {
      const data = await inccRes.json();
      if (Array.isArray(data) && data.length > 0) {
        let acc = 1;
        data.forEach((row: { valor: string }) => {
          const v = parseFloat(row.valor);
          if (!isNaN(v)) acc *= 1 + v / 100;
        });
        result.incc12m = Number(((acc - 1) * 100).toFixed(2));
        anyLive = true;
      }
    }
  } catch {
    // Fallback
  }

  try {
    // 4. Dólar USD-BRL (AwesomeAPI)
    const usdRes = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
    if (usdRes.ok) {
      const data = await usdRes.json();
      if (data?.USDBRL?.bid) {
        result.usdBrl = parseFloat(data.USDBRL.bid);
        anyLive = true;
      }
    }
  } catch {
    // Fallback
  }

  if (anyLive) {
    result.source = "BCB_LIVE";
  }

  return result;
}
