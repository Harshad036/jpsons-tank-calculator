export type AgitatorType = 'SINGLE' | 'DOUBLE';
export type UsedFor = AgitatorType | 'SINGLE/DOUBLE';
export type AgitatorFormula = 'cylinder' | 'plate_rect' | 'plate_circle' | 'lantern';
export type DimField = 'diameter' | 'length' | 'width' | 'thickness';

export interface AgitatorVariant {
  id: string;
  label: string;
  usedFor: UsedFor;
  diameter?: number;
  length?: number;
  width?: number;
  thickness?: number;
  editableFields: DimField[];
}

export interface AgitatorItemDef {
  id: string;
  name: string;
  formula: AgitatorFormula;
  variants: AgitatorVariant[];
  defaultRate: number;
}

export const AGITATOR_TYPE_OPTIONS: AgitatorType[] = ['SINGLE', 'DOUBLE'];

export const AGITATOR_ITEMS: AgitatorItemDef[] = [
  {
    id: 'brgShaft',
    name: 'BRG SHAFT',
    formula: 'cylinder',
    defaultRate: 100,
    variants: [
      { id: 's-40-165', label: '40 × 165', usedFor: 'SINGLE', diameter: 40, length: 165, editableFields: [] },
      { id: 's-50-165', label: '50 × 165', usedFor: 'SINGLE', diameter: 50, length: 165, editableFields: [] },
      { id: 'd-60-600', label: '60 × 600', usedFor: 'DOUBLE', diameter: 60, length: 600, editableFields: [] },
    ],
  },
  {
    id: 'brgHousing',
    name: 'BRG HOUSING',
    formula: 'cylinder',
    defaultRate: 100,
    variants: [
      { id: 's-160-100', label: '160 × 100', usedFor: 'SINGLE', diameter: 160, length: 100, editableFields: [] },
      { id: 'sd-200-100', label: '200 × 100', usedFor: 'SINGLE/DOUBLE', diameter: 200, length: 100, editableFields: [] },
      { id: 's-250-100', label: '250 × 100', usedFor: 'SINGLE', diameter: 250, length: 100, editableFields: [] },
    ],
  },
  {
    id: 'mountingPlate',
    name: 'MOUNTING PLATE',
    formula: 'plate_rect',
    defaultRate: 100,
    variants: [
      { id: 's-200', label: '200 × 200 × 10', usedFor: 'SINGLE', length: 200, width: 200, thickness: 10, editableFields: [] },
      { id: 's-240', label: '240 × 240 × 10', usedFor: 'SINGLE', length: 240, width: 240, thickness: 10, editableFields: [] },
      { id: 's-300', label: '300 × 300 × 10', usedFor: 'SINGLE', length: 300, width: 300, thickness: 10, editableFields: [] },
      { id: 'd-400', label: '400 × 400 × 10', usedFor: 'DOUBLE', length: 400, width: 400, thickness: 10, editableFields: ['length', 'width', 'thickness'] },
    ],
  },
  {
    id: 'gearboxPlate',
    name: 'GEARBOX PLATE',
    formula: 'plate_circle',
    defaultRate: 100,
    variants: [
      { id: 'd-330-10', label: 'Ø 330 × THK 10', usedFor: 'DOUBLE', diameter: 330, thickness: 10, editableFields: ['diameter', 'thickness'] },
    ],
  },
  {
    id: 'housingPlate',
    name: 'HOUSING PLATE',
    formula: 'plate_circle',
    defaultRate: 100,
    variants: [
      { id: 'd-400-10', label: 'Ø 400 × THK 10', usedFor: 'DOUBLE', diameter: 400, thickness: 10, editableFields: ['diameter', 'thickness'] },
    ],
  },
  {
    id: 'sealPlate',
    name: 'SEAL PLATE',
    formula: 'plate_circle',
    defaultRate: 100,
    variants: [
      { id: 'd-400-10', label: 'Ø 400 × THK 10', usedFor: 'DOUBLE', diameter: 400, thickness: 10, editableFields: ['diameter', 'thickness'] },
    ],
  },
  {
    id: 'flexibleCoupling',
    name: 'FLEXIBLE COUPLING',
    formula: 'cylinder',
    defaultRate: 100,
    variants: [
      { id: 'd-120-50', label: '120 × 50', usedFor: 'DOUBLE', diameter: 120, length: 50, editableFields: [] },
      { id: 'd-150-80', label: '150 × 80', usedFor: 'DOUBLE', diameter: 150, length: 80, editableFields: [] },
      { id: 'd-180-100', label: '180 × 100', usedFor: 'DOUBLE', diameter: 180, length: 100, editableFields: [] },
    ],
  },
  {
    id: 'rigidCoupling',
    name: 'RIGID COUPLING',
    formula: 'cylinder',
    defaultRate: 100,
    variants: [
      { id: 'sd-120-50', label: '120 × 50', usedFor: 'SINGLE/DOUBLE', diameter: 120, length: 50, editableFields: [] },
      { id: 'sd-150-80', label: '150 × 80', usedFor: 'SINGLE/DOUBLE', diameter: 150, length: 80, editableFields: [] },
      { id: 'sd-180-100', label: '180 × 100', usedFor: 'SINGLE/DOUBLE', diameter: 180, length: 100, editableFields: [] },
    ],
  },
  {
    id: 'lantern',
    name: 'LANTERN',
    formula: 'lantern',
    defaultRate: 100,
    variants: [
      {
        id: 'd-330-1000-6',
        label: '330 × 1000 × 6',
        usedFor: 'DOUBLE',
        diameter: 330,
        length: 1000,
        thickness: 6,
        editableFields: ['diameter', 'length', 'thickness'],
      },
    ],
  },
  {
    id: 'gallen',
    name: 'GALLEN',
    formula: 'cylinder',
    defaultRate: 100,
    variants: [
      { id: 'd-200-100', label: '200 × 100', usedFor: 'DOUBLE', diameter: 200, length: 100, editableFields: ['diameter', 'length'] },
    ],
  },
  {
    id: 'shaft',
    name: 'SHAFT',
    formula: 'cylinder',
    defaultRate: 300,
    variants: [
      {
        id: 'sd-25-1000',
        label: '25 × 1000',
        usedFor: 'SINGLE/DOUBLE',
        diameter: 25,
        length: 1000,
        editableFields: ['diameter', 'length'],
      },
    ],
  },
  {
    id: 'impellerHub',
    name: 'IMPELLER HUB',
    formula: 'cylinder',
    defaultRate: 300,
    variants: [
      {
        id: 'sd-45-100',
        label: '45 × 100',
        usedFor: 'SINGLE/DOUBLE',
        diameter: 45,
        length: 100,
        editableFields: ['diameter', 'length'],
      },
    ],
  },
  {
    id: 'impellerBlade',
    name: 'IMPELLER BLADE',
    formula: 'plate_rect',
    defaultRate: 300,
    variants: [
      {
        id: 'sd-3000-50-6',
        label: '3000 × 50 × 6',
        usedFor: 'SINGLE/DOUBLE',
        length: 3000,
        width: 50,
        thickness: 6,
        editableFields: ['length', 'width', 'thickness'],
      },
    ],
  },
];

export function variantsForType(item: AgitatorItemDef, type: AgitatorType): AgitatorVariant[] {
  return item.variants.filter((v) => v.usedFor === type || v.usedFor === 'SINGLE/DOUBLE');
}

export function itemsForType(type: AgitatorType): AgitatorItemDef[] {
  return AGITATOR_ITEMS.filter((item) => variantsForType(item, type).length > 0);
}
