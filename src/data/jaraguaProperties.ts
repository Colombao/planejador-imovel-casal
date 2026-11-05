export interface JaraguaProperty {
  id: string;
  name: string;
  builder: string;
  neighborhood: string;
  price: number;
  areaM2: number;
  bedrooms: number;
  parkingSpots: number;
  deliveryMonths: number;
  downPaymentPct: number; // % pago até as chaves (Sinal + Mensais/Balões na obra)
  signalPct: number; // % pago no ato da assinatura
  financingType: "Associativo_MCMV" | "Associativo_SFH" | "Direto_INCC" | "Pronto";
  highlights: string[];
  recommendedFinishReserve: number; // Reserva recomendada p/ piso, iluminação, marcenaria
  sourceNote: string;
  isCustom?: boolean;
}

export interface NeighborhoodBenchmark {
  neighborhood: string;
  profile: string;
  avgPriceM2Min: number;
  avgPriceM2Max: number;
  typicalTicket2Bed: string;
  mcmvFit: "Alto (Faixa 3)" | "Médio (Faixa 3/4)" | "Baixo (Acima do teto)";
}

export const JARAGUA_NEIGHBORHOODS: NeighborhoodBenchmark[] = [
  {
    neighborhood: "Jaraguá Esquerdo",
    profile: "Condomínios clube compactos na planta, próximo a serviços e fácil acesso",
    avgPriceM2Min: 7400,
    avgPriceM2Max: 8200,
    typicalTicket2Bed: "R$ 345 mil – R$ 385 mil (46 a 50 m²)",
    mcmvFit: "Alto (Faixa 3)",
  },
  {
    neighborhood: "Água Verde / Rau",
    profile: "Forte expansão vertical, próximo à BR-280 e polos industriais/universitários",
    avgPriceM2Min: 7300,
    avgPriceM2Max: 8400,
    typicalTicket2Bed: "R$ 360 mil – R$ 400 mil (50 a 55 m²)",
    mcmvFit: "Alto (Faixa 3)",
  },
  {
    neighborhood: "Vila Lenzi / Nova Brasília",
    profile: "Bairros tradicionais e valorizados, próximos à Arena Jaraguá e Centro",
    avgPriceM2Min: 7600,
    avgPriceM2Max: 9800,
    typicalTicket2Bed: "R$ 350 mil – R$ 450 mil (48 a 60 m²)",
    mcmvFit: "Médio (Faixa 3/4)",
  },
  {
    neighborhood: "Três Rios do Norte / João Pessoa / Estrada Nova",
    profile: "Excelente custo por m², opções de geminados e apartamentos maiores",
    avgPriceM2Min: 5900,
    avgPriceM2Max: 7200,
    typicalTicket2Bed: "R$ 330 mil – R$ 380 mil (55 a 65 m²)",
    mcmvFit: "Alto (Faixa 3)",
  },
  {
    neighborhood: "Ilha da Figueira / Barra do Rio Cerro / Vieira",
    profile: "Bairros consolidados com lançamentos de médio padrão (2 quartos c/ suíte)",
    avgPriceM2Min: 7500,
    avgPriceM2Max: 9200,
    typicalTicket2Bed: "R$ 395 mil – R$ 470 mil (54 a 64 m²)",
    mcmvFit: "Médio (Faixa 3/4)",
  },
  {
    neighborhood: "Centro / Vila Baependi / Czerniewicz",
    profile: "Região nobre central, prédios de alto padrão e studios/compactos premium",
    avgPriceM2Min: 11500,
    avgPriceM2Max: 22000,
    typicalTicket2Bed: "R$ 580 mil – R$ 1,2 milhão+",
    mcmvFit: "Baixo (Acima do teto)",
  },
];

export const JARAGUA_PROPERTIES: JaraguaProperty[] = [
  {
    id: "rogga-frankfurt-agua-verde",
    name: "Frankfurt Urban Club (Ref. Rôgga)",
    builder: "Rôgga Empreendimentos",
    neighborhood: "Água Verde / Rau (Rua Jorge Buhr)",
    price: 376000,
    areaM2: 51,
    bedrooms: 2,
    parkingSpots: 1,
    deliveryMonths: 30,
    downPaymentPct: 20,
    signalPct: 8,
    financingType: "Associativo_MCMV",
    highlights: [
      "51 m² privativos com sacada e churrasqueira",
      "Condomínio Clube (piscina, academia, salão gourmet)",
      "Enquadra no teto MCMV Faixa 3 (até R$ 400 mil) via Caixa",
    ],
    recommendedFinishReserve: 28000,
    sourceNote: "Referência de mercado em Água Verde / Rau - Jaraguá do Sul",
  },
  {
    id: "residencial-vega-jaragua-esquerdo",
    name: "Residencial Vega (Condomínio Clube)",
    builder: "Incorporadora Regional / MCMV",
    neighborhood: "Jaraguá Esquerdo",
    price: 350000,
    areaM2: 46,
    bedrooms: 2,
    parkingSpots: 1,
    deliveryMonths: 36,
    downPaymentPct: 20,
    signalPct: 7,
    financingType: "Associativo_MCMV",
    highlights: [
      "46 m² privativos, 2 dormitórios e varanda com churrasqueira",
      "Piscina adulto/infantil, pet place, coworking e salão de festas",
      "Entrada parcelada na obra + Crédito Associativo Caixa",
    ],
    recommendedFinishReserve: 25000,
    sourceNote: "Referência de lançamento econômico em Jaraguá Esquerdo",
  },
  {
    id: "vila-lenzi-smart-living",
    name: "Residencial Planejado Vila Lenzi",
    builder: "Construtora Local (Padrão Intermediário)",
    neighborhood: "Vila Lenzi",
    price: 368000,
    areaM2: 49,
    bedrooms: 2,
    parkingSpots: 1,
    deliveryMonths: 24,
    downPaymentPct: 20,
    signalPct: 10,
    financingType: "Associativo_MCMV",
    highlights: [
      "Localização estratégica próxima à Arena Jaraguá e vias rápidas",
      "Torre com menor número de moradores e condomínio enxuto",
      "Churrasqueira a carvão na sacada e ótimo potencial de valorização",
    ],
    recommendedFinishReserve: 27000,
    sourceNote: "Referência de planta planejada no bairro Vila Lenzi",
  },
  {
    id: "geminado-tres-rios-estrada-nova",
    name: "Geminado / Apto Amplo na Planta",
    builder: "Construtora Local Jaraguá",
    neighborhood: "Três Rios do Norte / Estrada Nova",
    price: 345000,
    areaM2: 58,
    bedrooms: 2,
    parkingSpots: 2,
    deliveryMonths: 18,
    downPaymentPct: 20,
    signalPct: 10,
    financingType: "Associativo_MCMV",
    highlights: [
      "Maior área privativa pelo orçamento (58 m²) e espaço externo",
      "Sem taxa de condomínio elevada e obra mais rápida (~18 meses)",
      "Excelente custo/m² (~R$ 5.948/m²)",
    ],
    recommendedFinishReserve: 22000,
    sourceNote: "Referência de geminados/aptos em bairros de expansão em Jaraguá",
  },
  {
    id: "ilha-da-figueira-suite-planta",
    name: "Lançamento 2 Quartos (1 Suíte) - Médio Padrão",
    builder: "Incorporadora Médio Padrão",
    neighborhood: "Ilha da Figueira / Barra do Rio Cerro",
    price: 425000,
    areaM2: 56,
    bedrooms: 2,
    parkingSpots: 1,
    deliveryMonths: 36,
    downPaymentPct: 25,
    signalPct: 10,
    financingType: "Direto_INCC",
    highlights: [
      "Planta de 56 m² com 1 suíte + 1 dormitório e acabamento superior",
      "Enquadra na Faixa 4 (Classe Média até R$ 600k) ou SFH",
      "Atenção: exige cuidar da correção pelo INCC no saldo devedor",
    ],
    recommendedFinishReserve: 32000,
    sourceNote: "Referência de lançamento médio padrão em Ilha da Figueira / Barra",
  },
  {
    id: "seminovo-pronto-jaragua",
    name: "Apto Seminovo Pronto p/ Morar (Comparativo)",
    builder: "Entrega Imediata (Repasse / Pronto)",
    neighborhood: "Água Verde / Vila Lenzi / Baependi",
    price: 380000,
    areaM2: 54,
    bedrooms: 2,
    parkingSpots: 1,
    deliveryMonths: 30, // Tempo juntando dinheiro rendendo 11,5% a.a. antes de comprar à vista a entrada
    downPaymentPct: 20,
    signalPct: 20,
    financingType: "Pronto",
    highlights: [
      "Vocês acumulam os recursos rendendo ~11,5% a.a. líquido sem pagar INCC",
      "Zero taxa de evolução de obra e já vem com piso/luminárias instalados",
      "Mudança imediata no ato da assinatura do financiamento",
    ],
    recommendedFinishReserve: 10000,
    sourceNote: "Referência de imóvel pronto/seminovo em Jaraguá do Sul",
  },
];
