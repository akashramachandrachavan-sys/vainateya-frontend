import { ArrowRight, Waves, ShieldCheck, Anchor, Cpu } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-sky-50/40 to-slate-50">
      {/* Background Radar Rings Graphic (Light Subtle Blue) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full border border-blue-200/60 animate-pulse-glow"></div>
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full border border-blue-300/50"></div>
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full border border-blue-300/60"></div>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] border-r border-blue-400/50 animate-radar-sweep origin-center"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* VAINATEYA Identity Pill */}
        <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-mono">
          <img src="/vainateya-symbol.png" alt="VAINATEYA" className="w-4 h-4 object-contain" />
          <span className="font-bold text-slate-900 tracking-wider">VAINATEYA</span>
          <span className="text-slate-300">&bull;</span>
          <span className="text-blue-600 font-semibold italic">"When human vision ends, perception must continue."</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight leading-[1.1]">
            Autonomous Underwater <br />
            <span className="bg-gradient-to-r from-blue-700 via-sky-600 to-teal-600 bg-clip-text text-transparent">
              Marine Debris Detection
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-normal max-w-3xl mx-auto leading-relaxed">
            Harnessing high-frequency <b>Side-Scan Sonar (SSS) imagery</b>, deep-learning <b>YOLOv12 detection</b>, and rigorous <b>acoustic shadow geometry verification</b> to classify ghost nets, chemical containers, and submerged debris with precise GPS geotagging.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href="/dashboard.html"
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base tracking-wide transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            <span>Launch Sonar Detection Studio</span>
            <ArrowRight className="w-5 h-5" />
          </a>

          <a
            href="/auth.html?mode=signin"
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base border border-slate-300 hover:border-blue-400 transition-all shadow-sm"
          >
            <span>Sign In / Register</span>
          </a>
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
