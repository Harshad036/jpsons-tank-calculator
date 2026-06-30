export type HsmFormula = 'cylinder' | 'plate_rect' | 'plate_circle';
export type DimField = 'diameter' | 'length' | 'width' | 'thickness';

export interface HsmVariant {
  id: string;
  label: string;
  diameter?: number;
  length?: number;
  width?: number;
  thickness?: number;
  editableFields: DimField[];
}

export interface HsmItemDef {
  id: string;
  name: string;
  formula: HsmFormula;
  variants: HsmVariant[];
  defaultRate: number;
}

export const HIGH_SHEAR_MIXER_ITEMS: HsmItemDef[] = [
  {
    id: 'mountingPlate',
    name: 'MOUNTING PLATE',
    formula: 'plate_rect',
    defaultRate: 100,
    variants: [
      { id: 'mp-280', label: '280 × 280 × 10', length: 280, width: 280, thickness: 10, editableFields: [] },
      { id: 'mp-330', label: '330 × 330 × 10', length: 330, width: 330, thickness: 10, editableFields: [] },
      {
        id: 'mp-400',
        label: '400 × 400 × 10',
        length: 400,
        width: 400,
        thickness: 10,
        editableFields: ['length', 'width', 'thickness'],
      },
    ],
  },
  {
    id: 'sleeveCoupling',
    name: 'SLEEVE COUPLING',
    formula: 'cylinder',
    defaultRate: 100,
    variants: [
      {
        id: 'sc-40-100',
        label: '40 × 100',
        diameter: 40,
        length: 100,
        editableFields: ['diameter', 'length'],
      },
    ],
  },
  {
    id: 'supportShaft',
    name: 'SUPPORT SHAFT',
    formula: 'cylinder',
    defaultRate: 300,
    variants: [
      {
        id: 'ss-20-3000',
        label: '20 × 3000',
        diameter: 20,
        length: 3000,
        editableFields: ['diameter', 'length'],
      },
    ],
  },
  {
    id: 'centerShaft',
    name: 'CENTER SHAFT',
    formula: 'cylinder',
    defaultRate: 300,
    variants: [
      {
        id: 'cs-25-1000',
        label: '25 × 1000',
        diameter: 25,
        length: 1000,
        editableFields: ['diameter', 'length'],
      },
    ],
  },
  {
    id: 'bush',
    name: 'BUSH',
    formula: 'cylinder',
    defaultRate: 300,
    variants: [
      {
        id: 'b-60-60',
        label: '60 × 60',
        diameter: 60,
        length: 60,
        editableFields: ['diameter', 'length'],
      },
    ],
  },
  {
    id: 'bushPlate',
    name: 'BUSH PLATE',
    formula: 'plate_circle',
    defaultRate: 300,
    variants: [
      {
        id: 'bp-200-10',
        label: 'Ø 200 × THK 10',
        diameter: 200,
        thickness: 10,
        editableFields: ['diameter', 'thickness'],
      },
    ],
  },
  {
    id: 'statorPlate',
    name: 'STATOR PLATE',
    formula: 'plate_circle',
    defaultRate: 300,
    variants: [
      {
        id: 'sp-200-10',
        label: 'Ø 200 × THK 10',
        diameter: 200,
        thickness: 10,
        editableFields: ['diameter', 'thickness'],
      },
    ],
  },
];
