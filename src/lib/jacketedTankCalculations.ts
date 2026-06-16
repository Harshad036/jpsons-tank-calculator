import type { TankLookupRow } from '../data/tankLookup';
import { formatCurrency, formatNum } from './mixingTankCalculations';

export interface Dim3 {
  l: number;
  w: number;
  h: number;
}

export interface JacketedEditableParams {
  shellH: number;
  flatDishConeH: number;
  topThickness: number;
  jacketShellH: number;
  jacketDishH: number;
  topRing: { l: number; h: number };
  jacketRing: { l: number; h: number };
  insulationShell: { h: number };
  insulationRing: { l: number; h: number };
  legPad: Dim3 & { qty: number };
  basePlate: Dim3 & { qty: number };
  leg: Dim3;
}

export interface JacketedTankInputs {
  diameter: number;
  height: number;
  thickness: number;
  params: JacketedEditableParams;
}

export interface JacketedLineItem {
  id: string;
  name: string;
  l: number;
  w: number;
  h: number;
  result: number;
  rate: number;
  totalAmount: number;
  editableL: boolean;
  editableW: boolean;
  editableH: boolean;
}

export const DEFAULT_JACKETED_PARAMS: JacketedEditableParams = {
  shellH: 3,
  flatDishConeH: 3,
  topThickness: 3,
  jacketShellH: 3,
  jacketDishH: 3,
  topRing: { l: 50, h: 6 },
  jacketRing: { l: 50, h: 6 },
  insulationShell: { h: 2 },
  insulationRing: { l: 50, h: 6 },
  legPad: { l: 150, w: 150, h: 4, qty: 4 },
  basePlate: { l: 150, w: 150, h: 5, qty: 4 },
  leg: { l: 60, w: 3, h: 3 },
};

export const DEFAULT_JACKETED_RATES: Record<string, number> = {
  shell: 300,
  flatDishCone: 300,
  top: 300,
  topRing: 300,
  jacketShell: 300,
  jacketDish: 300,
  jacketRing: 300,
  insulationShell: 300,
  insulationRing: 300,
  legPad: 300,
  basePlate: 300,
  leg: 300,
};

/** Sync THK-linked H values when the main thickness input changes. */
export function syncThicknessLinkedH(
  params: JacketedEditableParams,
  thickness: number,
): JacketedEditableParams {
  return {
    ...params,
    shellH: thickness,
    flatDishConeH: thickness,
    topThickness: thickness,
    jacketShellH: thickness,
    jacketDishH: thickness,
  };
}

const PI = 3.14;
const WEIGHT_FACTOR = 0.000008;

export function calcWeight(l: number, w: number, h: number): number {
  return l * w * h * WEIGHT_FACTOR;
}

export function calcLegWeight(l: number, w: number, h: number): number {
  return (l - h) * h * 0.00756 * 3.25 * w;
}

export function ringW(d: number, ringL: number): number {
  return (d + ringL) * PI + 200;
}

export function insulationRingW(d: number, ringL: number): number {
  return (d + ringL + 50) * PI + 200;
}

export function legFromLookup(row: TankLookupRow): Dim3 {
  return {
    l: row.legDiameter,
    w: row.legLength,
    h: row.legThickness,
  };
}

export function calculateJacketedLineItems(
  inputs: JacketedTankInputs,
  rates: Record<string, number>,
): JacketedLineItem[] {
  const d = inputs.diameter;
  const tankH = inputs.height;
  const p = inputs.params;

  const flatL = d + 100;
  const flatW = d + 100;
  const topL = d + 100;
  const topW = d + 100;

  const topRingW = ringW(d, p.topRing.l);
  const jacketRingW = ringW(d, p.jacketRing.l);
  const insulationRingWVal = insulationRingW(d, p.insulationRing.l);

  const jacketDishL = topL + 100;
  const jacketDishW = flatW + 100;

  const items: Omit<JacketedLineItem, 'rate' | 'totalAmount'>[] = [
    {
      id: 'shell',
      name: 'SHELL',
      l: tankH,
      w: d * PI,
      h: p.shellH,
      result: calcWeight(tankH, d * PI, p.shellH),
      editableL: false,
      editableW: false,
      editableH: true,
    },
    {
      id: 'flatDishCone',
      name: 'FLAT/DISH/CONE',
      l: flatL,
      w: flatW,
      h: p.flatDishConeH,
      result: calcWeight(flatL, flatW, p.flatDishConeH),
      editableL: false,
      editableW: false,
      editableH: true,
    },
    {
      id: 'top',
      name: 'TOP (FLAT/DISH)',
      l: topL,
      w: topW,
      h: p.topThickness,
      result: calcWeight(topL, topW, p.topThickness),
      editableL: false,
      editableW: false,
      editableH: true,
    },
    {
      id: 'topRing',
      name: 'TOP RING',
      l: p.topRing.l,
      w: topRingW,
      h: p.topRing.h,
      result: calcWeight(p.topRing.l, topRingW, p.topRing.h),
      editableL: true,
      editableW: false,
      editableH: true,
    },
    {
      id: 'jacketShell',
      name: 'JACKET SHELL',
      l: tankH - 150,
      w: d * PI,
      h: p.jacketShellH,
      result: calcWeight(tankH - 150, d * PI, p.jacketShellH),
      editableL: false,
      editableW: false,
      editableH: true,
    },
    {
      id: 'jacketDish',
      name: 'JACKET DISH',
      l: jacketDishL,
      w: jacketDishW,
      h: p.jacketDishH,
      result: calcWeight(jacketDishL, jacketDishW, p.jacketDishH),
      editableL: false,
      editableW: false,
      editableH: true,
    },
    {
      id: 'jacketRing',
      name: 'JACKET RING',
      l: p.jacketRing.l,
      w: jacketRingW,
      h: p.jacketRing.h,
      result: calcWeight(p.jacketRing.l, jacketRingW, p.jacketRing.h),
      editableL: true,
      editableW: false,
      editableH: true,
    },
    {
      id: 'insulationShell',
      name: 'INSULATION SHELL',
      l: tankH - 150,
      w: (d + 100) * PI,
      h: p.insulationShell.h,
      result: calcWeight(tankH - 150, (d + 100) * PI, p.insulationShell.h),
      editableL: false,
      editableW: false,
      editableH: true,
    },
    {
      id: 'insulationRing',
      name: 'INSULATION RING',
      l: p.insulationRing.l,
      w: insulationRingWVal,
      h: p.insulationRing.h,
      result: calcWeight(p.insulationRing.l, insulationRingWVal, p.insulationRing.h),
      editableL: true,
      editableW: false,
      editableH: true,
    },
    {
      id: 'legPad',
      name: 'LEG PAD',
      l: p.legPad.l,
      w: p.legPad.w,
      h: p.legPad.h,
      result: calcWeight(p.legPad.l, p.legPad.w, p.legPad.h) * p.legPad.qty,
      editableL: true,
      editableW: true,
      editableH: true,
    },
    {
      id: 'basePlate',
      name: 'BASE PLATE',
      l: p.basePlate.l,
      w: p.basePlate.w,
      h: p.basePlate.h,
      result: calcWeight(p.basePlate.l, p.basePlate.w, p.basePlate.h) * p.basePlate.qty,
      editableL: true,
      editableW: true,
      editableH: true,
    },
    {
      id: 'leg',
      name: 'LEG',
      l: p.leg.l,
      w: p.leg.w,
      h: p.leg.h,
      result: calcLegWeight(p.leg.l, p.leg.w, p.leg.h),
      editableL: true,
      editableW: true,
      editableH: true,
    },
  ];

  return items.map((item) => {
    const rate = rates[item.id] ?? DEFAULT_JACKETED_RATES[item.id] ?? 0;
    return { ...item, rate, totalAmount: item.result * rate };
  });
}

export function calcJacketedTankVolume(d: number, h: number): number {
  return (PI * (d / 2) * (d / 2) * h) / 1000000;
}

export { formatNum, formatCurrency };
