import React, { useMemo } from 'react';

interface PetalConfig {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  opacity: number;
}

export const SakuraPetals: React.FC = () => {
  const petals = useMemo<PetalConfig[]>(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 4.3 + Math.random() * 3) % 100}%`,
      size: Math.floor(Math.random() * 10) + 10, // 10px to 20px
      duration: Math.floor(Math.random() * 8) + 9, // 9s to 17s
      delay: Math.random() * 10,
      rotation: Math.floor(Math.random() * 360),
      opacity: Math.random() * 0.45 + 0.35,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="petal shadow-xs"
          style={{
            left: petal.left,
            width: `${petal.size}px`,
            height: `${petal.size * 1.3}px`,
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
            opacity: petal.opacity,
            transform: `rotate(${petal.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};
