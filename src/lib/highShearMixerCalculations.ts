import type { DimField, HsmFormula, HsmItemDef, HsmVariant } from '../data/highShearMixerItems';
import { HIGH_SHEAR_MIXER_ITEMS } from '../data/highShearMixerItems';
import { formatCurrency, formatNum } from './mixingTankCalculations';

export interface HsmDimensions {
  diameter?: number;
  length?: number;
  width?: number;
  thickness?: number;
}

export interface HsmItemState {
  variantId: string;
  dimensions: HsmDimensions;
  rate: number;
}

export interface HsmLineItem {
  id: string;
  name: string;
  variantLabel: string;
  formula: HsmFormula;
  diameter?: number;
  length?: number;
  width?: number;
  thickness?: number;
  editableFields: DimField[];
  hasVariantChoice: boolean;
  allFieldsEditable: boolean;
  result: number;
  rate: number;
  totalAmount: number;
}

export const DEFAULT_LABOUR_PERCENT = 75;
export const DEFAULT_MOTOR_COST = 0;
export const DEFAULT_ROTOR_COST = 2000;
export const DEFAULT_MISC_COST = 0;
export const DEFAULT_PROFIT_PERCENT = 10;

export function applicableDimFields(formula: HsmFormula): DimField[] {
  switch (formula) {
    case 'cylinder':
      return ['diameter', 'length'];
    case 'plate_rect':
      return ['length', 'width', 'thickness'];
    case 'plate_circle':
      return ['diameter', 'thickness'];
    default:
      return [];
  }
}

export function isAllFieldsEditable(formula: HsmFormula, editableFields: DimField[]): boolean {
  const applicable = applicableDimFields(formula);
  return applicable.length > 0 && applicable.every((f) => editableFields.includes(f));
}

export function isDimEditable(
  formula: HsmFormula,
  editableFields: DimField[],
  field: DimField,
  allFieldsEditable: boolean,
): boolean {
  if (allFieldsEditable) {
    return applicableDimFields(formula).includes(field);
  }
  return editableFields.includes(field);
}

export function calcHsmResult(formula: HsmFormula, d: HsmDimensions): number {
  switch (formula) {
    case 'cylinder':
      return ((d.diameter ?? 0) * (d.diameter ?? 0) * (d.length ?? 0)) / 160000;
    case 'plate_rect':
      return (d.length ?? 0) * (d.width ?? 0) * (d.thickness ?? 0) * 0.000008;
    case 'plate_circle':
      return ((d.diameter ?? 0) * (d.diameter ?? 0) * (d.thickness ?? 0)) / 160000;
    default:
      return 0;
  }
}

export function dimensionsFromVariant(variant: HsmVariant): HsmDimensions {
  return {
    diameter: variant.diameter,
    length: variant.length,
    width: variant.width,
    thickness: variant.thickness,
  };
}

export function buildDefaultItemState(item: HsmItemDef): HsmItemState {
  const variant = item.variants[0];
  return {
    variantId: variant.id,
    dimensions: dimensionsFromVariant(variant),
    rate: item.defaultRate,
  };
}

export function buildDefaultState(): Record<string, HsmItemState> {
  const state: Record<string, HsmItemState> = {};
  for (const item of HIGH_SHEAR_MIXER_ITEMS) {
    state[item.id] = buildDefaultItemState(item);
  }
  return state;
}

export function calculateHsmLineItems(
  itemStates: Record<string, HsmItemState>,
): HsmLineItem[] {
  return HIGH_SHEAR_MIXER_ITEMS.map((item) => {
    const state = itemStates[item.id];
    const variant = item.variants.find((v) => v.id === state.variantId) ?? item.variants[0];
    const result = calcHsmResult(item.formula, state.dimensions);
    const allFieldsEditable = isAllFieldsEditable(item.formula, variant.editableFields);
    return {
      id: item.id,
      name: item.name,
      variantLabel: variant.label,
      formula: item.formula,
      diameter: state.dimensions.diameter,
      length: state.dimensions.length,
      width: state.dimensions.width,
      thickness: state.dimensions.thickness,
      editableFields: variant.editableFields,
      hasVariantChoice: item.variants.length > 1,
      allFieldsEditable,
      result,
      rate: state.rate,
      totalAmount: result * state.rate,
    };
  });
}

export function calcGrandTotal(
  materialTotal: number,
  labourCost: number,
  motorCost: number,
  rotorCost: number,
  miscCost: number,
  profitCost: number,
): number {
  return materialTotal + labourCost + motorCost + rotorCost + miscCost + profitCost;
}

export { formatNum, formatCurrency };
