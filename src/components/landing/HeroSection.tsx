import { Waves, ShieldCheck, Anchor, Cpu } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20 bg-gradient-to-b from-white via-sky-50/40 to-slate-50">
      {/* Background Radar Rings Graphic (Light Subtle Blue) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full border border-blue-200/60 animate-pulse-glow"></div>
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full border border-blue-300/50"></div>
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full border border-blue-300/60"></div>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] border-r border-blue-400/50 animate-radar-sweep origin-center"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">

        {/* Main Headline in one line */}
        <div className="space-y-4 max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight leading-tight">
            AI-Powered{' '}
            <span className="bg-gradient-to-r from-blue-700 via-sky-600 to-teal-600 bg-clip-text text-transparent">
              Marine Debris Detection
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-normal max-w-3xl mx-auto leading-relaxed">
            Detect and locate underwater debris from Side-Scan Sonar imagery to support cleaner oceans and safer coastal communities.
          </p>
        </div>

        {/* Live Survey Telemetry Ticker Strip */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-md grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
            <div>
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Model Accuracy</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">94.8%</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">mAP@50 (YOLO SSS)</div>
            </div>

            <div>
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 mb-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>Shadow Verification</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">38.4%</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">False-Positives Reduced</div>
            </div>

            <div>
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 mb-1">
                <Waves className="w-3.5 h-3.5 text-sky-600" />
                <span>Survey Swath</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">455/900</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">kHz Dual Acoustic Beam</div>
            </div>

            <div>
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 mb-1">
                <Anchor className="w-3.5 h-3.5 text-blue-600" />
                <span>Survey Area Mapped</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono">14,820</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">km² Coastal Shelf</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
