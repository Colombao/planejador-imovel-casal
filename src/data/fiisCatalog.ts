export interface FiiAsset {
  ticker: string;
  name: string;
  manager: string;
  segment: "Papel High Grade (Base 10)" | "Papel CDI (High Grade)" | "Tijolo (Galpões Logísticos)" | "Tijolo (Shopping Centers)" | "Tijolo (Renda Urbana)";
  category: "Papel" | "Tijolo";
  isBase10: boolean;
  price: number; // R$
  pvp: number; // Preço / Valor Patrimonial
  monthlyDividend: number; // R$ / cota
  dy12m: number; // % a.a.
  magicNumberShares: number; // Cotas para o dividendo comprar +1 cota sozinho
  magicNumberCapital: number; // R$ necessários para atingir o Magic Number
  SuggestedWeightInFiiPocket: number; // % sugerido na fatia de FIIs da Caixa 3
  pros: string[];
  risks: string;
  cnpiVerdict: string;
}

export const TOP_FIIS_2026: FiiAsset[] = [
  {
    ticker: "MXRF11",
    name: "Maxi Renda FII",
    manager: "XP Asset",
    segment: "Papel High Grade (Base 10)",
    category: "Papel",
    isBase10: true,
    price: 8.65,
    pvp: 0.93,
    monthlyDividend: 0.095,
    dy12m: 13.75,
    magicNumberShares: Math.ceil(8.65 / 0.095), // 92 cotas
    magicNumberCapital: Math.ceil(8.65 / 0.095) * 8.65, // ~R$ 796
    SuggestedWeightInFiiPocket: 25,
    pros: [
      "Cota Base 10 (~R$ 8,65): com R$ 796 você já atinge o Magic Number (92 cotas)",
      "Negociando com 7% de desconto sobre o valor patrimonial (P/VP 0,93x)",
      "Maior liquidez em número de cotistas da B3 (+1 milhão de investidores)",
    ],
    risks: "Possui ~15% em permutas financeiras (obras) e 80% em CRIs; exige reinvestir dividendos para repor a inflação.",
    cnpiVerdict:
      "Excelente porta de entrada Base 10. Compre apenas enquanto o P/VP estiver abaixo de 1,00x.",
  },
  {
    ticker: "KNSC11",
    name: "Kinea Securities",
    manager: "Kinea (Itaú)",
    segment: "Papel High Grade (Base 10)",
    category: "Papel",
    isBase10: true,
    price: 8.50,
    pvp: 0.95,
    monthlyDividend: 0.092,
    dy12m: 13.68,
    magicNumberShares: Math.ceil(8.50 / 0.092), // 93 cotas
    magicNumberCapital: Math.ceil(8.50 / 0.092) * 8.50, // ~R$ 791
    SuggestedWeightInFiiPocket: 25,
    pros: [
      "O melhor par para o MXRF11: também custa ~R$ 8,50 (Base 10) e tem gestão Kinea (Itaú)",
      "Carteira 100% crédito High Grade (metade IPCA+ e metade CDI+) sem risco de permuta",
      "Atinge o Magic Number com ~R$ 791 (93 cotas)",
    ],
    risks: "Oscilação da marcação a mercado dos CRIs se a curva de juros abrir.",
    cnpiVerdict:
      "Tecnicamente ainda mais seguro que o MXRF11 na parte de crédito. Dividir a fatia Base 10 entre MXRF11 e KNSC11 é a combinação ideal.",
  },
  {
    ticker: "BTLG11",
    name: "BTG Pactual Logística",
    manager: "BTG Pactual",
    segment: "Tijolo (Galpões Logísticos)",
    category: "Tijolo",
    isBase10: false,
    price: 97.20,
    pvp: 0.94,
    monthlyDividend: 0.78,
    dy12m: 9.65,
    magicNumberShares: Math.ceil(97.20 / 0.78), // 125 cotas
    magicNumberCapital: Math.ceil(97.20 / 0.78) * 97.20, // ~R$ 12.150
    SuggestedWeightInFiiPocket: 25,
    pros: [
      "Imóveis reais (Tijolo): galpões logísticos de padrão AAA alugados para gigantes do e-commerce em SP",
      "O valor dos galpões e dos aluguéis sobe junto com a inflação (protege o patrimônio do casal)",
      "Desconto de 6% sobre os imóveis físicos (P/VP 0,94x)",
    ],
    risks: "Dividend Yield inicial menor que o de papel (~9,6% a.a.) porque parte do retorno vem da valorização dos imóveis.",
    cnpiVerdict:
      "Indispensável para equilibrar os FIIs de papel. Garante que o patrimônio cresça acima da inflação no longo prazo.",
  },
  {
    ticker: "XPML11",
    name: "XP Malls",
    manager: "XP Asset",
    segment: "Tijolo (Shopping Centers)",
    category: "Tijolo",
    isBase10: false,
    price: 95.50,
    pvp: 0.89,
    monthlyDividend: 0.92,
    dy12m: 11.45,
    magicNumberShares: Math.ceil(95.50 / 0.92), // 104 cotas
    magicNumberCapital: Math.ceil(95.50 / 0.92) * 95.50, // ~R$ 9.932
    SuggestedWeightInFiiPocket: 25,
    pros: [
      "Dono de participações nos shoppings mais dominantes do país (Catarina Outlet, Cidade Jardim, etc.)",
      "Negociando com 11% de desconto sobre os imóveis (P/VP 0,89x) e pagando ~11,4% a.a. isento",
      "Aluguéis de shopping têm repasse automático de inflação + percentual sobre vendas das lojas",
    ],
    risks: "Sensível ao ritmo de consumo do varejo e eventuais novas emissões de cotas.",
    cnpiVerdict:
      "Com P/VP de 0,89x e DY acima de 11% a.a., é hoje uma das melhores relações risco-retorno entre FIIs de Tijolo.",
  },
  {
    ticker: "HGRU11",
    name: "Pátria Renda Urbana",
    manager: "Pátria Investimentos",
    segment: "Tijolo (Renda Urbana)",
    category: "Tijolo",
    isBase10: false,
    price: 112.00,
    pvp: 0.88,
    monthlyDividend: 0.90,
    dy12m: 10.85,
    magicNumberShares: Math.ceil(112.00 / 0.90), // 125 cotas
    magicNumberCapital: Math.ceil(112.00 / 0.90) * 112.00, // ~R$ 14.000
    SuggestedWeightInFiiPocket: 0,
    pros: [
      "Imóveis urbanos alugados com contratos atípicos longos (supermercados Assaí, lojas, faculdades)",
      "Forte desconto patrimonial de 12% (P/VP 0,88x) e baixíssima vacância",
    ],
    risks: "Concentração em grandes inquilinos do varejo alimentar e vestuário.",
    cnpiVerdict:
      "Excelente alternativa de Tijolo defensivo com contratos longos se quiserem um 5º FII na carteira.",
  },
  {
    ticker: "KNCR11",
    name: "Kinea Rendimentos Imobiliários",
    manager: "Kinea (Itaú)",
    segment: "Papel CDI (High Grade)",
    category: "Papel",
    isBase10: false,
    price: 103.50,
    pvp: 0.99,
    monthlyDividend: 1.15,
    dy12m: 13.50,
    magicNumberShares: Math.ceil(103.50 / 1.15), // 90 cotas
    magicNumberCapital: Math.ceil(103.50 / 1.15) * 103.50, // ~R$ 9.315
    SuggestedWeightInFiiPocket: 0,
    pros: [
      "Atrelado a 100% do CDI + spread: surfando a Selic de 13,75% a.a. com estabilidade máxima",
      "Considerado o FII de papel mais defensivo da Bolsa brasileira",
    ],
    risks: "Se a Selic cair forte no futuro, os dividendos acompanham a queda do CDI.",
    cnpiVerdict:
      "Um verdadeiro 'relógio suíço' para quem prefere cota na base R$ 100 atrelada ao CDI.",
  },
];
