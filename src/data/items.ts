export interface CalculatorItem {
  id: string;
  title: string;
  description: string;
  image?: string;
}

export const CALCULATOR_ITEMS: CalculatorItem[] = [
  {
    id: 'mixing-tank',
    title: 'Mixing Tank',
    description: 'All type of mixing equipment tank calculator',
    image: 'mixing-tank.png',
  },
  {
    id: 'jacketed-mixing-tank',
    title: 'Jacketed Mixing Tank',
    description: 'Jacketed mixing tank with insulation calculator',
    image: 'mixing-tank.png',
  },
];

export function getItemById(id: string): CalculatorItem | undefined {
  return CALCULATOR_ITEMS.find((item) => item.id === id);
}
