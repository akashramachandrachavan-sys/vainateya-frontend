import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number; // total duration in ms, default 5000ms
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 5000,
}) => {
  // Fade out starts 600ms before completion
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // 1. Begin smooth, gentle fade-out towards the end of the 5s window
    const fadeDelay = Math.max(500, duration - 600);
    const timerFade = setTimeout(() => {
      setIsFadingOut(true);
    }, fadeDelay);

    // 2. Complete and unmount cleanly after full duration
    const timerDone = setTimeout(() => {
      setIsDone(true);
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerDone);
    };
  }, [duration, onComplete]);

  if (isDone) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none bg-white transition-opacity duration-700 ease-in-out ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      aria-label="VAINATEYA Launch Splash Screen"
    >
      {/* Centered VAINATEYA Logo - Steady and calm without blinking */}
      <div
        className={`relative z-10 flex flex-col items-center px-4 max-w-sm sm:max-w-md w-full transition-transform duration-700 ease-in-out ${isFadingOut ? 'scale-98' : 'scale-100'
          }`}
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
