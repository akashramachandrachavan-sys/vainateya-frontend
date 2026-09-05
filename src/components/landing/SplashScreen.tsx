import React, { useEffect, useState, useCallback } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number; // total duration in ms, default 1300ms
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 1300,
}) => {
  // States: 'enter' -> 'visible' -> 'exit' -> 'done'
  const [stage, setStage] = useState<'enter' | 'visible' | 'exit' | 'done'>('enter');

  const handleDismiss = useCallback(() => {
    if (stage === 'done' || stage === 'exit') return;
    setStage('exit');
    setTimeout(() => {
      setStage('done');
      if (onComplete) onComplete();
    }, 250);
  }, [stage, onComplete]);

  useEffect(() => {
    // 1. Enter to visible immediately on next tick for smooth transition
    const rAf = requestAnimationFrame(() => {
      setStage('visible');
    });

    // 2. Start graceful exit fade
    const exitDelay = Math.max(500, duration - 350);
    const timerExit = setTimeout(() => {
      setStage('exit');
    }, exitDelay);

    // 3. Complete and unmount
    const timerDone = setTimeout(() => {
      setStage('done');
      if (onComplete) onComplete();
    }, duration);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(rAf);
      clearTimeout(timerExit);
      clearTimeout(timerDone);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [duration, handleDismiss, onComplete]);

  if (stage === 'done') {
    return null;
  }

  const isExit = stage === 'exit';
  const isVisible = stage === 'visible';

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none bg-white cursor-pointer transition-opacity duration-300 ease-out ${isExit ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      style={{ willChange: 'opacity' }}
      aria-label="VAINATEYA Launch Splash Screen"
    >
      {/* Subtle, lightweight ambient pulse */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div
          className={`w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-blue-200/60 transition-all duration-700 ease-out ${isVisible ? 'scale-125 opacity-25' : 'scale-75 opacity-70'
            } ${isExit ? 'opacity-0 scale-150' : ''}`}
          style={{ willChange: 'transform, opacity' }}
        />
        <div
          className={`absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-blue-50/70 transition-opacity duration-500 ease-out ${isExit ? 'opacity-0' : 'opacity-60'
            }`}
        />
      </div>

      {/* Main Centered VAINATEYA Logo */}
      <div
        className={`relative z-10 flex flex-col items-center px-4 max-w-sm sm:max-w-md w-full transition-all duration-400 ease-out ${isVisible && !isExit
            ? 'opacity-100 scale-100 translate-y-0'
            : isExit
              ? 'opacity-0 scale-95 -translate-y-1'
              : 'opacity-0 scale-90 translate-y-2'
          }`}
        style={{ willChange: 'transform, opacity' }}
      >
        <img
          src="/vainateya-logo.png"
          alt="VAINATEYA"
          className="w-full h-auto object-contain drop-shadow-xs"
        />
      </div>
    </div>
  );
};

