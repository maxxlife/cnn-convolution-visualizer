import React from 'react';
import { Coordinates } from '../types';

interface GridProps {
  data: number[][];
  title: string;
  highlightRegion?: {
    topLeft: Coordinates;
    size: number;
  };
  isActive?: boolean;
  activeCell?: Coordinates;
  colorTheme: 'blue' | 'red' | 'green';
  onCellHover?: (row: number, col: number) => void;
  onCellLeave?: () => void;
  scale?: number;
}

export const Grid: React.FC<GridProps> = ({
  data,
  title,
  highlightRegion,
  activeCell,
  colorTheme,
  onCellHover,
  onCellLeave,
  scale = 1
}) => {
  // Guard against empty data to prevent render errors
  if (!data || data.length === 0 || !data[0]) {
    return (
      <div className="flex flex-col items-center">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
        <div className="w-full h-full min-w-[200px] min-h-[200px] flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          Загрузка...
        </div>
      </div>
    );
  }

  const getCellColor = (val: number, isHighlighted: boolean, isCenter: boolean) => {
    // Base intensity based on value (clamped roughly between 0-10 or handled relatively)
    const intensity = Math.min(Math.max(Math.abs(val) * 20, 0), 255); // Simple scaling for viz
    
    // Theme configurations
    const themeStyles = {
      blue: {
        bg: `rgba(59, 130, 246, ${Math.min(0.1 + (val / 10) * 0.5, 0.9)})`,
        border: 'border-blue-200',
        highlightBorder: 'border-blue-600',
        text: 'text-slate-800'
      },
      red: {
        bg: `rgba(239, 68, 68, ${Math.min(0.1 + (val / 5) * 0.5, 0.9)})`,
        border: 'border-red-200',
        highlightBorder: 'border-red-600',
        text: 'text-slate-800'
      },
      green: {
        bg: `rgba(34, 197, 94, ${Math.min(0.1 + (val / 20) * 0.5, 0.9)})`, // Output values can be larger
        border: 'border-green-200',
        highlightBorder: 'border-green-600',
        text: 'text-slate-800'
      }
    };

    const t = themeStyles[colorTheme];
    
    let className = `w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border font-mono text-sm sm:text-base transition-all duration-200 cursor-default select-none `;
    
    if (isHighlighted) {
      className += `z-10 scale-110 shadow-lg font-bold border-2 ${t.highlightBorder} bg-white text-black`;
    } else {
      className += `${t.border} ${t.text}`;
    }

    const style = isHighlighted ? {} : { backgroundColor: t.bg };

    return { className, style };
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      <div 
        className="grid gap-1 p-2 bg-white rounded-xl shadow-sm border border-slate-200"
        style={{ 
          gridTemplateColumns: `repeat(${data[0].length}, minmax(0, 1fr))` 
        }}
        onMouseLeave={onCellLeave}
      >
        {data.map((row, rowIndex) => (
          row.map((cellVal, colIndex) => {
            let isHighlighted = false;

            // Logic to determine if this cell is part of the "Active Operation"
            if (activeCell) {
               if (activeCell.row === rowIndex && activeCell.col === colIndex) {
                 isHighlighted = true;
               }
            }
            
            if (highlightRegion) {
               if (
                 rowIndex >= highlightRegion.topLeft.row && 
                 rowIndex < highlightRegion.topLeft.row + highlightRegion.size &&
                 colIndex >= highlightRegion.topLeft.col &&
                 colIndex < highlightRegion.topLeft.col + highlightRegion.size
               ) {
                 isHighlighted = true;
               }
            }

            const { className, style } = getCellColor(cellVal, isHighlighted, false);

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={className}
                style={style}
                onMouseEnter={() => onCellHover && onCellHover(rowIndex, colIndex)}
              >
                {cellVal}
              </div>
            );
          })
        ))}
      </div>
      <div className="mt-2 text-xs text-slate-400 font-mono">
        {data.length}x{data[0].length}
      </div>
    </div>
  );
};