import React from 'react';
import { ShirtSize, SHIRT_SIZES, SIZE_DETAILS } from '../types';
import { Check } from 'lucide-react';

interface SizeSelectorProps {
  selectedSize: ShirtSize | null;
  onSelectSize: (size: ShirtSize) => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({ selectedSize, onSelectSize }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-pink-500 text-white text-xs font-bold">
            3
          </span>
          Selecione o Tamanho da Camisa
        </label>
        {selectedSize && (
          <span className="text-xs font-bold text-pink-400 bg-pink-950/60 px-2.5 py-0.5 rounded-full border border-pink-800/60 animate-pulse">
            Selecionado: {selectedSize}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {SHIRT_SIZES.map((size) => {
          const isSelected = selectedSize === size;
          const details = SIZE_DETAILS[size];

          return (
            <button
              type="button"
              key={size}
              id={`size-btn-${size.replace(/[^a-zA-Z0-9]/g, '-')}`}
              onClick={() => onSelectSize(size)}
              className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer select-none ${
                isSelected
                  ? 'bg-gradient-to-b from-pink-600 to-pink-700 border-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.45)] scale-[1.02]'
                  : 'bg-[#121218] hover:bg-[#1a1a24] border-neutral-800 hover:border-pink-500/50 text-neutral-300'
              }`}
            >
              {/* Selected Checkmark badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white text-pink-700 flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              <span className={`text-base font-extrabold tracking-wide ${isSelected ? 'text-white' : 'text-white group-hover:text-pink-300'}`}>
                {details.label}
              </span>
              <span className={`text-[11px] mt-0.5 font-medium leading-tight ${isSelected ? 'text-pink-100' : 'text-neutral-400'}`}>
                {size}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
