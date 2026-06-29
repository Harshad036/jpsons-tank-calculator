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
    image: 'jacketed-mixing-tank.png',
  },
  {
    id: 'agitator',
    title: 'Agitator',
    description: 'Single and double agitator material and cost calculator',
    image: 'agitator.png',
  },
];

export function getItemById(id: string): CalculatorItem | undefined {
  return CALCULATOR_ITEMS.find((item) => item.id === id);
}
