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
  AlertTriangle,
  Sparkles,
  Check,
  Building2,
  Wallet,
  ArrowRight,
  Info,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  desc: string;
  category: "Carteira" | "Casal" | "Imóvel";
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "chk-1",
    category: "Carteira",
    title: "Validar os R$ 10.000 em 120% do CDI",
    desc: "Conferir no aplicativo do banco/corretora a data de vencimento e se possui cobertura do FGC, mantendo esse valor carimbado na Caixa 2 (Imóvel).",
  },
  {
    id: "chk-2",
    category: "Carteira",
    title: "Separar mentalmente os R$ 50.000 atuais (sem pagar IR à toa)",
    desc: "Manter R$ 30.000 como Reserva Blindada (Caixa 1), R$ 15.000 na Caixa 2 (Imóvel) e R$ 5.000 na Caixa 3 (Crescimento) sem resgatar antes de vencer.",
  },
  {
    id: "chk-3",
    category: "Casal",
    title: "Alinhar o Aporte Mensal e a Proporção do Casal",
    desc: "Simular juntos na Aba 1 quanto cada um pode aportar por mês sem sufocar o orçamento e salvar o link da simulação.",
  },
  {
    id: "chk-4",
    category: "Carteira",
    title: "Selecionar LCI/LCA (90%+ do CDI) para os novos aportes da Caixa 2",
    desc: "Todo mês, direcionar a fatia do imóvel para LCI ou LCA isenta de Imposto de Renda com vencimento casado com a data da compra (9 a 24 meses).",
  },
  {
    id: "chk-5",
    category: "Imóvel",
    title: "Checar 36 meses de vínculo CLT (Desconto Cotista FGTS)",
    desc: "Mesmo tendo sacado todo o FGTS, verificar na Carteira de Trabalho Digital se um de vocês soma 3 anos de registro CLT para reduzir 0,5% a.a. nos juros da Caixa.",
  },
  {
    id: "chk-6",
    category: "Imóvel",
    title: "Simular Financiamento em 1 CPF vs. Composição de Renda do Casal",
    desc: "Verificar na Aba 1 se a renda individual ou conjunta enquadra vocês na Faixa 3 do Minha Casa Minha Vida (teto R$ 400 mil, renda até R$ 9.600) ou Faixa 4.",
  },
  {
    id: "chk-7",
    category: "Imóvel",
    title: "Auditar Empreendimentos na Planta (Crédito Associativo + Afetação)",
    desc: "Exigir financiamento via Crédito Associativo (para congelar os 80% contra o INCC), planilha da Taxa de Evolução de Obra e registro de Patrimônio de Afetação.",
  },
  {
    id: "chk-8",
    category: "Carteira",
    title: "Iniciar a Caixa 3 (Tesouro IPCA+ 2032 + ETF Global/FIIs)",
    desc: "Automatizar os 20% a 25% do aporte mensal para a carteira de longo prazo, garantindo que vocês continuem ricos após pagar a entrada do apartamento.",
  },
];

function fmtBRL(value: number): string {
  return Math.round(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export default function PlanejadorCasalPage() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Active tab
  const [activeTab, setActiveTab] = useState<
    "simulador" | "planta" | "guia" | "plano"
  >("simulador");

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

  const [propPrice, setPropPrice] = useState<number>(375000);
  const [months, setMonths] = useState<number>(36);
  const [splitImovelPct, setSplitImovelPct] = useState<number>(75);

  // Tab 2 specific stress-test sliders
  const [inccAnnual, setInccAnnual] = useState<number>(5.5);
  const [reformaCost, setReformaCost] = useState<number>(30000);

  // Tab 3 converter state
  const [lciRate, setLciRate] = useState<number>(91);
  const [irBracket, setIrBracket] = useState<number>(0.175);

  // Checklist state
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Load saved state or URL parameters on mount
  useEffect(() => {
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
      if (savedChecks) {
        setCheckedIds(JSON.parse(savedChecks));
      }

      const params = new URLSearchParams(window.location.search);
      if (params.has("uInit")) {
        setUserInit(Number(params.get("uInit")) || 60000);
        setUserRes(Number(params.get("uRes")) || 30000);
        setUserMonthly(Number(params.get("uMon")) || 2000);
        setUserIncome(Number(params.get("uInc")) || 6500);
        setPartInit(Number(params.get("pInit")) || 0);
        setPartMonthly(Number(params.get("pMon")) || 0);
        setPartIncome(Number(params.get("pInc")) || 4500);
        setPropPrice(Number(params.get("price")) || 375000);
        setMonths(Number(params.get("m")) || 36);
        setSplitImovelPct(Number(params.get("split")) || 75);
        if (params.get("uName")) setUserName(params.get("uName")!);
        if (params.get("pName")) setPartnerName(params.get("pName")!);
      } else {
        const savedState = localStorage.getItem("cio_sim_state");
        if (savedState) {
          const parsed = JSON.parse(savedState);
          setUserInit(parsed.userInit ?? 60000);
          setUserRes(parsed.userRes ?? 30000);
          setUserMonthly(parsed.userMonthly ?? 2000);
          setUserIncome(parsed.userIncome ?? 6500);
          setPartInit(parsed.partInit ?? 5000);
          setPartMonthly(parsed.partMonthly ?? 1000);
          setPartIncome(parsed.partIncome ?? 4500);
          setPropPrice(parsed.propPrice ?? 375000);
          setMonths(parsed.months ?? 36);
          setSplitImovelPct(parsed.splitImovelPct ?? 75);
          if (parsed.userName) setUserName(parsed.userName);
          if (parsed.partnerName) setPartnerName(parsed.partnerName);
        }
      }
    } catch {
      // Ignore storage errors in private mode
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(
        "cio_sim_state",
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
          userName,
          partnerName,
        })
      );
    } catch {
      // Ignore storage errors
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
    userName,
    partnerName,
  ]);

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
    setPropPrice(375000);
    setMonths(36);
    setSplitImovelPct(75);
    setInccAnnual(5.5);
    setReformaCost(30000);
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

  // Core Financial Calculations
  const sim = useMemo(() => {
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

    // Net compound monthly rates (with Selic at 13.75% a.a.)
    const r1 = Math.pow(1 + 0.112, 1 / 12) - 1; // ~11.2% a.a. net (100% CDI after IR)
    const r2 = Math.pow(1 + 0.116, 1 / 12) - 1; // ~11.6% a.a. net (10k at 120% CDI + LCI/LCA 91% CDI tax-free)
    const r3 = Math.pow(1 + 0.114, 1 / 12) - 1; // ~11.4% a.a. net (IPCA+ 2032 + ETF/FIIs)

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
    const targetPronto = downPayment20 + docsItbi5; // 25% total cash needed for ready property
    const targetPlanta = targetPronto + reformaCost; // Includes flooring/cabinetry on delivery

    const totalFinal = cur1 + cur2 + cur3;
    const leftoverPronto = totalFinal - targetPronto;
    const c2InterestEarned = cur2 - (c2Init + c2Monthly * months);

    // Proportional Ownership (Caixa 2 + Caixa 3 contributions)
    const userCommitted = userExRes + userMonthly * months;
    const partCommitted = partInit + partMonthly * months;
    const totalCommitted = Math.max(1, userCommitted + partCommitted);
    const userSharePct = (userCommitted / totalCommitted) * 100;
    const partSharePct = (partCommitted / totalCommitted) * 100;

    // Off-plan (Na Planta) specific math
    const signal8 = propPrice * 0.08;
    const builder12 = propPrice * 0.12;
    const avgBuilderMonthly = (builder12 / months) * (1 + (inccAnnual / 100) * (months / 24));
    const financed80 = propPrice * 0.8;
    const totalObraEvolutionFee = financed80 * 0.0033 * months; // ~0.33% avg of debt per month during construction
    const inccCorrectedDebt80 = financed80 * Math.pow(1 + inccAnnual / 100, months / 12);
    const inccDebtIncrease = inccCorrectedDebt80 - financed80;

    // MCMV / Financing bracket analysis
    const combinedIncome = userIncome + partIncome;
    let mcmvStatus = "";
    let estimatedRate = "";
    if (propPrice <= 400000 && combinedIncome <= 9600) {
      mcmvStatus = "Enquadra no MCMV Faixa 3 (Renda Familiar até R$ 9.600 e Imóvel até R$ 400 mil)";
      estimatedRate = "7,66% a 8,16% a.a. + TR";
    } else if (propPrice <= 400000 && userIncome <= 9600 && combinedIncome > 9600) {
      mcmvStatus =
        "Dica de Ouro: Renda somada passa de R$ 9.600 (Faixa 4), mas em 1 único CPF entra na Faixa 3!";
      estimatedRate = "Faixa 3 (~8,16% a.a.) em 1 CPF vs. Faixa 4 (~10,0% a.a.) compondo renda";
    } else if (propPrice <= 600000 && combinedIncome <= 13000) {
      mcmvStatus = "Enquadra no MCMV Faixa 4 - Classe Média (Renda até R$ 13.000)";
      estimatedRate = "~10,0% a 10,5% a.a. + TR";
    } else {
      mcmvStatus = "Financiamento via SFH Tradicional (Mercado)";
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
      signal8,
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
  ]);

  const completedChecks = Object.values(checkedIds).filter(Boolean).length;

  return (
    <div className="min-h-screen pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Copiloto CIO & CFP®
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Selic: 13,75% a.a. • IPCA+: ~7,9% a.a.
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Planejador do Casal: Imóvel (R$ 350k–400k) + Crescimento Patrimonial
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareSimulation}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
              title="Gera um link com todos os números atuais para enviar no WhatsApp"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Link Copiado p/ WhatsApp!</span>
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Restaurar valores originais (60k inicial, 30k reserva, 2k/mês)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar Base</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              aria-label="Alternar tema claro/escuro"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
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
                Painel de Simulação em Tempo Real ({userName} & {partnerName})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajuste os controles abaixo. Todas as abas, gráficos e cálculos de participação atualizam instantaneamente.
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
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
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
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-500" />
                  {partnerName} (Participação)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium">
                  Simulação Conjunta
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

            {/* Coluna 3: Imóvel & Prazo */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-amber-500" />
                  Meta do Imóvel (Sem FGTS)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium">
                  {propPrice <= 400000 ? "Teto MCMV Faixa 3" : "Faixa 4 / SFH"}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Valor do Imóvel Alvo:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {fmtBRL(propPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min={300000}
                  max={500000}
                  step={5000}
                  value={propPrice}
                  onChange={(e) => setPropPrice(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Prazo (Acumulação / Obra):</span>
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
                    {splitImovelPct}% Imóvel / {100 - splitImovelPct}% Cresc.
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
                  Meta 20% Entrada + 5% ITBI/Docs:
                </span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {fmtBRL(sim.targetPronto)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2" role="tablist">
          {[
            {
              id: "simulador",
              label: "1. Simulador das 3 Caixas & Casal",
              icon: TrendingUp,
            },
            {
              id: "planta",
              label: "2. Imóvel Pronto vs. Na Planta",
              icon: Building2,
            },
            {
              id: "guia",
              label: "3. Guia: O Que e Como Investir",
              icon: BookOpen,
            },
            {
              id: "plano",
              label: `4. Rotina Mensal & Checklist (${completedChecks}/${CHECKLIST_ITEMS.length})`,
              icon: CheckSquare,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm ${
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

        {/* ==================== TAB 1: SIMULADOR DAS 3 CAIXAS & CASAL ==================== */}
        {activeTab === "simulador" && (
          <div className="space-y-6">
            {/* 4 Key Summary Cards */}
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
                    Mantida em CDB 100% CDI Liquidez Diária / Tesouro Selic. Blindagem do casal antes e depois das chaves.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Hoje: <strong className="text-slate-800 dark:text-slate-200">{fmtBRL(sim.c1Init)}</strong>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {fmtBRL(sim.cur1)}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    +{fmtBRL(sim.cur1 - sim.c1Init)} só de juros (~11,2% a.a. líq.)
                  </div>
                </div>
              </div>

              {/* Caixa 2 */}
              <div className="bg-white dark:bg-slate-900 border-2 border-blue-600 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Home className="w-4 h-4" /> Caixa 2 • Imóvel
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
                    Fundo Entrada + Documentação
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    10k em CDB 120% CDI + 15k em 100% CDI + Aportes de{" "}
                    <strong>{fmtBRL(sim.c2Monthly)}/mês</strong> em LCI/LCA (90%+ CDI isenta).
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Hoje (Casal):{" "}
                    <strong className="text-slate-800 dark:text-slate-200">{fmtBRL(sim.c2Init)}</strong>
                  </div>
                  <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                    {fmtBRL(sim.cur2)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Meta 20% Entrada + 5% ITBI: <strong>{fmtBRL(sim.targetPronto)}</strong>
                  </div>
                </div>
              </div>

              {/* Caixa 3 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> Caixa 3 • Futuro
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-medium">
                      Multiplicação
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Crescimento de Patrimônio
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Tesouro IPCA+ 2032 (~IPCA+7,9%) + ETF Global (WRLD11) ou FIIs. Recebe{" "}
                    <strong>{fmtBRL(sim.c3Monthly)}/mês</strong>.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Hoje: <strong className="text-slate-800 dark:text-slate-200">{fmtBRL(sim.c3Init)}</strong>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {fmtBRL(sim.cur3)}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                    Continua rendendo após comprar o imóvel!
                  </div>
                </div>
              </div>

              {/* Sobra Pós-Compra */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> Pós-Compra
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium">
                      Segurança Total
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Patrimônio que Sobra Investido
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Saldo que permanece nas contas de vocês no dia seguinte a pagar os 20% de entrada + 5% de escritura/ITBI.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Total Acumulado:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {fmtBRL(sim.totalFinal)}
                    </strong>
                  </div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {fmtBRL(Math.max(0, sim.leftoverPronto))}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {sim.leftoverPronto >= sim.cur1 + reformaCost
                      ? `Cobre Reserva + R$ 30k Piso/Móveis + Sobra!`
                      : `Preserva a Reserva de ${fmtBRL(sim.cur1)}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart + Couple Proportional Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* SVG Interactive Evolution Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Evolução Patrimonial Mês a Mês ({months} meses)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Crescimento conjunto com juros compostos líquidos de Imposto de Renda
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

                  {/* Responsive SVG Chart */}
                  <div className="w-full overflow-hidden pt-2">
                    {(() => {
                      const w = 680;
                      const h = 260;
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
                          {/* Horizontal grid lines */}
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

                          {/* X-Axis Labels */}
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

                          {/* Areas & Lines */}
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

                          {/* Target Line */}
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

                {/* Enquadramento MCMV / Renda Bruta Card */}
                <div className="mt-4 p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-bold text-blue-900 dark:text-blue-200">
                      🏦 Diagnóstico de Financiamento (Renda Bruta Combinada: {fmtBRL(sim.combinedIncome)})
                    </div>
                    <div className="text-blue-800 dark:text-blue-300 mt-0.5">
                      {sim.mcmvStatus}
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 font-bold text-blue-700 dark:text-blue-300 shrink-0">
                    Taxa Est.: {sim.estimatedRate}
                  </div>
                </div>
              </div>

              {/* Divisão Proporcional do Casal */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    Divisão Justa do Casal no Contrato
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Cálculo proporcional transparente considerando o capital inicial (fora sua Reserva Blindada individual) + aportes mensais de cada um em {months} meses.
                  </p>

                  <div className="mt-4 space-y-3">
                    {/* Você */}
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
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <span>
                          Inicial: {fmtBRL(Math.max(0, userInit - sim.c1Init))} + {fmtBRL(userMonthly)}/mês
                        </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {fmtBRL(sim.userCommitted)}
                        </strong>
                      </div>
                    </div>

                    {/* Namorada */}
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
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
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
                    Como organizar na prática:
                  </div>
                  <p>
                    Cada um investe o seu aporte mensal na sua própria conta (em LCI/LCA para a Caixa 2). Assim vocês aproveitam o limite duplo do FGC (R$ 250 mil por CPF) e mantêm o histórico exato dos depósitos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: IMÓVEL PRONTO VS. NA PLANTA ==================== */}
        {activeTab === "planta" && (
          <div className="space-y-6">
            {/* Stress-Test Controls for Off-Plan */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Comparador Real: Comprar Pronto vs. Comprar na Planta ({fmtBRL(propPrice)})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Sem saldo de FGTS • Simule abaixo o impacto do INCC da obra e do custo de Piso/Marcenaria na entrega das chaves:
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="w-56">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400">INCC Médio Anual:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {inccAnnual.toFixed(1).replace(".", ",")}% a.a.
                      </span>
                    </div>
                    <input
                      type="range"
                      min={3.5}
                      max={9.0}
                      step={0.5}
                      value={inccAnnual}
                      onChange={(e) => setInccAnnual(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                  </div>

                  <div className="w-60">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Kit Chaves (Piso/Móveis):</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {fmtBRL(reformaCost)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={15000}
                      max={60000}
                      step={2500}
                      value={reformaCost}
                      onChange={(e) => setReformaCost(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                {/* Estratégia A */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Estratégia A • Juros a Seu Favor
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                      Juntar Investindo + Comprar Pronto (ou Repasse)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Vocês acumulam na Caixa 2 (LCI/LCA + CDB 120% CDI) por {months} meses e compram um imóvel pronto com poder de barganha à vista na entrada.
                    </p>
                    <ul className="mt-4 space-y-2 text-xs">
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Entrada (20%):</span>
                        <span className="font-bold">{fmtBRL(sim.downPayment20)}</span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">ITBI + Escritura (~5%):</span>
                        <span className="font-bold">{fmtBRL(sim.docsItbi5)}</span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Lucro de Juros na Caixa 2:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          + {fmtBRL(sim.c2InterestEarned)}
                        </span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Taxa de Evolução de Obra:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          R$ 0 (Zero)
                        </span>
                      </li>
                      <li className="flex justify-between py-1">
                        <span className="text-slate-500">Piso e Marcenaria:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          Já instalado no imóvel
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <strong>Veredito Financeiro:</strong> Com a Selic em 13,75% a.a., você ganha{" "}
                    <strong>+{fmtBRL(sim.c2InterestEarned)}</strong> de juros líquidos em vez de pagar INCC e evolução de obra.
                  </div>
                </div>

                {/* Estratégia B */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-blue-600 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                      Estratégia B • Melhor Opção na Planta
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                      Na Planta com Crédito Associativo (Caixa MCMV)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Assina o contrato com a Caixa já na planta. <strong>Congela os 80% financiados contra o INCC</strong>, pagando a entrada parcelada + evolução de obra.
                    </p>
                    <ul className="mt-4 space-y-2 text-xs">
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Sinal no Ato (~8% c/ Caixa 2 atual):</span>
                        <span className="font-bold">{fmtBRL(sim.signal8)}</span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Parcelas Construtora (12% + INCC):</span>
                        <span className="font-bold">~{fmtBRL(sim.avgBuilderMonthly)}/mês</span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Juros de Obra (Total em {months}m):</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          - {fmtBRL(sim.totalObraEvolutionFee)}
                        </span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Kit Chaves (Piso + Móveis):</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {fmtBRL(reformaCost)}
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
                    <strong>Como fazer dar certo:</strong> Vocês já têm os{" "}
                    <strong>{fmtBRL(sim.signal8)}</strong> do Sinal na Caixa 2 hoje! O restante da Caixa 2 fica rendendo em LCI/LCA para pagar o Kit Chaves ({fmtBRL(reformaCost)}) na entrega.
                  </div>
                </div>

                {/* Estratégia C */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300">
                      Estratégia C • Cuidado com o INCC
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                      Na Planta Direto (Financiamento Só nas Chaves)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Não cobra evolução de obra, mas os <strong>80% do saldo devedor sofrem correção mensal pelo INCC</strong> até a entrega do Habite-se!
                    </p>
                    <ul className="mt-4 space-y-2 text-xs">
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">Saldo Devedor Original (80%):</span>
                        <span className="font-bold">{fmtBRL(sim.financed80)}</span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">
                          Saldo Corrigido por INCC ({inccAnnual}% a.a.):
                        </span>
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
                      <li className="flex justify-between py-1 border-b border-slate-200/70 dark:border-slate-800">
                        <span className="text-slate-500">ITBI + Escritura + Kit Chaves:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {fmtBRL(sim.docsItbi5 + reformaCost)}
                        </span>
                      </li>
                      <li className="flex justify-between py-1">
                        <span className="text-slate-500">Risco na Entrega das Chaves:</span>
                        <span className="font-bold text-red-600 dark:text-red-400">
                          Alto se a renda não subir
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <strong>Regra de Proteção:</strong> Se o contrato for nesse modelo,{" "}
                    <strong>não antecipe parcelas sem desconto</strong>. Deixe o dinheiro rendendo 11,5% a.a. líquido na LCI/LCA para abater o saldo nas chaves!
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Golden Rules for Off-Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex gap-3.5">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    1. Arbitragem de Taxas nos Balões/Anuais da Construtora
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400">
                    Corretores costumam sugerir antecipar as parcelas anuais para &ldquo;fugir do INCC&rdquo;. Faça a conta: se o INCC está em {inccAnnual}% a.a. e sua LCI/LCA rende ~11,5% a.a. líquido de IR, <strong>você ganha +6% ao ano deixando o dinheiro aplicado no seu banco</strong> e pagando o boleto apenas no vencimento.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex gap-3.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    2. Patrimônio de Afetação e Cláusula de 180 Dias
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400">
                    Exija no memorial de incorporação o <strong>Patrimônio de Afetação</strong> (separa a contabilidade do prédio da construtora). Lembre-se também que toda construtora tem por lei até <strong>180 dias corridos de tolerância</strong> além da data prevista de entrega.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: GUIA DIDÁTICO DE INVESTIMENTOS ==================== */}
        {activeTab === "guia" && (
          <div className="space-y-6">
            {/* Cards Explicativos para o Casal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Caixa 1 • Reserva Blindada (R$ 30.000)
                  </span>
                  <span className="text-xs font-medium text-slate-400">Liquidez Imediata</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  1. Tesouro Selic e CDB 100% do CDI (Liquidez Diária)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Como funciona:</strong> É o investimento mais seguro do país. Seu dinheiro rende todos os dias úteis acompanhando a Taxa Selic (13,75% ao ano). Nunca oscila para baixo e pode ser resgatado no mesmo dia.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    📌 O que fazer com os seus R$ 60.000 atuais:
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Deixe <strong>R$ 30.000</strong> quietos no seu CDB 100% CDI atual como Reserva Blindada (Caixa 1). Mantenha os <strong>R$ 10.000 a 120% do CDI</strong> + <strong>R$ 15.000 a 100% do CDI</strong> como base da Caixa 2 (Imóvel), e <strong>R$ 5.000</strong> como semente da Caixa 3.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border-2 border-blue-600 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                    Caixa 2 • Aportes do Imóvel ({fmtBRL(sim.c2Monthly)}/mês)
                  </span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Zero Imposto de Renda
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  2. LCI e LCA Pós-Fixadas (90% a 94% do CDI)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Como funciona:</strong> Letras de Crédito Imobiliário (LCI) e do Agronegócio (LCA) têm a mesma garantia do FGC dos CDBs (até R$ 250 mil por CPF por banco), mas são <strong>100% isentas de Imposto de Renda para pessoa física</strong>.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    📌 Como {userName} e {partnerName} compram no app:
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    No menu &ldquo;Renda Fixa&rdquo; do banco/corretora, filtrem por <strong>LCI ou LCA</strong> com taxa acima de <strong>90% do CDI</strong> e vencimento entre <strong>9 e 24 meses</strong> (sempre antes da data em que pretendem assinar o imóvel).
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                    Caixa 3 • Metade 1 ({fmtBRL(sim.c3Monthly / 2)}/mês)
                  </span>
                  <span className="text-xs font-medium text-slate-400">Ganho Real Acima da Inflação</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  3. Tesouro IPCA+ 2032
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Como funciona:</strong> Garante que o dinheiro de vocês renda toda a inflação oficial (IPCA) + uma taxa fixa de cerca de <strong>7,9% ao ano</strong>. É o motor de multiplicação real de patrimônio do casal.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                  <strong>Atenção:</strong> Compre apenas com o dinheiro da <strong>Caixa 3</strong> para segurar até o vencimento, pois se vender antes pode haver oscilação de preço (marcação a mercado).
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    Caixa 3 • Metade 2 ({fmtBRL(sim.c3Monthly / 2)}/mês)
                  </span>
                  <span className="text-xs font-medium text-slate-400">Pitada Moderada</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  4. ETF Global (WRLD11 / IVVB11) ou FIIs
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Como funciona:</strong> Com apenas ~R$ 130 na Bolsa brasileira (B3), vocês compram 1 cota de <strong>WRLD11</strong> (que investe em mais de 9.000 empresas mundiais em dólar) ou <strong>Fundos Imobiliários (FIIs)</strong> que pingam dividendos isentos todo mês.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                  <strong>Objetivo Educacional:</strong> Serve para vocês aprenderem juntos a investir em renda variável com pouco dinheiro em risco (~12% do aporte mensal).
                </div>
              </div>
            </div>

            {/* Interactive LCI/LCA vs CDB Converter */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-500" />
                Calculadora Comparadora: LCI/LCA (Isenta) vs. CDB (Tributado)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Abriu o aplicativo do banco e ficou na dúvida entre uma LCI/LCA e um CDB? Compare abaixo:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-center">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Taxa da LCI ou LCA:</span>
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
                    Prazo do Título (Tabela Regressiva de IR):
                  </label>
                  <select
                    value={irBracket}
                    onChange={(e) => setIrBracket(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value={0.2}>De 6 meses a 1 ano (IR de 20,0% no CDB)</option>
                    <option value={0.175}>De 1 a 2 anos (IR de 17,5% no CDB)</option>
                    <option value={0.15}>Acima de 2 anos (IR de 15,0% no CDB)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-blue-600 text-white">
                  <div className="text-xs opacity-90">Para empatar com essa LCI/LCA, o CDB precisa pagar:</div>
                  <div className="text-lg font-extrabold mt-0.5">
                    {(lciRate / (1 - irBracket)).toFixed(1).replace(".", ",")}% do CDI Bruto
                  </div>
                  <div className="text-xs opacity-90 mt-0.5">
                    Rentabilidade líquida real no bolso:{" "}
                    <strong>{((lciRate / 100) * 13.65).toFixed(2).replace(".", ",")}% ao ano</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: ROTINA MENSAL & CHECKLIST ==================== */}
        {activeTab === "plano" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Monthly Payday Split */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  📅 Roteiro Mensal do Dia do Salário
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Como distribuir os <strong>{fmtBRL(sim.coupleMonthly)}/mês</strong> em menos de 10 minutos pelo celular:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      1. Caixa 1 — Reserva de Emergência
                    </div>
                    <div className="text-slate-500">
                      Já completa em {fmtBRL(sim.c1Init)} (rende automática)
                    </div>
                  </div>
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    R$ 0/mês
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border-2 border-blue-600 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      2. Caixa 2 — Imóvel (LCI/LCA 90%+ CDI)
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
                    <div className="text-slate-500">Proteção contra a inflação + juro real</div>
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {fmtBRL(sim.c3Monthly / 2)}/mês
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      3B. Caixa 3 — ETF Global (WRLD11) ou FIIs
                    </div>
                    <div className="text-slate-500">Crescimento moderado de longo prazo</div>
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {fmtBRL(sim.c3Monthly / 2)}/mês
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <span>Quer mandar esse plano pronto para {partnerName}?</span>
                <button
                  onClick={handleShareSimulation}
                  className="inline-flex items-center gap-1 font-bold underline"
                >
                  <span>Copiar Link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Couple Checklist */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    ✅ Checklist Prático do Casal (Salvo no Navegador)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Marquem cada etapa conforme avançarem no planejamento:
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
