export interface TankLookupRow {
  capacity: number;
  diameter: number;
  height: number;
  thickness: number;
  legDiameter: number;
  legThickness: number;
  legLength: number;
}

export const TANK_LOOKUP_TABLE: TankLookupRow[] = [
  { capacity: 100, diameter: 550, height: 550, thickness: 3, legDiameter: 60, legThickness: 3, legLength: 3 },
  { capacity: 150, diameter: 600, height: 600, thickness: 3, legDiameter: 60, legThickness: 3, legLength: 3 },
  { capacity: 200, diameter: 650, height: 650, thickness: 3, legDiameter: 73, legThickness: 4, legLength: 3 },
  { capacity: 250, diameter: 700, height: 700, thickness: 3, legDiameter: 73, legThickness: 4, legLength: 3 },
  { capacity: 300, diameter: 750, height: 750, thickness: 3, legDiameter: 73, legThickness: 4, legLength: 3 },
  { capacity: 500, diameter: 800, height: 1100, thickness: 4, legDiameter: 90, legThickness: 4, legLength: 3.5 },
  { capacity: 700, diameter: 900, height: 1250, thickness: 4, legDiameter: 90, legThickness: 4, legLength: 3.5 },
  { capacity: 1000, diameter: 1050, height: 1250, thickness: 4, legDiameter: 114, legThickness: 4, legLength: 3.5 },
  { capacity: 1200, diameter: 1150, height: 1250, thickness: 4, legDiameter: 114, legThickness: 4, legLength: 4 },
  { capacity: 1500, diameter: 1300, height: 1250, thickness: 4, legDiameter: 141, legThickness: 4, legLength: 4 },
  { capacity: 2000, diameter: 1350, height: 1500, thickness: 4, legDiameter: 141, legThickness: 4, legLength: 4 },
  { capacity: 2500, diameter: 1500, height: 1500, thickness: 4, legDiameter: 141, legThickness: 4, legLength: 4 },
  { capacity: 3000, diameter: 1650, height: 1500, thickness: 4, legDiameter: 170, legThickness: 4, legLength: 4 },
  { capacity: 5000, diameter: 1650, height: 2500, thickness: 4, legDiameter: 170, legThickness: 4, legLength: 4 },
  { capacity: 7500, diameter: 2000, height: 2500, thickness: 5, legDiameter: 220, legThickness: 5, legLength: 4 },
  { capacity: 10000, diameter: 2400, height: 2500, thickness: 5, legDiameter: 220, legThickness: 5, legLength: 4 },
  { capacity: 12000, diameter: 2400, height: 3000, thickness: 5, legDiameter: 270, legThickness: 5, legLength: 4 },
  { capacity: 15000, diameter: 2650, height: 3000, thickness: 5, legDiameter: 270, legThickness: 5, legLength: 4 },
];

export function lookupByCapacity(ltr: number): TankLookupRow | undefined {
  return TANK_LOOKUP_TABLE.find((row) => row.capacity === ltr);
}
