export type UnitSystem = 'metric' | 'imperial';
export type TankShape = 'rectangular' | 'bowfront' | 'cylinder';

export interface TankDimensions {
  length: number;
  width: number;
  height: number;
  diameter?: number;
}

const LITERS_PER_GALLON = 3.78541;
const KG_PER_LITER = 1.0;

export function toLiters(volume: number, unit: UnitSystem): number {
  return unit === 'imperial' ? volume * LITERS_PER_GALLON : volume;
}

export function fromLiters(liters: number, unit: UnitSystem): number {
  return unit === 'imperial' ? liters / LITERS_PER_GALLON : liters;
}

export function formatVolume(liters: number, unit: UnitSystem): string {
  const value = fromLiters(liters, unit);
  const label = unit === 'imperial' ? 'gal' : 'L';
  return `${value.toFixed(1)} ${label}`;
}

export function formatWeight(kg: number, unit: UnitSystem): string {
  if (unit === 'imperial') {
    return `${(kg * 2.20462).toFixed(1)} lbs`;
  }
  return `${kg.toFixed(1)} kg`;
}

export function formatLength(cm: number, unit: UnitSystem): string {
  if (unit === 'imperial') {
    const inches = cm / 2.54;
    const feet = Math.floor(inches / 12);
    const remaining = inches % 12;
    if (feet > 0) {
      return `${feet}' ${remaining.toFixed(1)}"`;
    }
    return `${inches.toFixed(1)}"`;
  }
  if (cm >= 100) {
    return `${(cm / 100).toFixed(2)} m`;
  }
  return `${cm.toFixed(1)} cm`;
}

function toCm(value: number, unit: UnitSystem): number {
  return unit === 'imperial' ? value * 2.54 : value;
}

export function calculateVolume(
  shape: TankShape,
  dims: TankDimensions,
  unit: UnitSystem,
): number {
  const length = toCm(dims.length, unit);
  const width = toCm(dims.width, unit);
  const height = toCm(dims.height, unit);

  let volumeCm3: number;

  switch (shape) {
    case 'rectangular':
      volumeCm3 = length * width * height;
      break;
    case 'bowfront':
      // Bow-front: rectangular base + semicircular front extension
      const bowRadius = width / 2;
      const bowArea = (Math.PI * bowRadius * bowRadius) / 2;
      const rectArea = length * width;
      volumeCm3 = (rectArea + bowArea) * height;
      break;
    case 'cylinder': {
      const diameter = toCm(dims.diameter ?? dims.width, unit);
      const radius = diameter / 2;
      volumeCm3 = Math.PI * radius * radius * height;
      break;
    }
    default:
      volumeCm3 = 0;
  }

  return volumeCm3 / 1000; // cm³ → liters
}

export function calculateWaterWeight(liters: number): number {
  return liters * KG_PER_LITER;
}

export function calculateHeaterWatts(liters: number, roomTempDelta = 10): number {
  // Rule of thumb: 2.5–5 watts per liter depending on temp differential
  const wattsPerLiter = roomTempDelta > 15 ? 5 : roomTempDelta > 8 ? 3.5 : 2.5;
  const watts = liters * wattsPerLiter;
  // Round up to nearest 25W
  return Math.ceil(watts / 25) * 25;
}

export function calculateSubstrate(
  floorAreaCm2: number,
  depthCm: number,
  unit: UnitSystem,
): { volumeLiters: number; weightKg: number; bagsNeeded: number } {
  const depth = toCm(depthCm, unit);
  const volumeLiters = (floorAreaCm2 * depth) / 1000;
  const weightKg = volumeLiters * 1.6; // ~1.6 kg/L for gravel
  const bagsNeeded = Math.ceil(weightKg / 9); // standard 9 kg bag
  return { volumeLiters, weightKg, bagsNeeded };
}

export function getFloorArea(
  shape: TankShape,
  dims: TankDimensions,
  unit: UnitSystem,
): number {
  const length = toCm(dims.length, unit);
  const width = toCm(dims.width, unit);

  switch (shape) {
    case 'rectangular':
      return length * width;
    case 'bowfront': {
      const bowRadius = width / 2;
      const bowArea = (Math.PI * bowRadius * bowRadius) / 2;
      return length * width + bowArea;
    }
    case 'cylinder': {
      const diameter = toCm(dims.diameter ?? dims.width, unit);
      const radius = diameter / 2;
      return Math.PI * radius * radius;
    }
    default:
      return 0;
  }
}

export function calculateStocking(liters: number): {
  conservative: number;
  moderate: number;
  aggressive: number;
} {
  // 1 inch of fish per gallon (imperial rule) ≈ 2.5 cm per 4 liters
  const gallons = liters / LITERS_PER_GALLON;
  return {
    conservative: Math.floor(gallons * 0.75),
    moderate: Math.floor(gallons),
    aggressive: Math.floor(gallons * 1.5),
  };
}

export const SHAPE_LABELS: Record<TankShape, string> = {
  rectangular: 'Rectangular',
  bowfront: 'Bow-Front',
  cylinder: 'Cylindrical',
};
