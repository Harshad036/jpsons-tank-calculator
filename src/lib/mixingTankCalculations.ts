import type { TankLookupRow } from '../data/tankLookup';

export interface ComponentParams {
  w: number;
  thk: number;
  qty: number;
}

export interface LegParams {
  w: number;
  thk: number;
  l: number;
}

export interface TankInputs {
  diameter: number;
  height: number;
  thickness: number;
  topThickness: number;
  topRing: ComponentParams;
  legPad: ComponentParams;
  basePlate: ComponentParams;
  leg: LegParams;
}

export interface LineItemResult {
  id: string;
  name: string;
  result: number;
  rate: number;
  totalAmount: number;
}

export const DEFAULT_TOP_RING: ComponentParams = { w: 50, thk: 6, qty: 0 };
export const DEFAULT_LEG_PAD: ComponentParams = { w: 150, thk: 6, qty: 4 };
export const DEFAULT_BASE_PLATE: ComponentParams = { w: 150, thk: 6, qty: 4 };
export const DEFAULT_LEG: LegParams = { w: 60, thk: 3, l: 3 };

export const DEFAULT_RATES: Record<string, number> = {
  shell: 450,
  bottom: 450,
  top: 450,
  topRing: 450,
  legPad: 300,
  basePlate: 300,
  leg: 300,
};

export function calcShell(d: number, h: number, thk: number): number {
  return ((d - thk) * 3.14 * h * thk * 0.000008);
}

export function calcFlatDishCone(d: number, thk: number): number {
  return (d + 100) * (d + 100) * thk * 0.000008;
}

export function calcTopRing(d: number, ringW: number, ringThk: number): number {
  return ((d + ringW) * 3.14 + 200) * ringW * ringThk * 0.000008;
}

export function calcPad(w: number, thk: number, qty: number): number {
  return w * w * thk * 0.000008 * qty;
}

export function calcLeg(w: number, thk: number, l: number): number {
  return (w - thk) * thk * 0.00756 * 3.25 * l;
}

export function calcTankVolume(d: number, h: number): number {
  return (3.14 * (d / 2) * (d / 2) * h) / 1000000;
}

export function legFromLookup(row: TankLookupRow): LegParams {
  return {
    w: row.legDiameter,
    thk: row.legThickness,
    l: row.legLength,
  };
}

export function calculateLineItems(
  inputs: TankInputs,
  rates: Record<string, number>,
): LineItemResult[] {
  const {
    diameter: d,
    height: h,
    thickness: thk,
    topThickness,
    topRing,
    legPad,
    basePlate,
    leg,
  } = inputs;

  const items: Array<Omit<LineItemResult, 'rate' | 'totalAmount'>> = [
    { id: 'shell', name: 'SHELL', result: calcShell(d, h, thk) },
    { id: 'bottom', name: 'FLAT/DISH/CONE', result: calcFlatDishCone(d, thk) },
    { id: 'top', name: 'TOP (FLAT/DISH)', result: calcFlatDishCone(d, topThickness) },
    {
      id: 'topRing',
      name: 'TOP RING',
      result: calcTopRing(d, topRing.w, topRing.thk),
    },
    {
      id: 'legPad',
      name: 'LEG PAD',
      result: calcPad(legPad.w, legPad.thk, legPad.qty),
    },
    {
      id: 'basePlate',
      name: 'BASE PLATE',
      result: calcPad(basePlate.w, basePlate.thk, basePlate.qty),
    },
    { id: 'leg', name: 'LEG', result: calcLeg(leg.w, leg.thk, leg.l) },
  ];

  return items.map((item) => {
    const rate = rates[item.id] ?? DEFAULT_RATES[item.id] ?? 0;
    return {
      ...item,
      rate,
      totalAmount: item.result * rate,
    };
  });
}

export function formatNum(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '0.00';
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(value: number): string {
  return formatNum(value, 2);
}
