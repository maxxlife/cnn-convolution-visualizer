import { KernelPreset, Matrix } from './types';

// 6x6 Input Image (Simplified grayscale values 0-9 for readability)
export const INITIAL_INPUT: Matrix = [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0],
  [0, 1, 5, 5, 1, 0],
  [0, 1, 5, 5, 1, 0],
  [0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0],
];

export const KERNELS: KernelPreset[] = [
  {
    name: "Вертикальные границы (Vertical Edge)",
    description: "Этот фильтр находит вертикальные перепады яркости (границы) на изображении.",
    matrix: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1]
    ]
  },
  {
    name: "Горизонтальные границы (Horizontal Edge)",
    description: "Этот фильтр подчеркивает горизонтальные линии.",
    matrix: [
      [-1, -1, -1],
      [0, 0, 0],
      [1, 1, 1]
    ]
  },
  {
    name: "Резкость (Sharpen)",
    description: "Усиливает разницу между соседними пикселями, делая изображение более четким.",
    matrix: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ]
  },
  {
    name: "Размытие (Box Blur)",
    description: "Усредняет значение пикселя с соседями, создавая эффект размытия.",
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1] // Note: usually divided by 9, but we keep integers for visual simplicity
    ]
  },
  {
    name: "Тождество (Identity)",
    description: "Оставляет изображение без изменений.",
    matrix: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ]
  }
];
