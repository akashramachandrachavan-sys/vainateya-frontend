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
      </div>
    </div>
  );
}
