import React, { useEffect, useState } from 'react';

interface BasketballLoadingScreenProps {
  onComplete: () => void;
}

export const BasketballLoadingScreen: React.FC<BasketballLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 100;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setProgress(currentStep);

      if (currentStep >= steps) {
        clearInterval(interval);
        setTimeout(onComplete, 300);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [onComplete]);

  const ballY = progress < 90 ? 320 - progress * 2.8 : 225 + (progress - 90) * 8;
  const ballScale = progress > 90 ? 1 - (progress - 90) / 20 : 1;
  const netWave = progress > 90 ? (progress - 90) * 0.5 : 0;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 flex items-center justify-center z-50">
      <div className="relative">
        <svg width="300" height="500" viewBox="0 0 300 500">
          <defs>
            <linearGradient id="basketballGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B35" />
              <stop offset="100%" stopColor="#F7931E" />
            </linearGradient>

            <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4a574" />
              <stop offset="100%" stopColor="#c79b6f" />
            </linearGradient>

            <pattern id="basketballPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="18" fill="url(#basketballGradient)" />
              <path d="M 2 20 Q 20 10, 38 20" stroke="#333" strokeWidth="1.5" fill="none" />
              <path d="M 2 20 Q 20 30, 38 20" stroke="#333" strokeWidth="1.5" fill="none" />
              <path d="M 20 2 Q 10 20, 20 38" stroke="#333" strokeWidth="1.5" fill="none" />
              <path d="M 20 2 Q 30 20, 20 38" stroke="#333" strokeWidth="1.5" fill="none" />
            </pattern>
          </defs>

          <g transform="translate(150, 100)">
            <defs>
              <linearGradient id="backboardGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f5f5f5" />
                <stop offset="50%" stopColor="#e0e0e0" />
                <stop offset="100%" stopColor="#d0d0d0" />
              </linearGradient>
              <linearGradient id="rimGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff4500" />
                <stop offset="50%" stopColor="#ff6347" />
                <stop offset="100%" stopColor="#ff4500" />
              </linearGradient>
            </defs>

            <rect x="-50" y="-60" width="100" height="70" fill="url(#backboardGradient)" stroke="#999" strokeWidth="2" rx="3" />

            <rect x="-15" y="-25" width="30" height="35" fill="none" stroke="#e63946" strokeWidth="2.5" />

            <rect x="-4" y="10" width="8" height="70" fill="#666" rx="2" />
            <rect x="-55" y="80" width="110" height="6" fill="#666" rx="2" />

            <ellipse cx="0" cy="84" rx="50" ry="10" fill="none" stroke="url(#rimGradient)" strokeWidth="4" />

            <g>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => {
                const angle = (i / 16) * Math.PI * 2;
                const x1 = Math.cos(angle) * 50;
                const y1 = Math.sin(angle) * 10 + 84;
                const x2 = Math.cos(angle) * 45;
                const y2 = Math.sin(angle) * 9 + 84 + 35 + (i % 4) * netWave;

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#fff"
                    strokeWidth="2.5"
                    opacity={0.9}
                  />
                );
              })}
            </g>

            <path
              d="M -50 84 Q -45 119, -42 127"
              stroke="#fff"
              strokeWidth="2.5"
              fill="none"
              opacity={0.9}
            />
            <path
              d="M 50 84 Q 45 119, 42 127"
              stroke="#fff"
              strokeWidth="2.5"
              fill="none"
              opacity={0.9}
            />
          </g>

          <g transform={`translate(150, ${ballY}) scale(${ballScale})`}>
            <circle cx="0" cy="0" r="20" fill="url(#basketballGradient)" />
            <path d="M -18 0 Q 0 -10, 18 0" stroke="#333" strokeWidth="2" fill="none" />
            <path d="M -18 0 Q 0 10, 18 0" stroke="#333" strokeWidth="2" fill="none" />
            <path d="M 0 -18 Q -10 0, 0 18" stroke="#333" strokeWidth="2" fill="none" />
            <path d="M 0 -18 Q 10 0, 0 18" stroke="#333" strokeWidth="2" fill="none" />

            <ellipse cx="0" cy="25" rx="18" ry="4" fill="rgba(0,0,0,0.3)" opacity={progress < 90 ? 0.5 : 0} />
          </g>
        </svg>

        <div className="text-center mt-4">
          <div className="text-white text-4xl font-bold mb-2">
            {progress < 30 && "Taking the shot..."}
            {progress >= 30 && progress < 60 && "In the air..."}
            {progress >= 60 && progress < 90 && "Almost there..."}
            {progress >= 90 && progress < 100 && "SWISH! 🏀"}
            {progress === 100 && "ALL NET!"}
          </div>
          <div className="text-orange-400 text-2xl font-semibold">
            {progress}%
          </div>
        </div>
      </div>
    </div>
  );
};
