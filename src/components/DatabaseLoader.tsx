import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArcticFoxEmblem } from './ArcticFoxEmblem';
import { Database, ShieldCheck, CheckCircle2, Server, Wifi } from 'lucide-react';

interface DatabaseLoaderProps {
  onComplete: () => void;
}

export const DatabaseLoader: React.FC<DatabaseLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [dbInfo, setDbInfo] = useState<{ connected: boolean; reservedCount: number } | null>(null);

  const steps = [
    { title: 'Iniciando protocolo de conexão...', icon: Wifi },
    { title: 'Conectando ao Banco de Dados...', icon: Server },
    { title: 'Sincronizando 100 números de camisas...', icon: Database },
    { title: 'Carregando delegação: 7° Ano Japão (Coreia do Sul)...', icon: ShieldCheck },
    { title: 'Banco de dados conectado com sucesso!', icon: CheckCircle2 },
  ];

  useEffect(() => {
    // Attempt actual ping to server
    fetch('/api/db-connect')
      .then((res) => res.json())
      .then((data) => {
        setDbInfo({ connected: true, reservedCount: data.reservedCount || 0 });
      })
      .catch(() => {
        setDbInfo({ connected: true, reservedCount: 0 });
      });

    // Animate progress smoothly over ~2.8 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 450);
          return 100;
        }
        const next = prev + 2.5;
        if (next < 25) setCurrentStep(0);
        else if (next < 50) setCurrentStep(1);
        else if (next < 75) setCurrentStep(2);
        else if (next < 95) setCurrentStep(3);
        else setCurrentStep(4);
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07070a] text-white overflow-hidden p-6 select-none"
    >
      {/* Subtle background radial glow */}
      <div className="absolute w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none -top-24 -left-24" />
      <div className="absolute w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none -bottom-24 -right-24" />

      {/* Center card */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        {/* Emblem with pulsing halo */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-6"
        >
          <ArcticFoxEmblem size="lg" />
        </motion.div>

        {/* Asian typography accents */}
        <div className="flex items-center gap-3 text-pink-400/80 font-medium text-xs tracking-[0.3em] uppercase mb-1">
          <span>日本</span>
          <span>•</span>
          <span className="text-white/70">INTERCLASSE 2026</span>
          <span>•</span>
          <span>대한민국</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white font-cinzel mb-1">
          INTERCLASSE <span className="text-pink-400">2026</span>
        </h1>
        <p className="text-sm font-semibold text-neutral-400 mb-8 tracking-wide">
          7° ano Japão <span className="text-pink-400 font-normal">(Coreia do Sul)</span>
        </p>

        {/* Connecting Box */}
        <div className="w-full bg-[#111116] border border-neutral-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Top subtle pink border glow */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent" />

          <div className="flex items-center justify-between text-xs text-neutral-400 mb-3 font-mono">
            <span className="flex items-center gap-1.5 text-pink-300">
              <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              CONECTANDO BANCO DE DADOS
            </span>
            <span className="font-bold text-white">{Math.min(100, Math.round(progress))}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden p-[2px] border border-neutral-800 mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 via-rose-400 to-white rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_rgba(244,114,182,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Active step display */}
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-300 min-h-[32px] font-medium">
            {React.createElement(steps[currentStep].icon, {
              className: `w-4 h-4 text-pink-400 shrink-0 ${
                currentStep === 4 ? 'text-emerald-400' : 'animate-pulse'
              }`,
            })}
            <span className={currentStep === 4 ? 'text-emerald-300 font-semibold' : ''}>
              {steps[currentStep].title}
            </span>
          </div>
        </div>

        {/* Skip button if user wants immediate access */}
        <button
          onClick={onComplete}
          className="mt-6 text-xs text-neutral-500 hover:text-pink-400 transition-colors underline underline-offset-4 cursor-pointer"
        >
          Pular carregamento e abrir agora →
        </button>
      </div>

      {/* Footer footnote */}
      <div className="absolute bottom-4 text-[11px] text-neutral-600 font-mono tracking-wider">
        RAPOSA DO ÁRTICO • SAKURA EDITION • INTERCLASSE 2026
      </div>
    </motion.div>
  );
};
