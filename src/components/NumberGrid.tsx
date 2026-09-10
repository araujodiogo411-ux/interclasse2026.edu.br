import React, { useState, useMemo } from 'react';
import { Ban, Check, Search, Sparkles } from 'lucide-react';
import { Order } from '../types';

interface NumberGridProps {
  selectedNumber: number | null;
  onSelectNumber: (num: number) => void;
  orders: Order[];
}

export const NumberGrid: React.FC<NumberGridProps> = ({
  selectedNumber,
  onSelectNumber,
  orders,
}) => {
  const [filterRange, setFilterRange] = useState<'all' | '1-25' | '26-50' | '51-75' | '76-100' | 'available'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Map taken numbers to order info
  const takenMap = useMemo(() => {
    const map = new Map<number, Order>();
    orders.forEach((o) => {
      map.set(o.number, o);
    });
    return map;
  }, [orders]);

  // Generate 1 to 100 numbers array
  const allNumbers = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => i + 1);
  }, []);

  const filteredNumbers = useMemo(() => {
    return allNumbers.filter((num) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim();
        if (!num.toString().includes(query)) return false;
      }

      // Range tab filter
      if (filterRange === '1-25') return num >= 1 && num <= 25;
      if (filterRange === '26-50') return num >= 26 && num <= 50;
      if (filterRange === '51-75') return num >= 51 && num <= 75;
      if (filterRange === '76-100') return num >= 76 && num <= 100;
      if (filterRange === 'available') return !takenMap.has(num);

      return true;
    });
  }, [allNumbers, filterRange, searchQuery, takenMap]);

  const availableCount = 100 - takenMap.size;
  const takenCount = takenMap.size;

  return (
    <div className="w-full">
      {/* Section Header with Live Counter Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <label className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-pink-500 text-white text-xs font-bold">
              2
            </span>
            Escolha o Número da Camisa (1 a 100)
          </label>
          <p className="text-xs text-neutral-400 mt-0.5">
            Clique sobre o número desejado. Números já escolhidos têm a placa de proibido 🚫.
          </p>
        </div>

        {/* Counter badges */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {availableCount} Livres
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-950/60 border border-red-700/50 text-red-400 flex items-center gap-1.5">
            <Ban className="w-3 h-3 text-red-400" />
            {takenCount} Ocupados
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#101016] border border-neutral-800 rounded-xl p-3 mb-3 flex flex-col md:flex-row gap-2.5 items-center justify-between">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none text-xs">
          {[
            { key: 'all', label: 'Todos (1-100)' },
            { key: 'available', label: 'Apenas Livres' },
            { key: '1-25', label: '1 - 25' },
            { key: '26-50', label: '26 - 50' },
            { key: '51-75', label: '51 - 75' },
            { key: '76-100', label: '76 - 100' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterRange(tab.key as any)}
              className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filterRange === tab.key
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-44 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="number"
            min="1"
            max="100"
            placeholder="Buscar número..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#16161f] border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 transition-colors"
          />
        </div>
      </div>

      {/* Selected Number Banner if chosen */}
      {selectedNumber && (
        <div className="bg-pink-950/40 border border-pink-500/50 rounded-xl p-3 mb-3 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-600 flex items-center justify-center font-extrabold text-white text-lg shadow-[0_0_12px_rgba(244,114,182,0.6)]">
              {selectedNumber}
            </div>
            <div>
              <div className="text-xs text-pink-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Número {selectedNumber} selecionado para a sua camisa!
              </div>
              <div className="text-[11px] text-neutral-400">
                Este número será reservado em seu nome ao clicar em Confirmar.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectNumber(0)}
            className="text-xs text-pink-400 hover:text-pink-300 underline cursor-pointer px-2 py-1"
          >
            Trocar
          </button>
        </div>
      )}

      {/* 1 to 100 Grid Container */}
      <div className="bg-[#0e0e14] border border-neutral-800/90 rounded-2xl p-3 sm:p-4 max-h-[340px] overflow-y-auto shadow-inner">
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {filteredNumbers.map((num) => {
            const isTaken = takenMap.has(num);
            const isSelected = selectedNumber === num;
            const takenOrder = takenMap.get(num);

            if (isTaken) {
              // Placa de Proibido (Forbidden Sign)
              return (
                <div
                  key={num}
                  id={`number-taken-${num}`}
                  title={`Número ${num} já foi escolhido por: ${takenOrder?.shirtName || 'Outro aluno'} (INDISPONÍVEL)`}
                  className="relative group flex flex-col items-center justify-center h-13 rounded-xl border border-red-900/60 bg-gradient-to-b from-red-950/30 to-[#12080a] text-neutral-500 cursor-not-allowed select-none transition-all shadow-xs"
                >
                  {/* Forbidden Plate (Placa de Proibido) */}
                  <div className="flex items-center justify-center relative">
                    <span className="text-sm font-bold text-neutral-500 opacity-60 line-through">
                      {num}
                    </span>
                    {/* Placa de Proibido Overlay Icon */}
                    <div className="absolute -top-1 -right-2 bg-red-600 text-white rounded-full p-[2px] shadow-md border border-red-400">
                      <Ban className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* Forbidden Text Plate */}
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-red-400/90 bg-red-950/80 px-1 rounded mt-0.5 border border-red-800/40">
                    PROIBIDO
                  </span>

                  {/* Hover tooltip explaining it is unavailable */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                    <div className="bg-red-950 text-red-200 border border-red-700 text-[10px] rounded-md px-2 py-1 shadow-lg whitespace-nowrap font-medium flex items-center gap-1">
                      <Ban className="w-3 h-3 text-red-400" />
                      Número {num} INDISPONÍVEL ({takenOrder?.shirtName || 'Já escolhido'})
                    </div>
                    <div className="w-2 h-2 bg-red-950 border-r border-b border-red-700 transform rotate-45 -mt-1" />
                  </div>
                </div>
              );
            }

            // Available number button
            return (
              <button
                type="button"
                key={num}
                id={`number-btn-${num}`}
                onClick={() => onSelectNumber(num)}
                className={`relative group flex flex-col items-center justify-center h-13 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-gradient-to-b from-pink-500 to-pink-600 border-pink-300 text-white shadow-[0_0_18px_rgba(244,114,182,0.6)] scale-105 z-10'
                    : 'bg-[#14141d] hover:bg-[#1f1f2c] border-neutral-800 hover:border-pink-500/70 text-neutral-200 hover:text-white'
                }`}
              >
                {isSelected ? (
                  <div className="flex flex-col items-center">
                    <span className="text-base font-black leading-none">{num}</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-white text-pink-700 flex items-center justify-center mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-bold group-hover:scale-110 transition-transform">
                      {num}
                    </span>
                    <span className="text-[8px] text-neutral-500 group-hover:text-pink-300 transition-colors">
                      Livre
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {filteredNumbers.length === 0 && (
          <div className="py-12 text-center text-neutral-400 text-sm">
            Nenhum número encontrado com o filtro aplicado.
          </div>
        )}
      </div>
    </div>
  );
};
