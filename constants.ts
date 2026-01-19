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
    name: {
      ru: "Вертикальные границы",
      en: "Vertical Edges"
    },
    description: {
      ru: "Этот фильтр находит вертикальные перепады яркости (границы) на изображении.",
      en: "This filter detects vertical brightness changes (edges) in the image."
    },
    matrix: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1]
    ]
  },
  {
    name: {
      ru: "Горизонтальные границы",
      en: "Horizontal Edges"
    },
    description: {
      ru: "Этот фильтр подчеркивает горизонтальные линии.",
      en: "This filter emphasizes horizontal lines."
    },
    matrix: [
      [-1, -1, -1],
      [0, 0, 0],
      [1, 1, 1]
    ]
  },
  {
    name: {
      ru: "Резкость",
      en: "Sharpen"
    },
    description: {
      ru: "Усиливает разницу между соседними пикселями, делая изображение более четким.",
      en: "Enhances the difference between adjacent pixels, making the image sharper."
    },
    matrix: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ]
  },
  {
    name: {
      ru: "Размытие",
      en: "Box Blur"
    },
    description: {
      ru: "Усредняет значение пикселя с соседями, создавая эффект размытия.",
      en: "Averages pixel values with neighbors, creating a blur effect."
    },
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1] 
    ]
  },
  {
    name: {
      ru: "Тождество",
      en: "Identity"
    },
    description: {
      ru: "Оставляет изображение без изменений.",
      en: "Leaves the image unchanged."
    },
    matrix: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ]
  }
];