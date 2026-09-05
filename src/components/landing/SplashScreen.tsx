import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number; // total duration in ms, default 5500ms
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 5500,
}) => {
  // Phases:
  // 'enter'  (0ms - 150ms): initial appearance
  // 'grow'   (150ms - 3200ms): logo slowly grows bigger with sonar ripples
  // 'reveal' (3200ms - 4700ms): logo shrinks backward, backdrop turns semi-transparent so landing page is slightly visible behind
  // 'exit'   (4700ms - 5500ms): smooth complete fade out into landing page
  // 'done'   (5500ms+): unmounted
  const [phase, setPhase] = useState<'enter' | 'grow' | 'reveal' | 'exit' | 'done'>('enter');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Phase 1: Begin slow, majestic expansion
    const timerGrow = setTimeout(() => {
      setPhase('grow');
    }, 150);

    // Phase 2: Start backward shrink & reveal landing page behind
    const timerReveal = setTimeout(() => {
      setPhase('reveal');
    }, 3200);

    // Phase 3: Final smooth fade out
    const timerExit = setTimeout(() => {
      setPhase('exit');
    }, Math.max(4200, duration - 800));

    // Phase 4: Done, unmount
    const timerDone = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearTimeout(timerGrow);
      clearTimeout(timerReveal);
      clearTimeout(timerExit);
      clearTimeout(timerDone);
    };
  }, [duration, onComplete]);

  // Instant graceful skip on click or Esc / Space key
  const handleDismiss = React.useCallback(() => {
    if (isDismissed || phase === 'done') return;
    setIsDismissed(true);
    setPhase('exit');
    setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 400);
  }, [isDismissed, phase, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss]);

  if (phase === 'done') {
    return null;
  }

  // Backdrop opacity & style depending on phase:
  // - enter/grow: solid white
  // - reveal: semi-transparent with soft blur so the landing page behind is slightly visible!
  // - exit: completely fades to 0
  let backdropClass = 'bg-white opacity-100';
  if (phase === 'reveal') {
    backdropClass = 'bg-white/70 backdrop-blur-[2px] opacity-90';
  } else if (phase === 'exit' || isDismissed) {
    backdropClass = 'bg-white/0 backdrop-blur-none opacity-0 pointer-events-none';
  }

  // Logo transform & opacity
  let logoTransform = 'scale(0.90)';
  let logoOpacity = 0;
  let logoTransition = 'all 2800ms cubic-bezier(0.16, 1, 0.3, 1)';

  if (phase === 'grow') {
    logoTransform = 'scale(1.12)';
    logoOpacity = 1;
    logoTransition = 'all 2800ms cubic-bezier(0.16, 1, 0.3, 1)';
  } else if (phase === 'reveal') {
    // Logo becomes a little smaller ("disappears backward")
    logoTransform = 'scale(0.92)';
    logoOpacity = 0.55;
    logoTransition = 'all 1600ms cubic-bezier(0.4, 0, 0.2, 1)';
  } else if (phase === 'exit' || isDismissed) {
    logoTransform = 'scale(0.85)';
    logoOpacity = 0;
    logoTransition = 'all 700ms ease-out';
  }

  const isGrowing = phase === 'grow';

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none transition-all duration-1000 ease-in-out cursor-pointer ${backdropClass}`}
      aria-label="VAINATEYA Launch Splash Screen"
    >
      {/* Background Acoustic Waves / Sonar Rings */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div
          className={`absolute w-72 h-72 rounded-full border border-blue-200/60 transition-all duration-[3000ms] ease-out ${isGrowing ? 'scale-[2.6] opacity-0' : 'scale-50 opacity-70'
            }`}
        />
        <div
          className={`absolute w-96 h-96 rounded-full border border-sky-300/50 transition-all duration-[3000ms] delay-300 ease-out ${isGrowing ? 'scale-[3.0] opacity-0' : 'scale-50 opacity-50'
            }`}
        />
        <div
          className={`absolute w-[32rem] h-[32rem] rounded-full border border-teal-200/40 transition-all duration-[3000ms] delay-600 ease-out ${isGrowing ? 'scale-[3.4] opacity-0' : 'scale-50 opacity-40'
            }`}
        />
        {/* Soft center ambient glow */}
        <div className="absolute w-96 h-96 bg-gradient-to-tr from-blue-100/50 via-sky-50/60 to-transparent rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Centered VAINATEYA Logo & Tagline */}
      <div
        className="relative z-10 flex flex-col items-center px-4 max-w-lg w-full"
        style={{
          transform: logoTransform,
          opacity: logoOpacity,
          transition: logoTransition,
        }}
      >
        <img
          src="/vainateya-logo.png"
          alt="VAINATEYA - When human vision ends, perception continues."
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  );
};
