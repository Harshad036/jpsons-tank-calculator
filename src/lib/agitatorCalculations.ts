import type { AgitatorFormula, AgitatorItemDef, AgitatorType, AgitatorVariant, DimField } from '../data/agitatorItems';
import { itemsForType as getItems, variantsForType as getVariants } from '../data/agitatorItems';
import { formatCurrency, formatNum } from './mixingTankCalculations';

export interface AgitatorDimensions {
  diameter?: number;
  length?: number;
  width?: number;
  thickness?: number;
}

export interface AgitatorItemState {
  variantId: string;
  dimensions: AgitatorDimensions;
  rate: number;
}

export interface AgitatorLineItem {
  id: string;
  name: string;
  variantLabel: string;
  formula: AgitatorFormula;
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
export const DEFAULT_MOTOR_COST = 5000;
export const DEFAULT_GEARBOX_COST = 5000;
export const DEFAULT_SEAL_COST = 5000;
export const DEFAULT_PROFIT_PERCENT = 10;

export function applicableDimFields(formula: AgitatorFormula): DimField[] {
  switch (formula) {
    case 'cylinder':
      return ['diameter', 'length'];
    case 'plate_rect':
      return ['length', 'width', 'thickness'];
    case 'plate_circle':
      return ['diameter', 'thickness'];
    case 'lantern':
      return ['diameter', 'length', 'thickness'];
    default:
      return [];
  }
}

export function isAllFieldsEditable(formula: AgitatorFormula, editableFields: DimField[]): boolean {
  const applicable = applicableDimFields(formula);
  return applicable.length > 0 && applicable.every((f) => editableFields.includes(f));
}

export function isDimEditable(
  formula: AgitatorFormula,
  editableFields: DimField[],
  field: DimField,
  allFieldsEditable: boolean,
): boolean {
  if (allFieldsEditable) {
    return applicableDimFields(formula).includes(field);
  }
  return editableFields.includes(field);
}

export function calcAgitatorResult(formula: AgitatorFormula, d: AgitatorDimensions): number {
  switch (formula) {
    case 'cylinder':
      return ((d.diameter ?? 0) * (d.diameter ?? 0) * (d.length ?? 0)) / 160000;
    case 'plate_rect':
      return (d.length ?? 0) * (d.width ?? 0) * (d.thickness ?? 0) * 0.000008;
    case 'plate_circle':
      return ((d.diameter ?? 0) * (d.diameter ?? 0) * (d.thickness ?? 0)) / 160000;
    case 'lantern':
      return (
        ((d.diameter ?? 0) - (d.thickness ?? 0)) *
        (d.thickness ?? 0) *
        0.00756 *
        3.25 *
        (d.length ?? 0)
      ) / 1000;
    default:
      return 0;
  }
}

export function dimensionsFromVariant(variant: AgitatorVariant): AgitatorDimensions {
  return {
    diameter: variant.diameter,
    length: variant.length,
    width: variant.width,
    thickness: variant.thickness,
  };
}

export function buildDefaultItemState(item: AgitatorItemDef, type: AgitatorType): AgitatorItemState {
  const variant = getVariants(item, type)[0];
  return {
    variantId: variant.id,
    dimensions: dimensionsFromVariant(variant),
    rate: item.defaultRate,
  };
}

export function buildDefaultState(type: AgitatorType): Record<string, AgitatorItemState> {
  const state: Record<string, AgitatorItemState> = {};
  for (const item of getItems(type)) {
    state[item.id] = buildDefaultItemState(item, type);
  }
  return state;
}

export function calculateAgitatorLineItems(
  type: AgitatorType,
  itemStates: Record<string, AgitatorItemState>,
): AgitatorLineItem[] {
  return getItems(type).map((item) => {
    const state = itemStates[item.id];
    const variants = getVariants(item, type);
    const variant = variants.find((v) => v.id === state.variantId) ?? variants[0];
    const result = calcAgitatorResult(item.formula, state.dimensions);
    const rate = state.rate;
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
      hasVariantChoice: variants.length > 1,
      allFieldsEditable,
      result,
      rate,
      totalAmount: result * rate,
    };
  });
}

export function calcProfitBase(
  materialTotal: number,
  labourCost: number,
  motorCost: number,
  gearboxCost: number,
  sealCost: number,
): number {
  return materialTotal + labourCost + motorCost + gearboxCost + sealCost;
}

export { formatNum, formatCurrency };
