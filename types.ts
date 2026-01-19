export type Matrix = number[][];

export type Language = 'ru' | 'en';

export interface LocalizedString {
  ru: string;
  en: string;
}

export interface KernelPreset {
  name: LocalizedString;
  matrix: Matrix;
  description: LocalizedString;
}

export interface Coordinates {
  row: number;
  col: number;
}