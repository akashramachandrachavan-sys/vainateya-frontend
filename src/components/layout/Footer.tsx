import React from 'react';

interface Props {
  onOpenPrivacy?: () => void;
}

export const Footer: React.FC<Props> = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center space-x-2.5 text-slate-900 font-extrabold text-base font-['Space_Grotesk']">
              <img
                src="/vainateya-symbol.png"
                alt="VAINATEYA"
                className="w-6 h-6 object-contain"
              />
              <span className="tracking-wider">VAINATEYA</span>
              <span className="text-[10px] font-mono font-normal text-slate-500 italic hidden sm:inline">
                &mdash; "When human vision ends, perception continues."
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed font-sans">
              Smart India Hackathon 2026 (PS 26057) prototype for autonomous marine debris classification, acoustic shadow relief verification, and geospatial plotting from Side-Scan Sonar (SSS) imagery for the Ministry of Earth Sciences (MoES) & NIOT.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright on left, Developed with ❤️ prominently covering from PS 26057 to the right edge */}
        <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-slate-500 text-xs font-mono text-left shrink-0">
            &copy; 2026 VAINATEYA &bull; Smart India Hackathon Prototype (PS 26057).
          </p>

          <div className="flex-1 flex justify-start md:justify-end items-center pl-0 md:pl-6 text-left md:text-right">
            <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight flex items-center gap-2 sm:gap-3 flex-wrap justify-start md:justify-end">
              <span>Developed with</span>
              <span className="text-rose-500 text-2xl sm:text-3xl lg:text-4xl animate-pulse inline-block">❤️</span>
              <span className="bg-gradient-to-r from-blue-700 via-sky-600 to-teal-600 bg-clip-text text-transparent">
                for Ocean Conservation
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
