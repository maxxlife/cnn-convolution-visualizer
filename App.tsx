import React, { useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_INPUT, KERNELS } from './constants';
import { Coordinates, Matrix } from './types';
import { Grid } from './components/Grid';
import { MathPanel } from './components/MathPanel';
import { explainConvolution } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [inputMatrix] = useState<Matrix>(INITIAL_INPUT);
  const [selectedKernelIndex, setSelectedKernelIndex] = useState(0);
  const [outputMatrix, setOutputMatrix] = useState<Matrix>([]);
  
  // Highlight/Interaction State
  const [hoveredOutputCell, setHoveredOutputCell] = useState<Coordinates | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  // Gemini State
  const [explanation, setExplanation] = useState<string>("");
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  const currentKernel = KERNELS[selectedKernelIndex];

  // Helper: Perform full convolution
  const calculateConvolution = useCallback(() => {
    const iRows = inputMatrix.length;
    const iCols = inputMatrix[0].length;
    const kRows = currentKernel.matrix.length;
    const kCols = currentKernel.matrix[0].length;

    const outputRows = iRows - kRows + 1;
    const outputCols = iCols - kCols + 1;
    
    const newOutput: Matrix = [];

    for (let r = 0; r < outputRows; r++) {
      const row: number[] = [];
      for (let c = 0; c < outputCols; c++) {
        let sum = 0;
        for (let i = 0; i < kRows; i++) {
          for (let j = 0; j < kCols; j++) {
            sum += inputMatrix[r + i][c + j] * currentKernel.matrix[i][j];
          }
        }
        row.push(sum);
      }
      newOutput.push(row);
    }
    setOutputMatrix(newOutput);
  }, [inputMatrix, currentKernel]);

  // Recalculate when kernel changes
  useEffect(() => {
    calculateConvolution();
    setHoveredOutputCell(null);
    setAnimationStep(0);
    setExplanation(""); // Clear old explanation
  }, [calculateConvolution, selectedKernelIndex]);

  // Animation Loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAnimating && outputMatrix.length > 0) {
      interval = setInterval(() => {
        setAnimationStep((prev) => {
          const totalSteps = outputMatrix.length * outputMatrix[0].length;
          const next = prev + 1;
          if (next >= totalSteps) {
            setIsAnimating(false);
            return 0;
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isAnimating, outputMatrix]);

  // Derived state for current highlight (either from hover or animation)
  const activeOutputCoord: Coordinates | null = isAnimating 
    ? { 
        row: Math.floor(animationStep / (outputMatrix.length > 0 ? outputMatrix[0].length : 1)), 
        col: animationStep % (outputMatrix.length > 0 ? outputMatrix[0].length : 1) 
      }
    : hoveredOutputCell;

  // Extract slice for MathPanel
  let activeInputSlice: Matrix | null = null;
  let activeResult: number | null = null;

  if (activeOutputCoord && outputMatrix.length > 0) {
    const { row, col } = activeOutputCoord;
    activeInputSlice = [];
    for (let i = 0; i < currentKernel.matrix.length; i++) {
        activeInputSlice.push(
          inputMatrix[row + i].slice(col, col + currentKernel.matrix[0].length)
        );
    }
    activeResult = outputMatrix[row][col];
  }

  // Handle Gemini Explanation
  const handleExplain = async () => {
    if (!activeInputSlice || activeResult === null) return;
    
    setIsLoadingExplanation(true);
    setExplanation("");
    
    const text = await explainConvolution(
      currentKernel.name,
      activeInputSlice,
      currentKernel.matrix,
      activeResult
    );
    
    setExplanation(text);
    setIsLoadingExplanation(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Визуализация Свертки (CNN)
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Как компьютеры "видят" признаки изображений с помощью математики.
            </p>
          </div>

          <div className="flex items-center space-x-3">
             <button 
               onClick={() => setIsAnimating(!isAnimating)}
               className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center ${
                 isAnimating 
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
               }`}
             >
               {isAnimating ? (
                 <>
                   <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Пауза
                 </>
               ) : (
                 <>
                   <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Анимация
                 </>
               )}
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-8">
        
        {/* Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Выберите фильтр (ядро):</label>
          <div className="flex flex-wrap gap-2">
            {KERNELS.map((k, idx) => (
              <button
                key={k.name}
                onClick={() => setSelectedKernelIndex(idx)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedKernelIndex === idx 
                    ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500 ring-offset-1' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {k.name}
              </button>
            ))}
          </div>
          <p className="mt-3 text-slate-600 text-sm">
            <span className="font-semibold">Описание:</span> {currentKernel.description}
          </p>
        </div>

        {/* Visual Stage */}
        <div className="flex flex-col xl:flex-row items-center justify-center gap-8 xl:gap-16 relative">
          
          {/* Input */}
          <div className="relative group">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">ВХОД (Input)</div>
            <Grid 
              data={inputMatrix} 
              title="Исходное изображение"
              colorTheme="blue"
              highlightRegion={activeOutputCoord ? {
                topLeft: { row: activeOutputCoord.row, col: activeOutputCoord.col },
                size: 3
              } : undefined}
            />
          </div>

          {/* Operation Symbol */}
          <div className="flex flex-col items-center justify-center text-slate-400 font-bold text-xl">
             <span className="mb-2">∗</span>
             <span className="text-xs font-normal opacity-50">Свертка</span>
          </div>

          {/* Kernel */}
          <div className="relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">ЯДРО (Kernel)</div>
            <Grid 
              data={currentKernel.matrix} 
              title="Фильтр 3x3" 
              colorTheme="red"
              highlightRegion={activeOutputCoord ? { topLeft: {row:0, col:0}, size: 3} : undefined}
            />
          </div>

          {/* Equals */}
          <div className="text-slate-400 font-bold text-xl">=</div>

          {/* Output */}
          <div className="relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">ВЫХОД (Feature Map)</div>
            <Grid 
              data={outputMatrix} 
              title="Карта признаков" 
              colorTheme="green"
              activeCell={activeOutputCoord || undefined}
              onCellHover={(r, c) => {
                setIsAnimating(false);
                setHoveredOutputCell({ row: r, col: c });
              }}
              // Removed onCellLeave to make selection sticky so user can click the AI button
            />
          </div>
        </div>

        {/* Math & Explanation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Detailed Math */}
          <MathPanel 
            inputSlice={activeInputSlice} 
            kernel={currentKernel.matrix}
            result={activeResult}
          />

          {/* AI Explanation */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <span className="bg-gradient-to-r from-pink-500 to-violet-500 text-transparent bg-clip-text mr-2">✦</span>
                AI Объяснение
              </h3>
            </div>
            
            <div className="flex-1 bg-slate-50 rounded-lg p-4 mb-4 border border-slate-100 min-h-[120px] text-sm text-slate-700 leading-relaxed">
              {!activeOutputCoord ? (
                 <p className="text-slate-400 italic">Наведите на ячейку справа или запустите анимацию, чтобы получить объяснение шага.</p>
              ) : explanation ? (
                 <div className="prose prose-sm max-w-none text-slate-700">
                    {explanation.split('\n').map((line, i) => <p key={i} className="mb-2 last:mb-0">{line}</p>)}
                 </div>
              ) : isLoadingExplanation ? (
                 <div className="flex items-center space-x-2 text-slate-500 animate-pulse">
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                   <span>AI думает...</span>
                 </div>
              ) : (
                <p className="text-slate-500">
                  Нажмите кнопку ниже, чтобы узнать, что означает результат <span className="font-bold font-mono">{activeResult}</span> для фильтра "{currentKernel.name}".
                </p>
              )}
            </div>

            <button
              onClick={handleExplain}
              disabled={!activeOutputCoord || isLoadingExplanation}
              className={`w-full py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center space-x-2 ${
                !activeOutputCoord 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-purple-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Объяснить этот шаг</span>
            </button>
            {!process.env.API_KEY && (
               <p className="text-xs text-red-400 mt-2 text-center">API Key не найден. AI функции недоступны.</p>
            )}
          </div>

        </div>

        <div className="text-center text-slate-400 text-xs py-8">
           Матричная свертка - основа компьютерного зрения.
        </div>
      </main>
    </div>
  );
};

export default App;