export type Matrix = number[][];

export interface KernelPreset {
  name: string;
  matrix: Matrix;
  description: string;
}

export interface Coordinates {
  row: number;
  col: number;
}
