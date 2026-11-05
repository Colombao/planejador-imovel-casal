"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Home,
  TrendingUp,
  Users,
  Calculator,
  BookOpen,
  CheckSquare,
  Share2,
  RotateCcw,
  Sun,
  Moon,
  Sparkles,
  Check,
  Building2,
  Wallet,
  ArrowRight,
  Info,
  MapPin,
  RefreshCw,
  Award,
  PlusCircle,
  Trash2,
  Coins,
  Layers,
} from "lucide-react";
import {
  JARAGUA_PROPERTIES,
  JARAGUA_NEIGHBORHOODS,
  JaraguaProperty,
} from "@/data/jaraguaProperties";
import {
  DEFAULT_MARKET_INDICATORS,
  MarketIndicators,
  fetchLiveMarketIndicators,
  buildAssetRanking,
  getIrRateForMonths,
} from "@/services/marketApi";
import { TOP_FIIS_2026 } from "@/data/fiisCatalog";

interface ChecklistItem {
  id: string;
  title: string;
  desc: string;
  category: "Carteira" | "Casal" | "Jaraguá do Sul" | "FIIs";
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "chk-1",
    category: "Carteira",
    title: "Validar os R$ 10.000 em 120% do CDI",
    desc: "Conferir no aplicativo do banco/corretora a data de vencimento e garantia do FGC, mantendo esse valor carimbado na Caixa 2 (Imóvel).",
  },
  {
    id: "chk-2",
    category: "Carteira",
    title: "Separar os R$ 50.000 atuais nas 3 Caixas (sem resgatar antes da hora)",
    desc: "Manter R$ 30.000 como Reserva Blindada (Caixa 1), R$ 15.000 na Caixa 2 (Imóvel) e R$ 5.000 na Caixa 3 (Crescimento).",
  },
  {
    id: "chk-3",
    category: "Casal",
    title: "Alinhar o Aporte Mensal e a Proporção do Casal",
    desc: "Simular juntos quanto cada um pode aportar por mês e usar o botão Compartilhar para salvar o cenário no WhatsApp.",
  },
  {
    id: "chk-4",
    category: "Carteira",
    title: "Direcionar os novos aportes da Caixa 2 para LCI/LCA (90%+ do CDI)",
    desc: "Consultando a Aba 2 (Ranking do Mercado), aplicar a fatia mensal do imóvel em LCI/LCA isenta de IR com vencimento casado com a obra.",
  },
  {
    id: "chk-5",
    category: "FIIs",
    title: "Montar a Carteira Bola de Neve na Caixa 3 (Papel Base 10 + Tijolo)",
    desc: "Combinar MXRF11 + KNSC11 (Papel Base 10) com BTLG11 + XPML11 (Tijolo) usando metade da Caixa 3 e reinvestindo 100% dos dividendos.",
  },
  {
    id: "chk-6",
    category: "Jaraguá do Sul",
    title: "Selecionar e visitar 2 a 3 opções em Jaraguá do Sul (Aba 1)",
    desc: "Comparar empreendimentos em Água Verde/Rau, Jaraguá Esquerdo, Vila Lenzi ou Três Rios do Norte e cadastrar as propostas reais na Aba 1.",
  },
  {
    id: "chk-7",
    category: "Jaraguá do Sul",
    title: "Checar 36 meses de vínculo CLT (Desconto Cotista FGTS na Caixa)",
    desc: "Mesmo com saldo zero de FGTS, 3 anos de carteira assinada somados reduzem em 0,5% a.a. os juros do financiamento na Caixa.",
  },
  {
    id: "chk-8",
    category: "Jaraguá do Sul",
    title: "Exigir Crédito Associativo + Patrimônio de Afetação na construtora",
    desc: "Para imóveis na planta até R$ 400 mil em Jaraguá do Sul, exigir assinatura via Crédito Associativo (congela os 80% contra o INCC).",
  },
];

function fmtBRL(value: number): string {
  return Math.round(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function fmtBRLCents(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PlanejadorCasalPage() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    "jaragua" | "mercado" | "fiis" | "simulador" | "planta" | "plano"
  >("fiis");

  // Market Live State
  const [market, setMarket] = useState<MarketIndicators>(DEFAULT_MARKET_INDICATORS);
  const [loadingMarket, setLoadingMarket] = useState<boolean>(false);

  // Couple & Financial Parameters
  const [userName, setUserName] = useState<string>("Você");
  const [partnerName, setPartnerName] = useState<string>("Namorada");

  const [userInit, setUserInit] = useState<number>(60000);
  const [userRes, setUserRes] = useState<number>(30000);
  const [userMonthly, setUserMonthly] = useState<number>(2000);
  const [userIncome, setUserIncome] = useState<number>(6500);

  const [partInit, setPartInit] = useState<number>(5000);
  const [partMonthly, setPartMonthly] = useState<number>(1000);
  const [partIncome, setPartIncome] = useState<number>(4500);

  // Selected Property in Jaraguá do Sul
  const [selectedPropId, setSelectedPropId] = useState<string>(
    "rogga-frankfurt-agua-verde"
  );
  const [customProps, setCustomProps] = useState<JaraguaProperty[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newPropName, setNewPropName] = useState<string>("");
  const [newPropNeighborhood, setNewPropNeighborhood] = useState<string>("Água Verde");
  const [newPropPrice, setNewPropPrice] = useState<number>(370000);
  const [newPropArea, setNewPropArea] = useState<number>(50);
  const [newPropMonths, setNewPropMonths] = useState<number>(30);
  const [newPropSignalPct, setNewPropSignalPct] = useState<number>(8);

  const [propPrice, setPropPrice] = useState<number>(376000);
  const [months, setMonths] = useState<number>(30);
  const [splitImovelPct, setSplitImovelPct] = useState<number>(75);

  // FII Snowball simulator state
  const [selectedFiiTicker, setSelectedFiiTicker] = useState<string>("MXRF11");
  const [fiiShareOfBox3Pct, setFiiShareOfBox3Pct] = useState<number>(50);

  // Off-plan stress test parameters
  const [inccAnnual, setInccAnnual] = useState<number>(5.48);
  const [reformaCost, setReformaCost] = useState<number>(28000);
  const [signalPct, setSignalPct] = useState<number>(8);

  // LCI/LCA converter state
  const [lciRate, setLciRate] = useState<number>(92);
  const [irBracket, setIrBracket] = useState<number>(0.15);

  // Checklist & Share state
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const allProperties = useMemo(
    () => [...JARAGUA_PROPERTIES, ...customProps],
    [customProps]
  );

  const activeProperty = useMemo(
    () =>
      allProperties.find((p) => p.id === selectedPropId) ||
      JARAGUA_PROPERTIES[0],
    [allProperties, selectedPropId]
  );

  const syncMarketData = async () => {
    setLoadingMarket(true);
    try {
      const live = await fetchLiveMarketIndicators();
      setMarket(live);
      if (live.incc12m > 0) {
        setInccAnnual(live.incc12m);
      }
    } finally {
      setLoadingMarket(false);
    }
  };

  useEffect(() => {
    syncMarketData();

    try {
      const savedTheme = localStorage.getItem("cio_theme");
      if (savedTheme === "light") {
        setDarkMode(false);
        document.documentElement.classList.remove("dark");
      } else {
        setDarkMode(true);
        document.documentElement.classList.add("dark");
      }

      const savedChecks = localStorage.getItem("cio_checklist");
      if (savedChecks) setCheckedIds(JSON.parse(savedChecks));

      const savedCustomProps = localStorage.getItem("cio_jaragua_custom_props");
      if (savedCustomProps) setCustomProps(JSON.parse(savedCustomProps));

      const params = new URLSearchParams(window.location.search);
      if (params.has("uInit")) {
        setUserInit(Number(params.get("uInit")) || 60000);
        setUserRes(Number(params.get("uRes")) || 30000);
        setUserMonthly(Number(params.get("uMon")) || 2000);
        setUserIncome(Number(params.get("uInc")) || 6500);
        setPartInit(Number(params.get("pInit")) || 0);
        setPartMonthly(Number(params.get("pMon")) || 0);
        setPartIncome(Number(params.get("pInc")) || 4500);
        setPropPrice(Number(params.get("price")) || 376000);
        setMonths(Number(params.get("m")) || 30);
        setSplitImovelPct(Number(params.get("split")) || 75);
        if (params.get("propId")) setSelectedPropId(params.get("propId")!);
        if (params.get("uName")) setUserName(params.get("uName")!);
        if (params.get("pName")) setPartnerName(params.get("pName")!);
      } else {
        const savedState = localStorage.getItem("cio_sim_state_v2");
        if (savedState) {
          const parsed = JSON.parse(savedState);
          setUserInit(parsed.userInit ?? 60000);
          setUserRes(parsed.userRes ?? 30000);
          setUserMonthly(parsed.userMonthly ?? 2000);
          setUserIncome(parsed.userIncome ?? 6500);
          setPartInit(parsed.partInit ?? 5000);
          setPartMonthly(parsed.partMonthly ?? 1000);
          setPartIncome(parsed.partIncome ?? 4500);
          setPropPrice(parsed.propPrice ?? 376000);
          setMonths(parsed.months ?? 30);
          setSplitImovelPct(parsed.splitImovelPct ?? 75);
          if (parsed.selectedPropId) setSelectedPropId(parsed.selectedPropId);
          if (parsed.userName) setUserName(parsed.userName);
          if (parsed.partnerName) setPartnerName(parsed.partnerName);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "cio_sim_state_v2",
        JSON.stringify({
          userInit,
          userRes,
          userMonthly,
          userIncome,
          partInit,
          partMonthly,
          partIncome,
          propPrice,
          months,
          splitImovelPct,
          selectedPropId,
          userName,
          partnerName,
        })
      );
    } catch {
      // Ignore
    }
  }, [
    userInit,
    userRes,
    userMonthly,
    userIncome,
    partInit,
    partMonthly,
    partIncome,
    propPrice,
    months,
    splitImovelPct,
    selectedPropId,
    userName,
    partnerName,
  ]);

  const selectJaraguaProperty = (prop: JaraguaProperty) => {
    setSelectedPropId(prop.id);
    setPropPrice(prop.price);
    setMonths(prop.deliveryMonths);
    setReformaCost(prop.recommendedFinishReserve);
    setSignalPct(prop.signalPct);
  };

  const handleAddCustomProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName.trim()) return;
    const created: JaraguaProperty = {
      id: "custom-" + Date.now(),
      name: newPropName.trim(),
      builder: "Cotação Local Visitada",
      neighborhood: newPropNeighborhood,
      price: newPropPrice,
      areaM2: newPropArea,
      bedrooms: 2,
      parkingSpots: 1,
      deliveryMonths: newPropMonths,
      downPaymentPct: 20,
      signalPct: newPropSignalPct,
      financingType: newPropPrice <= 400000 ? "Associativo_MCMV" : "Direto_INCC",
      highlights: [
        `${newPropArea} m² em ${newPropNeighborhood} (${fmtBRL(newPropPrice / newPropArea)}/m²)`,
        `Sinal de ${newPropSignalPct}% (${fmtBRL((newPropPrice * newPropSignalPct) / 100)}) + obra em ${newPropMonths} meses`,
      ],
      recommendedFinishReserve: 28000,
      sourceNote: "Cadastrado manualmente pelo casal",
      isCustom: true,
    };
    const updated = [...customProps, created];
    setCustomProps(updated);
    try {
      localStorage.setItem("cio_jaragua_custom_props", JSON.stringify(updated));
    } catch {
      // Ignore
    }
    selectJaraguaProperty(created);
    setNewPropName("");
    setShowAddForm(false);
  };

  const handleDeleteCustomProp = (id: string) => {
    const updated = customProps.filter((p) => p.id !== id);
    setCustomProps(updated);
    try {
      localStorage.setItem("cio_jaragua_custom_props", JSON.stringify(updated));
    } catch {
      // Ignore
    }
    if (selectedPropId === id) {
      selectJaraguaProperty(JARAGUA_PROPERTIES[0]);
    }
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("cio_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("cio_theme", "light");
    }
  };

  const resetDefaults = () => {
    setUserName("Você");
    setPartnerName("Namorada");
    setUserInit(60000);
    setUserRes(30000);
    setUserMonthly(2000);
    setUserIncome(6500);
    setPartInit(5000);
    setPartMonthly(1000);
    setPartIncome(4500);
    selectJaraguaProperty(JARAGUA_PROPERTIES[0]);
    setSplitImovelPct(75);
  };

  const handleShareSimulation = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("uInit", String(userInit));
    url.searchParams.set("uRes", String(userRes));
    url.searchParams.set("uMon", String(userMonthly));
    url.searchParams.set("uInc", String(userIncome));
    url.searchParams.set("pInit", String(partInit));
    url.searchParams.set("pMon", String(partMonthly));
    url.searchParams.set("pInc", String(partIncome));
    url.searchParams.set("price", String(propPrice));
    url.searchParams.set("m", String(months));
    url.searchParams.set("split", String(splitImovelPct));
    url.searchParams.set("propId", selectedPropId);
    url.searchParams.set("uName", userName);
    url.searchParams.set("pName", partnerName);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const toggleCheck = (id: string) => {
    const updated = { ...checkedIds, [id]: !checkedIds[id] };
    setCheckedIds(updated);
    try {
      localStorage.setItem("cio_checklist", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const assetRanking = useMemo(
    () => buildAssetRanking(market, months, lciRate),
    [market, months, lciRate]
  );

  // Core Financial Calculations
  const sim = useMemo(() => {
    const ir = getIrRateForMonths(months);
    const safeRes = Math.min(userRes, Math.max(0, userInit - 5000));
    const userExRes = Math.max(0, userInit - safeRes);
    const c3Init = Math.min(5000, userExRes * 0.2);
    const c2UserInit = userExRes - c3Init;

    const c1Init = safeRes;
    const c2Init = c2UserInit + partInit;

    const coupleMonthly = userMonthly + partMonthly;
    const splitRatio = splitImovelPct / 100;
    const c2Monthly = coupleMonthly * splitRatio;
    const c3Monthly = coupleMonthly * (1 - splitRatio);

    const c1NetAnnual = (market.cdi * (1 - ir)) / 100;
    const lciNetAnnual = (market.cdi * (lciRate / 100)) / 100;
    const cdb120NetAnnual = (market.cdi * 1.2 * (1 - ir)) / 100;
    const c2NetAnnual = lciNetAnnual * 0.8 + cdb120NetAnnual * 0.2;

    const ipcaDec = market.ipca12m / 100;
    const tesouroIpcaGross = (1 + ipcaDec) * (1 + market.tesouroIpcaReal / 100) - 1;
    const c3NetAnnual = tesouroIpcaGross * (1 - 0.15);

    const r1 = Math.pow(1 + c1NetAnnual, 1 / 12) - 1;
    const r2 = Math.pow(1 + c2NetAnnual, 1 / 12) - 1;
    const r3 = Math.pow(1 + c3NetAnnual, 1 / 12) - 1;

    const c1Series: number[] = [c1Init];
    const c2Series: number[] = [c2Init];
    const c3Series: number[] = [c3Init];
    const totalSeries: number[] = [c1Init + c2Init + c3Init];

    let cur1 = c1Init;
    let cur2 = c2Init;
    let cur3 = c3Init;

    for (let m = 1; m <= months; m++) {
      cur1 = cur1 * (1 + r1);
      cur2 = cur2 * (1 + r2) + c2Monthly;
      cur3 = cur3 * (1 + r3) + c3Monthly;
      c1Series.push(cur1);
      c2Series.push(cur2);
      c3Series.push(cur3);
      totalSeries.push(cur1 + cur2 + cur3);
    }

    const downPayment20 = propPrice * 0.2;
    const docsItbi5 = propPrice * 0.05;
    const targetPronto = downPayment20 + docsItbi5;
    const targetPlanta = targetPronto + reformaCost;

    const totalFinal = cur1 + cur2 + cur3;
    const leftoverPronto = totalFinal - targetPronto;
    const c2InterestEarned = cur2 - (c2Init + c2Monthly * months);

    const userCommitted = userExRes + userMonthly * months;
    const partCommitted = partInit + partMonthly * months;
    const totalCommitted = Math.max(1, userCommitted + partCommitted);
    const userSharePct = (userCommitted / totalCommitted) * 100;
    const partSharePct = (partCommitted / totalCommitted) * 100;

    const signalAmount = (propPrice * signalPct) / 100;
    const restEntryPct = Math.max(0, 20 - signalPct);
    const builderEntryRest = (propPrice * restEntryPct) / 100;
    const avgBuilderMonthly =
      (builderEntryRest / months) * (1 + (inccAnnual / 100) * (months / 24));
    const financed80 = propPrice * 0.8;
    const totalObraEvolutionFee = financed80 * 0.0033 * months;
    const inccCorrectedDebt80 =
      financed80 * Math.pow(1 + inccAnnual / 100, months / 12);
    const inccDebtIncrease = inccCorrectedDebt80 - financed80;

    const combinedIncome = userIncome + partIncome;
    let mcmvStatus = "";
    let estimatedRate = "";
    if (propPrice <= 400000 && combinedIncome <= 9600) {
      mcmvStatus =
        "Enquadra no MCMV Faixa 3 em Jaraguá do Sul (Renda até R$ 9.600 e Imóvel até R$ 400 mil)";
      estimatedRate = "7,66% a 8,16% a.a. + TR";
    } else if (
      propPrice <= 400000 &&
      userIncome <= 9600 &&
      combinedIncome > 9600
    ) {
      mcmvStatus =
        "Estratégia Inteligente: Renda somada passa de R$ 9.600 (Faixa 4), mas financiando em 1 único CPF você pega juros reduzidos da Faixa 3!";
      estimatedRate = "Faixa 3 (~8,16% a.a.) em 1 CPF vs. Faixa 4 (~10,0% a.a.)";
    } else if (propPrice <= 600000 && combinedIncome <= 13000) {
      mcmvStatus =
        "Enquadra no MCMV Faixa 4 - Classe Média (Imóvel até R$ 600 mil e Renda até R$ 13.000)";
      estimatedRate = "~10,0% a 10,5% a.a. + TR";
    } else {
      mcmvStatus = "Financiamento via SFH Tradicional (Taxas de Mercado)";
      estimatedRate = "~11,0% a 12,0% a.a. + TR";
    }

    return {
      c1Init,
      c2Init,
      c3Init,
      cur1,
      cur2,
      cur3,
      totalFinal,
      coupleMonthly,
      c2Monthly,
      c3Monthly,
      c1NetAnnual: c1NetAnnual * 100,
      c2NetAnnual: c2NetAnnual * 100,
      c3NetAnnual: c3NetAnnual * 100,
      c1Series,
      c2Series,
      c3Series,
      totalSeries,
      downPayment20,
      docsItbi5,
      targetPronto,
      targetPlanta,
      leftoverPronto,
      c2InterestEarned,
      userCommitted,
      partCommitted,
      userSharePct,
      partSharePct,
      signalAmount,
      avgBuilderMonthly,
      financed80,
      totalObraEvolutionFee,
      inccCorrectedDebt80,
      inccDebtIncrease,
      combinedIncome,
      mcmvStatus,
      estimatedRate,
    };
  }, [
    userInit,
    userRes,
    userMonthly,
    userIncome,
    partInit,
    partMonthly,
    partIncome,
    propPrice,
    months,
    splitImovelPct,
    inccAnnual,
    reformaCost,
    signalPct,
    market,
    lciRate,
  ]);

  // FII Snowball Simulation (Exact Share Accumulation & Magic Number Tracker)
  const fiiSnowball = useMemo(() => {
    const fiiAsset =
      TOP_FIIS_2026.find((f) => f.ticker === selectedFiiTicker) || TOP_FIIS_2026[0];
    const fiiInitCapital = sim.c3Init * (fiiShareOfBox3Pct / 100);
    const fiiMonthlyDeposit = sim.c3Monthly * (fiiShareOfBox3Pct / 100);

    let shares = Math.floor(fiiInitCapital / fiiAsset.price);
    let cashLeftover = fiiInitCapital - shares * fiiAsset.price;
    let totalDividendsReinvested = 0;
    let freeSharesFromDividends = 0;
    let magicNumberReachedMonth: number | null =
      shares >= fiiAsset.magicNumberShares ? 0 : null;

    const history: {
      month: number;
      shares: number;
      monthlyDividendIncome: number;
      patrimony: number;
      freeSharesTotal: number;
    }[] = [];

    for (let m = 1; m <= months; m++) {
      const dividendReceived = shares * fiiAsset.monthlyDividend;
      totalDividendsReinvested += dividendReceived;

      const availableForNewShares = cashLeftover + fiiMonthlyDeposit + dividendReceived;
      const newShares = Math.floor(availableForNewShares / fiiAsset.price);
      const sharesFromDivThisMonth = Math.floor(
        (dividendReceived + cashLeftover) / fiiAsset.price
      );
      if (sharesFromDivThisMonth > 0) {
        freeSharesFromDividends += sharesFromDivThisMonth;
      }

      shares += newShares;
      cashLeftover = availableForNewShares - newShares * fiiAsset.price;

      if (magicNumberReachedMonth === null && shares >= fiiAsset.magicNumberShares) {
        magicNumberReachedMonth = m;
      }

      history.push({
        month: m,
        shares,
        monthlyDividendIncome: shares * fiiAsset.monthlyDividend,
        patrimony: shares * fiiAsset.price + cashLeftover,
        freeSharesTotal: freeSharesFromDividends,
      });
    }

    const finalState = history[history.length - 1] || {
      month: 0,
      shares,
      monthlyDividendIncome: shares * fiiAsset.monthlyDividend,
      patrimony: shares * fiiAsset.price + cashLeftover,
      freeSharesTotal: 0,
    };

    const estimatedCondoFeeJaragua = 380; // Condomínio médio em Jaraguá do Sul (MCMV clube)
    const condoCoveragePct = Math.min(
      100,
      (finalState.monthlyDividendIncome / estimatedCondoFeeJaragua) * 100
    );

    return {
      fiiAsset,
      fiiInitCapital,
      fiiMonthlyDeposit,
      finalShares: finalState.shares,
      finalMonthlyDividend: finalState.monthlyDividendIncome,
      finalPatrimony: finalState.patrimony,
      totalDividendsReinvested,
      freeSharesFromDividends,
      magicNumberReachedMonth,
      condoCoveragePct,
      history,
    };
  }, [selectedFiiTicker, fiiShareOfBox3Pct, sim.c3Init, sim.c3Monthly, months]);

  const completedChecks = Object.values(checkedIds).filter(Boolean).length;

  return (
    <div className="min-h-screen pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Jaraguá do Sul • SC
                </span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  ● {market.source === "BCB_LIVE" ? "Conectado ao Banco Central" : "Dados Copom/BCB"}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Planejador Imobiliário & Patrimonial ({userName} & {partnerName})
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={syncMarketData}
              disabled={loadingMarket}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition"
              title="Buscar Selic, CDI, IPCA e INCC atualizados na API do Banco Central do Brasil"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingMarket ? "animate-spin" : ""}`}
              />
              <span className="hidden md:inline">Atualizar Mercado (BCB)</span>
            </button>

            <button
              onClick={handleShareSimulation}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Link Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar c/ {partnerName}</span>
                </>
              )}
            </button>

            <button
              onClick={resetDefaults}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Restaurar valores originais"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              aria-label="Alternar tema"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Live Market Ticker Bar */}
        <div className="bg-slate-100/90 dark:bg-slate-950/90 border-t border-slate-200/70 dark:border-slate-800/80 px-4 sm:px-6 py-1.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <span>
                <strong className="text-slate-700 dark:text-slate-300">Selic:</strong>{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {market.selic.toFixed(2).replace(".", ",")}% a.a.
                </span>
              </span>
              <span>
                <strong className="text-slate-700 dark:text-slate-300">CDI:</strong>{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {market.cdi.toFixed(2).replace(".", ",")}% a.a.
                </span>
              </span>
              <span>
                <strong className="text-slate-700 dark:text-slate-300">IPCA (12m):</strong>{" "}
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {market.ipca12m.toFixed(2).replace(".", ",")}%
                </span>
              </span>
              <span>
                <strong className="text-slate-700 dark:text-slate-300">INCC Obra (12m):</strong>{" "}
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {market.incc12m.toFixed(2).replace(".", ",")}%
                </span>
              </span>
              <span>
                <strong className="text-slate-700 dark:text-slate-300">MXRF11 / KNSC11:</strong>{" "}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ~13,7% a.a. (Isento)
                </span>
              </span>
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              Imóvel Cotado:{" "}
              <strong className="text-slate-900 dark:text-white">
                {activeProperty.name} ({fmtBRL(propPrice)})
              </strong>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Global Interactive Controls Panel */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-500" />
                Parâmetros do Casal & Imóvel Selecionado em Jaraguá do Sul
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajuste os controles abaixo: todas as abas (Imóveis de Jaraguá, Ranking Renda Fixa e Bola de Neve de FIIs) atualizam na hora.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value || "Você")}
                className="w-24 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                placeholder="Seu nome"
              />
              <span className="text-slate-400">&</span>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value || "Namorada")}
                className="w-28 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                placeholder="Nome dela"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Coluna 1: Você */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-blue-500" />
                  {userName} (Base Atual)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
                  10k 120% + 50k 100% CDI
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Patrimônio Total Hoje:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{fmtBRL(userInit)}</span>
                </div>
                <input
                  type="range"
                  min={30000}
                  max={150000}
                  step={2500}
                  value={userInit}
                  onChange={(e) => setUserInit(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Reserva Blindada (Caixa 1):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {fmtBRL(sim.c1Init)}
                  </span>
                </div>
                <input
                  type="range"
                  min={15000}
                  max={60000}
                  step={2500}
                  value={userRes}
                  onChange={(e) => setUserRes(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Aporte Mensal ({userName}):</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {fmtBRL(userMonthly)}/mês
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={8000}
                  step={100}
                  value={userMonthly}
                  onChange={(e) => setUserMonthly(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Renda Bruta ({userName}):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {fmtBRL(userIncome)}/mês
                  </span>
                </div>
                <input
                  type="range"
                  min={2500}
                  max={15000}
                  step={250}
                  value={userIncome}
                  onChange={(e) => setUserIncome(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            {/* Coluna 2: Namorada */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-500" />
                  {partnerName} (Participação)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium">
                  Soma Forças
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">
                    Capital Inicial ({partnerName}):
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{fmtBRL(partInit)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={1000}
                  value={partInit}
                  onChange={(e) => setPartInit(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">
                    Aporte Mensal ({partnerName}):
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {fmtBRL(partMonthly)}/mês
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6000}
                  step={100}
                  value={partMonthly}
                  onChange={(e) => setPartMonthly(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">
                    Renda Bruta ({partnerName}):
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {fmtBRL(partIncome)}/mês
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15000}
                  step={250}
                  value={partIncome}
                  onChange={(e) => setPartIncome(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Aporte Conjunto do Casal:
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {fmtBRL(sim.coupleMonthly)}/mês
                </span>
              </div>
            </div>

            {/* Coluna 3: Imóvel em Jaraguá do Sul */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  Cotação Jaraguá do Sul
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium">
                  {propPrice <= 400000 ? "MCMV Faixa 3" : "Faixa 4 / SFH"}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Valor do Imóvel Cotado:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {fmtBRL(propPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min={300000}
                  max={550000}
                  step={2000}
                  value={propPrice}
                  onChange={(e) => setPropPrice(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Prazo Obra / Acumulação:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {months} meses ({(months / 12).toFixed(1).replace(".0", "")} anos)
                  </span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={60}
                  step={6}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Divisão do Aporte Mensal:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {splitImovelPct}% Imóvel / {100 - splitImovelPct}% Caixa 3
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={90}
                  step={5}
                  value={splitImovelPct}
                  onChange={(e) => setSplitImovelPct(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Sinal Ato ({signalPct}%) / Hoje na Caixa 2:
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {fmtBRL(sim.signalAmount)} / {fmtBRL(sim.c2Init)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2" role="tablist">
          {[
            {
              id: "jaragua",
              label: "1. Imóveis: Jaraguá do Sul",
              icon: MapPin,
            },
            {
              id: "mercado",
              label: "2. Ranking Renda Fixa (BCB)",
              icon: Award,
            },
            {
              id: "fiis",
              label: "3. Bola de Neve FIIs (MXRF11 & Top 6)",
              icon: Coins,
            },
            {
              id: "simulador",
              label: "4. Simulador das 3 Caixas & Casal",
              icon: TrendingUp,
            },
            {
              id: "planta",
              label: "5. Pronto vs. Na Planta (INCC)",
              icon: Building2,
            },
            {
              id: "plano",
              label: `6. Checklist (${completedChecks}/${CHECKLIST_ITEMS.length})`,
              icon: CheckSquare,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ==================== TAB 1: IMÓVEIS NA PLANTA EM JARAGUÁ DO SUL - SC ==================== */}
        {activeTab === "jaragua" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Mapeamento Imobiliário Local • Jaraguá do Sul (SC)
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    Cotações Reais de Empreendimentos na Planta e Bairros de Jaraguá do Sul
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Clique em <strong>&ldquo;Cotar e Simular Este Imóvel&rdquo;</strong> para carregar o preço, prazo de obra, sinal e reserva de piso/marcenaria diretamente no plano do casal.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Cadastrar Proposta Visitada em Jaraguá</span>
                </button>
              </div>

              {showAddForm && (
                <form
                  onSubmit={handleAddCustomProperty}
                  className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 text-xs"
                >
                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 mb-1">Nome do Residencial / Prédio:</label>
                    <input
                      type="text"
                      required
                      value={newPropName}
                      onChange={(e) => setNewPropName(e.target.value)}
                      placeholder="Ex: Residencial Vista Jaraguá"
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Bairro em Jaraguá:</label>
                    <input
                      type="text"
                      required
                      value={newPropNeighborhood}
                      onChange={(e) => setNewPropNeighborhood(e.target.value)}
                      placeholder="Ex: Vila Lenzi"
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Valor Tabelado (R$):</label>
                    <input
                      type="number"
                      required
                      min={200000}
                      max={1500000}
                      step={1000}
                      value={newPropPrice}
                      onChange={(e) => setNewPropPrice(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Área (m²) / Prazo (meses):</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        required
                        min={30}
                        max={200}
                        value={newPropArea}
                        onChange={(e) => setNewPropArea(Number(e.target.value))}
                        className="w-1/2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                      />
                      <input
                        type="number"
                        required
                        min={6}
                        max={60}
                        value={newPropMonths}
                        onChange={(e) => setNewPropMonths(Number(e.target.value))}
                        className="w-1/2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                    >
                      Salvar & Simular
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allProperties.map((prop) => {
                const isSelected = prop.id === selectedPropId;
                const pricePerM2 = prop.price / prop.areaM2;
                const signalVal = (prop.price * prop.signalPct) / 100;
                const restEntryVal = (prop.price * (prop.downPaymentPct - prop.signalPct)) / 100;
                const monthlyDuringWork =
                  (restEntryVal / prop.deliveryMonths) *
                  (1 + (inccAnnual / 100) * (prop.deliveryMonths / 24));
                const signalCoveredToday = sim.c2Init >= signalVal;

                return (
                  <div
                    key={prop.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition ${
                      isSelected
                        ? "border-2 border-blue-600 ring-2 ring-blue-500/20"
                        : "border border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs mb-2">
                        <span className="px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          📍 {prop.neighborhood}
                        </span>
                        <div className="flex items-center gap-1">
                          {prop.price <= 400000 ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                              MCMV Faixa 3
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                              Faixa 4 / SFH
                            </span>
                          )}
                          {prop.isCustom && (
                            <button
                              onClick={() => handleDeleteCustomProp(prop.id)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                              title="Remover cotação"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {prop.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {prop.builder} • {prop.areaM2} m² ({fmtBRL(pricePerM2)}/m²) •{" "}
                        {prop.deliveryMonths} meses
                      </p>

                      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Valor do Imóvel:</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {fmtBRL(prop.price)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">
                            Sinal no Ato ({prop.signalPct}%):
                          </span>
                          <span
                            className={`font-bold ${
                              signalCoveredToday
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {fmtBRL(signalVal)}{" "}
                            {signalCoveredToday ? "(Vocês já têm!)" : "(Juntar +um pouco)"}
                          </span>
                        </div>
                        {prop.financingType !== "Pronto" ? (
                          <div className="flex justify-between">
                            <span className="text-slate-500">
                              Mensais Obra ({prop.deliveryMonths}x c/ INCC):
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              ~{fmtBRL(monthlyDuringWork)}/mês
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Modalidade:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              Juntar a 11,5% a.a. + Comprar Pronto
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">Reserva Piso/Móveis nas Chaves:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {fmtBRL(prop.recommendedFinishReserve)}
                          </span>
                        </div>
                      </div>

                      <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        {prop.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => selectJaraguaProperty(prop)}
                      className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Imóvel Selecionado na Simulação</span>
                        </>
                      ) : (
                        <>
                          <span>Cotar e Simular Este Imóvel</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                🗺️ Raio-X do Metro Quadrado (m²) por Bairro em Jaraguá do Sul - SC
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Use esta tabela como referência quando um corretor apresentar um apartamento na planta em Jaraguá do Sul para saber se o preço por m² está justo:
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <th className="py-2.5 pr-4 font-semibold">Bairros (Jaraguá do Sul)</th>
                      <th className="py-2.5 px-4 font-semibold">Perfil dos Lançamentos</th>
                      <th className="py-2.5 px-4 font-semibold">Faixa de Valor / m²</th>
                      <th className="py-2.5 px-4 font-semibold">Tíquete Médio (2 Quartos)</th>
                      <th className="py-2.5 pl-4 font-semibold">Enquadramento MCMV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {JARAGUA_NEIGHBORHOODS.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white">
                          {b.neighborhood}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {b.profile}
                        </td>
                        <td className="py-3 px-4 font-semibold text-blue-600 dark:text-blue-400">
                          {fmtBRL(b.avgPriceM2Min)} a {fmtBRL(b.avgPriceM2Max)}/m²
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {b.typicalTicket2Bed}
                        </td>
                        <td className="py-3 pl-4">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold ${
                              b.mcmvFit.includes("Alto")
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                                : b.mcmvFit.includes("Médio")
                                ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {b.mcmvFit}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: RANKING DO MERCADO FINANCEIRO ==================== */}
        {activeTab === "mercado" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Radar de Renda Fixa & Juro Real • Atualizado ({market.lastUpdated})
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    O Que Está Compensando Mais na Renda Fixa para {months} Meses?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Ranking líquido já descontando o Imposto de Renda ({(getIrRateForMonths(months) * 100).toFixed(1).replace(".0", "")}% para {months} meses) e a inflação IPCA ({market.ipca12m.toFixed(2).replace(".", ",")}% a.a.).
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="w-48">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Selic / CDI Base:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {market.selic.toFixed(2).replace(".", ",")}% a.a.
                      </span>
                    </div>
                    <input
                      type="range"
                      min={9.0}
                      max={15.5}
                      step={0.25}
                      value={market.selic}
                      onChange={(e) => {
                        const s = Number(e.target.value);
                        setMarket({ ...market, selic: s, cdi: Math.max(0.1, s - 0.1) });
                      }}
                      className="w-full cursor-pointer"
                    />
                  </div>

                  <div className="w-48">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Taxa LCI/LCA Isenta:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {lciRate}% do CDI
                      </span>
                    </div>
                    <input
                      type="range"
                      min={85}
                      max={100}
                      step={1}
                      value={lciRate}
                      onChange={(e) => setLciRate(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <th className="py-2.5 pr-3 font-semibold">#</th>
                      <th className="py-2.5 px-3 font-semibold">Investimento</th>
                      <th className="py-2.5 px-3 font-semibold">Caixa Ideal</th>
                      <th className="py-2.5 px-3 font-semibold">Taxa Bruta</th>
                      <th className="py-2.5 px-3 font-semibold">Desconto IR</th>
                      <th className="py-2.5 px-3 font-semibold">Líquido no Bolso (% a.a.)</th>
                      <th className="py-2.5 px-3 font-semibold">Ganho Real (Acima IPCA)</th>
                      <th className="py-2.5 px-3 font-semibold">R$ 10.000 viram ({months}m)</th>
                      <th className="py-2.5 pl-3 font-semibold">Veredito CIO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {assetRanking.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                          idx < 2 ? "bg-emerald-50/30 dark:bg-emerald-950/15" : ""
                        }`}
                      >
                        <td className="py-3 pr-3 font-extrabold text-slate-900 dark:text-white">
                          {idx + 1}º
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {item.name}
                          <div className="text-[12px] font-normal text-slate-400">
                            {item.fgcOrSovereign} • Liquidez: {item.liquidity}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold ${
                              item.recommendedBox.includes("Caixa 2")
                                ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                                : item.recommendedBox.includes("Caixa 3")
                                ? "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300"
                                : item.recommendedBox.includes("Caixa 1")
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                                : "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300"
                            }`}
                          >
                            {item.recommendedBox}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium">
                          {item.grossAnnualPct.toFixed(2).replace(".", ",")}% a.a.
                        </td>
                        <td className="py-3 px-3">
                          {item.irPct === 0 ? (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              Isento (0%)
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              {item.irPct.toFixed(1).replace(".0", "")}%
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-extrabold text-sm text-blue-600 dark:text-blue-400">
                          {item.netAnnualPct.toFixed(2).replace(".", ",")}% a.a.
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                          +{item.realAnnualPctOverIpca.toFixed(2).replace(".", ",")}% a.a.
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {fmtBRL(item.netValueOn10kAfterMonths)}
                        </td>
                        <td className="py-3 pl-3 text-slate-600 dark:text-slate-300 max-w-xs">
                          {item.cioVerdict}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                Conversor Rápido de Bolso: LCI/LCA (Isenta) vs. CDB (Tributado)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-center">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Taxa da LCI ou LCA no App:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {lciRate}% do CDI
                    </span>
                  </div>
                  <input
                    type="range"
                    min={82}
                    max={102}
                    step={1}
                    value={lciRate}
                    onChange={(e) => setLciRate(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <label className="block text-xs text-slate-500 mb-1.5">
                    Prazo até resgatar (Alíquota de IR no CDB):
                  </label>
                  <select
                    value={irBracket}
                    onChange={(e) => setIrBracket(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value={0.225}>Até 6 meses (IR de 22,5% no CDB)</option>
                    <option value={0.2}>De 6 meses a 1 ano (IR de 20,0% no CDB)</option>
                    <option value={0.175}>De 1 a 2 anos (IR de 17,5% no CDB)</option>
                    <option value={0.15}>Acima de 2 anos (IR de 15,0% no CDB)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-blue-600 text-white">
                  <div className="text-xs opacity-90">
                    Para empatar com essa LCI/LCA ({lciRate}% CDI), o CDB precisa pagar:
                  </div>
                  <div className="text-lg font-extrabold mt-0.5">
                    {(lciRate / (1 - irBracket)).toFixed(1).replace(".", ",")}% do CDI Bruto
                  </div>
                  <div className="text-xs opacity-90 mt-0.5">
                    Retorno líquido no bolso:{" "}
                    <strong>
                      {((lciRate / 100) * market.cdi).toFixed(2).replace(".", ",")}% ao ano
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: BOLA DE NEVE FIIs (MXRF11 & TOP 6) ==================== */}
        {activeTab === "fiis" && (
          <div className="space-y-6">
            {/* Snowball Interactive Simulator Banner */}
            <div className="bg-white dark:bg-slate-900 border-2 border-purple-600 rounded-2xl p-5 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Simulador Bola de Neve (Caixa 3 do Casal) • Isento de IR
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    Quantas Cotas e Quanto de Aluguel Mensal Vocês Terão ao Pegar as Chaves?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Enquanto a Caixa 2 garante o apartamento em Jaraguá do Sul em Renda Fixa, a Caixa 3 acumula FIIs reinvestindo 100% dos dividendos todo mês:
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  <div className="w-52">
                    <label className="block text-xs text-slate-500 mb-1">
                      Escolha o FII para Simular:
                    </label>
                    <select
                      value={selectedFiiTicker}
                      onChange={(e) => setSelectedFiiTicker(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {TOP_FIIS_2026.map((f) => (
                        <option key={f.ticker} value={f.ticker}>
                          {f.ticker} — {f.name} ({fmtBRLCents(f.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-52">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">% da Caixa 3 em FIIs:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {fiiShareOfBox3Pct}% ({fmtBRL(fiiSnowball.fiiMonthlyDeposit)}/mês)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={25}
                      max={100}
                      step={5}
                      value={fiiShareOfBox3Pct}
                      onChange={(e) => setFiiShareOfBox3Pct(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 4 Snowball Result Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 font-medium">
                    Total de Cotas de {fiiSnowball.fiiAsset.ticker} em {months}m
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {fiiSnowball.finalShares} cotas
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Patrimônio em {fiiSnowball.fiiAsset.ticker}:{" "}
                    <strong>{fmtBRL(fiiSnowball.finalPatrimony)}</strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 font-medium">
                    Mágica dos Juros: Cotas &ldquo;Grátis&rdquo;
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    +{fiiSnowball.freeSharesFromDividends} cotas
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Compradas sozinhas com{" "}
                    <strong>{fmtBRL(fiiSnowball.totalDividendsReinvested)}</strong> de dividendos!
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 font-medium">
                    🎯 Magic Number ({fiiSnowball.fiiAsset.magicNumberShares} cotas)
                  </div>
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                    {fiiSnowball.magicNumberReachedMonth === 0
                      ? "No 1º Dia!"
                      : fiiSnowball.magicNumberReachedMonth !== null
                      ? `No Mês ${fiiSnowball.magicNumberReachedMonth}!`
                      : `Faltam ${
                          fiiSnowball.fiiAsset.magicNumberShares - fiiSnowball.finalShares
                        } cotas`}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Capital p/ 1 cota grátis/mês:{" "}
                    <strong>{fmtBRL(fiiSnowball.fiiAsset.magicNumberCapital)}</strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-purple-600 text-white">
                  <div className="text-xs opacity-90 font-medium">
                    Aluguel Mensal Isento nas Chaves ({months}m)
                  </div>
                  <div className="text-2xl font-extrabold mt-1">
                    {fmtBRLCents(fiiSnowball.finalMonthlyDividend)}/mês
                  </div>
                  <div className="text-xs opacity-90 mt-1">
                    Já paga <strong>{fiiSnowball.condoCoveragePct.toFixed(0)}%</strong> do condomínio em Jaraguá do Sul!
                  </div>
                </div>
              </div>
            </div>

            {/* Curated Recommendation: Why Combine MXRF11 with KNSC11, BTLG11 & XPML11 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Seleção CNPI • Melhores FIIs para Acompanhar o MXRF11
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    Quais FIIs Estão Compensando Mais Hoje (P/VP Descontado + Qualidade Alta)?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    O segredo para não depender só do <strong>MXRF11</strong> é montar o <strong>Quarteto Equilibrado (25% em cada)</strong>: 2 FIIs de Papel Base 10 (para bola de neve rápida) + 2 FIIs de Tijolo Descontados (para os imóveis subirem com a inflação):
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {TOP_FIIS_2026.map((fii) => {
                  const isActive = fii.ticker === selectedFiiTicker;
                  const discountPct = Math.round((1 - fii.pvp) * 100);

                  return (
                    <div
                      key={fii.ticker}
                      className={`p-5 rounded-2xl flex flex-col justify-between transition ${
                        isActive
                          ? "bg-purple-50/40 dark:bg-purple-950/20 border-2 border-purple-600"
                          : "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-xs mb-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold ${
                              fii.category === "Papel"
                                ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                                : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                            }`}
                          >
                            {fii.segment}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                            P/VP {fii.pvp.toFixed(2).replace(".", ",")}x (-{discountPct}%)
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between">
                          <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                            {fii.ticker}
                          </h4>
                          <span className="text-xs font-semibold text-slate-500">
                            {fii.manager}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {fii.name}
                        </p>

                        <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Preço da Cota:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {fmtBRLCents(fii.price)}{" "}
                              {fii.isBase10 && (
                                <span className="text-blue-600 dark:text-blue-400">
                                  (Base 10)
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Último Dividendo Mensal:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {fmtBRLCents(fii.monthlyDividend)} / cota (Isento)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Dividend Yield (12m):</span>
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">
                              {fii.dy12m.toFixed(2).replace(".", ",")}% a.a.
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Magic Number (1 cota/mês):</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {fii.magicNumberShares} cotas ({fmtBRL(fii.magicNumberCapital)})
                            </span>
                          </div>
                        </div>

                        <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                          {fii.pros.map((p, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-3 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
                          <strong>Veredito CNPI:</strong> {fii.cnpiVerdict}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedFiiTicker(fii.ticker)}
                        className={`mt-4 w-full py-2 px-3 rounded-xl text-xs font-bold transition ${
                          isActive
                            ? "bg-purple-600 text-white"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-purple-600 hover:text-white"
                        }`}
                      >
                        {isActive
                          ? `Simulando ${fii.ticker} na Bola de Neve Acima`
                          : `Simular ${fii.ticker} na Bola de Neve`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: SIMULADOR DAS 3 CAIXAS & CASAL ==================== */}
        {activeTab === "simulador" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Caixa 1 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Caixa 1 • Reserva
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium">
                      Intocável
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Reserva de Emergência
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    CDB 100% CDI Liquidez Diária / Tesouro Selic. Rendendo{" "}
                    <strong>{sim.c1NetAnnual.toFixed(2).replace(".", ",")}% a.a. líq.</strong>
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500">
                    Hoje: <strong className="text-slate-800 dark:text-slate-200">{fmtBRL(sim.c1Init)}</strong>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {fmtBRL(sim.cur1)}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    +{fmtBRL(sim.cur1 - sim.c1Init)} só de juros em {months}m
                  </div>
                </div>
              </div>

              {/* Caixa 2 */}
              <div className="bg-white dark:bg-slate-900 border-2 border-blue-600 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Home className="w-4 h-4" /> Caixa 2 • Imóvel Jaraguá
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        sim.cur2 >= sim.targetPronto
                          ? "bg-blue-600 text-white"
                          : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {sim.cur2 >= sim.targetPronto ? "Meta Atingida!" : "Em Construção"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeProperty.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    10k CDB 120% CDI + 15k 100% CDI +{" "}
                    <strong>{fmtBRL(sim.c2Monthly)}/mês</strong> em LCI/LCA ({lciRate}% CDI isenta).
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500">
                    Hoje (Casal):{" "}
                    <strong className="text-slate-800 dark:text-slate-200">{fmtBRL(sim.c2Init)}</strong>
                  </div>
                  <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                    {fmtBRL(sim.cur2)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Meta 20% Entrada + 5% ITBI/Docs: <strong>{fmtBRL(sim.targetPronto)}</strong>
                  </div>
                </div>
              </div>

              {/* Caixa 3 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> Caixa 3 • FIIs + IPCA+
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-medium">
                      Bola de Neve
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Crescimento & Renda Mensal
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    50% Tesouro IPCA+ 2032 + 50% Carteira FIIs (MXRF11, KNSC11, BTLG11, XPML11). Recebe{" "}
                    <strong>{fmtBRL(sim.c3Monthly)}/mês</strong>.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500">
                    Hoje: <strong className="text-slate-800 dark:text-slate-200">{fmtBRL(sim.c3Init)}</strong>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {fmtBRL(sim.cur3)}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                    Gera dividendos mensais isentos nas chaves!
                  </div>
                </div>
              </div>

              {/* Sobra Pós-Compra */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> Pós-Chaves
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium">
                      Patrimônio Livre
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Sobra Líquida Após Comprar
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Quanto resta investido após pagar Entrada (20%) + ITBI/Cartório (5%) de{" "}
                    <strong>{activeProperty.name}</strong>.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500">
                    Total Acumulado:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {fmtBRL(sim.totalFinal)}
                    </strong>
                  </div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {fmtBRL(Math.max(0, sim.leftoverPronto))}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {sim.leftoverPronto >= sim.cur1 + reformaCost
                      ? `Cobre Reserva + ${fmtBRL(reformaCost)} Piso/Móveis + Sobra!`
                      : `Preserva a Reserva de ${fmtBRL(sim.cur1)}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Evolution Chart + Couple Share */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Curva de Acumulação das 3 Caixas ({months} meses)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Simulação para {activeProperty.name} ({fmtBRL(propPrice)}) em Jaraguá do Sul
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                        Patrimônio Total
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
                        Caixa 2 (Imóvel)
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-amber-500 inline-block" />
                        Meta Entrada+ITBI ({fmtBRL(sim.targetPronto)})
                      </span>
                    </div>
                  </div>

                  <div className="w-full overflow-hidden pt-2">
                    {(() => {
                      const w = 680;
                      const h = 250;
                      const padL = 70;
                      const padR = 20;
                      const padT = 20;
                      const padB = 34;
                      const plotW = w - padL - padR;
                      const plotH = h - padT - padB;
                      const maxVal =
                        Math.max(...sim.totalSeries, sim.targetPlanta) * 1.08;

                      const toX = (idx: number) => padL + (idx / months) * plotW;
                      const toY = (val: number) =>
                        padT + plotH - (val / maxVal) * plotH;

                      const makePath = (series: number[]) =>
                        series
                          .map(
                            (v, i) =>
                              `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`
                          )
                          .join(" ");

                      const makeArea = (series: number[]) =>
                        `${makePath(series)} L ${toX(months).toFixed(1)} ${(padT + plotH).toFixed(1)} L ${padL} ${(padT + plotH).toFixed(1)} Z`;

                      const targetY = toY(sim.targetPronto);

                      return (
                        <svg
                          viewBox={`0 0 ${w} ${h}`}
                          className="w-full h-auto select-none"
                        >
                          {[0, 0.25, 0.5, 0.75, 1].map((step, i) => {
                            const val = maxVal * step;
                            const y = toY(val);
                            return (
                              <g key={i}>
                                <line
                                  x1={padL}
                                  y1={y}
                                  x2={w - padR}
                                  y2={y}
                                  stroke="currentColor"
                                  className="text-slate-200 dark:text-slate-800"
                                  strokeWidth="1"
                                />
                                <text
                                  x={8}
                                  y={y + 4}
                                  className="fill-slate-400 dark:fill-slate-500 text-[12px]"
                                >
                                  R$ {Math.round(val / 1000)}k
                                </text>
                              </g>
                            );
                          })}

                          {[0, 0.25, 0.5, 0.75, 1].map((step, i) => {
                            const m = Math.round(months * step);
                            const x = toX(m);
                            return (
                              <text
                                key={i}
                                x={x - 18}
                                y={h - 8}
                                className="fill-slate-400 dark:fill-slate-500 text-[12px]"
                              >
                                Mês {m}
                              </text>
                            );
                          })}

                          <path
                            d={makeArea(sim.totalSeries)}
                            fill="rgba(16, 185, 129, 0.14)"
                          />
                          <path
                            d={makePath(sim.totalSeries)}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                          />

                          <path
                            d={makeArea(sim.c2Series)}
                            fill="rgba(59, 130, 246, 0.22)"
                          />
                          <path
                            d={makePath(sim.c2Series)}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2.5"
                          />

                          <line
                            x1={padL}
                            y1={targetY}
                            x2={w - padR}
                            y2={targetY}
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeDasharray="6 4"
                          />
                        </svg>
                      );
                    })()}
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-bold text-blue-900 dark:text-blue-200">
                      🏦 Enquadramento Caixa em Jaraguá do Sul (Renda Bruta: {fmtBRL(sim.combinedIncome)})
                    </div>
                    <div className="text-blue-800 dark:text-blue-300 mt-0.5">
                      {sim.mcmvStatus}
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 font-bold text-blue-700 dark:text-blue-300 shrink-0">
                    Juros: {sim.estimatedRate}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    Divisão Proporcional no Contrato
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Participação justa calculada sobre o capital alocado nas Caixas 2 e 3 ao longo de {months} meses.
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          👤 {userName}
                        </span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">
                          {sim.userSharePct.toFixed(1).replace(".", ",")}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${sim.userSharePct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>
                          Inicial: {fmtBRL(Math.max(0, userInit - sim.c1Init))} + {fmtBRL(userMonthly)}/mês
                        </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {fmtBRL(sim.userCommitted)}
                        </strong>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          👩‍❤️‍👨 {partnerName}
                        </span>
                        <span className="font-extrabold text-purple-600 dark:text-purple-400">
                          {sim.partSharePct.toFixed(1).replace(".", ",")}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-300"
                          style={{ width: `${sim.partSharePct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>
                          Inicial: {fmtBRL(partInit)} + {fmtBRL(partMonthly)}/mês
                        </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {fmtBRL(sim.partCommitted)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <Info className="w-4 h-4 text-blue-500 shrink-0" />
                    Dica de Governança do Casal:
                  </div>
                  <p>
                    Cada um aplica o próprio aporte mensal em uma LCI/LCA no seu próprio CPF. Além de facilitar o controle da participação, vocês dobram a garantia do FGC (R$ 250 mil para cada CPF).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: RAIO-X PRONTO VS. NA PLANTA ==================== */}
        {activeTab === "planta" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Comparador para {activeProperty.name} ({fmtBRL(propPrice)}) em Jaraguá do Sul
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Sem saldo de FGTS • Teste abaixo o impacto do INCC ({inccAnnual.toFixed(2).replace(".", ",")}% a.a.) e do Kit Chaves (Piso + Móveis):
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="w-52">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">INCC Anual Estimado:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {inccAnnual.toFixed(2).replace(".", ",")}% a.a.
                      </span>
                    </div>
                    <input
                      type="range"
                      min={3.5}
                      max={9.0}
                      step={0.25}
                      value={inccAnnual}
                      onChange={(e) => setInccAnnual(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                  </div>

                  <div className="w-56">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Kit Chaves (Piso/Móveis):</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {fmtBRL(reformaCost)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10000}
                      max={60000}
                      step={2000}
                      value={reformaCost}
                      onChange={(e) => setReformaCost(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Estratégia A • Juros a Seu Favor
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                      Juntar em LCI/LCA ({sim.c2NetAnnual.toFixed(1).replace(".", ",")}% a.a.) + Comprar Pronto
                    </h4>
                    <ul className="mt-4 space-y-2 text-xs">
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Entrada (20%):</span>
                        <span className="font-bold">{fmtBRL(sim.downPayment20)}</span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">ITBI Jaraguá + Cartório (~5%):</span>
                        <span className="font-bold">{fmtBRL(sim.docsItbi5)}</span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Juros Ganhos na Caixa 2:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          + {fmtBRL(sim.c2InterestEarned)}
                        </span>
                      </li>
                      <li className="flex justify-between py-1">
                        <span className="text-slate-500">Taxa de Evolução de Obra:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          R$ 0 (Zero)
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <strong>Vantagem:</strong> Os juros compostos rendem{" "}
                    <strong>+{fmtBRL(sim.c2InterestEarned)}</strong> livres para ajudar a pagar o apartamento.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-blue-600 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                      Estratégia B • Melhor Formato na Planta
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                      Na Planta c/ Crédito Associativo (Caixa MCMV)
                    </h4>
                    <ul className="mt-4 space-y-2 text-xs">
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Sinal no Ato ({signalPct}%):</span>
                        <span className="font-bold">{fmtBRL(sim.signalAmount)}</span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Mensais Construtora ({months}x):</span>
                        <span className="font-bold">~{fmtBRL(sim.avgBuilderMonthly)}/mês</span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Juros Evolução de Obra ({months}m):</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          - {fmtBRL(sim.totalObraEvolutionFee)}
                        </span>
                      </li>
                      <li className="flex justify-between py-1">
                        <span className="text-slate-500">Saldo Financiado (80%):</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          Congelado em {fmtBRL(sim.financed80)}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <strong>Como executar em Jaraguá:</strong> Vocês pagam o sinal de{" "}
                    <strong>{fmtBRL(sim.signalAmount)}</strong> com a Caixa 2 atual e guardam o excedente em LCI/LCA para o Kit Chaves ({fmtBRL(reformaCost)}).
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300">
                      Estratégia C • Cuidado com o INCC
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                      Na Planta Direto (Financiamento Só nas Chaves)
                    </h4>
                    <ul className="mt-4 space-y-2 text-xs">
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Saldo Financiado Original (80%):</span>
                        <span className="font-bold">{fmtBRL(sim.financed80)}</span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Saldo c/ INCC ({inccAnnual.toFixed(1)}% a.a.):</span>
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {fmtBRL(sim.inccCorrectedDebt80)}
                        </span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Aumento da Dívida na Obra:</span>
                        <span className="font-bold text-red-600 dark:text-red-400">
                          + {fmtBRL(sim.inccDebtIncrease)}
                        </span>
                      </li>
                      <li className="flex justify-between py-1">
                        <span className="text-slate-500">ITBI + Kit Chaves na Entrega:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {fmtBRL(sim.docsItbi5 + reformaCost)}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <strong>Regra de Ouro:</strong> Como sua LCI/LCA rende{" "}
                    <strong>{((lciRate / 100) * market.cdi).toFixed(1)}% a.a.</strong> contra{" "}
                    <strong>{inccAnnual.toFixed(1)}% a.a.</strong> do INCC, deixe o dinheiro rendendo no banco e abata o saldo na entrega!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 6: ROTINA MENSAL & CHECKLIST ==================== */}
        {activeTab === "plano" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  📅 Roteiro do Dia do Salário ({fmtBRL(sim.coupleMonthly)}/mês)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Divisão mensal exata para o projeto <strong>{activeProperty.name}</strong>:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      1. Caixa 1 — Reserva Blindada
                    </div>
                    <div className="text-slate-500">
                      Completa em {fmtBRL(sim.c1Init)} (CDB 100% CDI Liquidez Diária)
                    </div>
                  </div>
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    R$ 0/mês
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border-2 border-blue-600 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      2. Caixa 2 — Imóvel Jaraguá (LCI/LCA {lciRate}% CDI)
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                      {userName}: <strong>{fmtBRL((userMonthly * splitImovelPct) / 100)}</strong> +{" "}
                      {partnerName}: <strong>{fmtBRL((partMonthly * splitImovelPct) / 100)}</strong>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                    {fmtBRL(sim.c2Monthly)}/mês
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      3A. Caixa 3 — Tesouro IPCA+ 2032
                    </div>
                    <div className="text-slate-500">
                      Juro real de IPCA + {market.tesouroIpcaReal.toFixed(2).replace(".", ",")}% a.a.
                    </div>
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {fmtBRL(sim.c3Monthly * (1 - fiiShareOfBox3Pct / 100))}/mês
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-500 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      3B. Caixa 3 — Carteira FIIs (MXRF11, KNSC11, BTLG11, XPML11)
                    </div>
                    <div className="text-slate-500">
                      Bola de neve mensal isenta + reinvestimento de dividendos
                    </div>
                  </div>
                  <span className="font-bold text-sm text-purple-600 dark:text-purple-400">
                    {fmtBRL(sim.c3Monthly * (fiiShareOfBox3Pct / 100))}/mês
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    ✅ Checklist do Casal em Jaraguá do Sul
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Progresso salvo automaticamente no navegador:
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {completedChecks} de {CHECKLIST_ITEMS.length} concluídos
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${(completedChecks / CHECKLIST_ITEMS.length) * 100}%`,
                  }}
                />
              </div>

              <div className="space-y-2.5">
                {CHECKLIST_ITEMS.map((item) => {
                  const isDone = !!checkedIds[item.id];
                  return (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        isDone
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleCheck(item.id)}
                        className="mt-1 w-4 h-4 cursor-pointer"
                      />
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.2 rounded text-[12px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.category}
                          </span>
                          <span
                            className={`font-bold text-slate-900 dark:text-white ${
                              isDone ? "line-through opacity-70" : ""
                            }`}
                          >
                            {item.title}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
