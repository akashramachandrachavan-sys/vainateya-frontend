import { HeroSection } from './HeroSection';
import { ProblemAndSolutionSection } from './ProblemAndSolutionSection';
import { TechStackShowcase } from './TechStackShowcase';
import { ArrowRight } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="space-y-0 bg-slate-50 text-slate-900">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Problem and 6-Step Pipeline */}
      <ProblemAndSolutionSection />

      {/* 3. Tech Stack Showcase */}
      <TechStackShowcase />

      {/* 4. Bottom Call to Action Banner: Turn Sonar Data Into Action */}
      <section className="relative overflow-hidden bg-[#02182c] border-t border-slate-800">
        <div className="relative w-full max-w-[1440px] mx-auto">
          {/* Pristine text-free underwater background - sea turtle, reef, sunbeams, shipwreck */}
          <img
            src="/marine-clean-bg.png"
            alt="Turn Sonar Data Into Action"
            className="w-full h-auto block select-none"
          />

          {/* Actual Sharp Vector Text & Interactive Button Overlaid Above the Image */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
            <div className="space-y-1 sm:space-y-2.5 mt-2 sm:mt-5 md:mt-7">
              {/* Main Headline */}
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-[44px] font-extrabold text-white font-['Space_Grotesk'] tracking-tight leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                Turn Sonar Data Into{' '}
                <span className="text-sky-400 font-bold">Action.</span>
              </h2>

              {/* Subtitle */}
              <p className="text-[11px] sm:text-sm md:text-base text-slate-100/95 max-w-xl mx-auto leading-relaxed font-normal drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
                Upload Side-Scan Sonar imagery, let VAINATEYA identify potential underwater debris and anomalies.
              </p>
            </div>

            {/* Interactive Button */}
            <div className="mt-3 sm:mt-5 md:mt-6 pointer-events-auto">
              <a
                href="/auth.html?mode=signup"
                className="inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm md:text-base shadow-xl shadow-blue-600/50 hover:shadow-blue-500/60 hover:scale-105 active:scale-95 transition-all duration-200 group"
              >
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Bottom Tagline & Accent Line */}
            <div className="mt-4 sm:mt-7 md:mt-9 space-y-1">
              <p className="text-[9px] sm:text-[10px] md:text-[11px] font-mono font-medium tracking-[0.22em] text-slate-300 uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                CLEANER OCEANS BRIGHTER TOMORROWS
              </p>
              <div className="w-5 sm:w-6 h-0.5 bg-sky-400/80 mx-auto rounded-full shadow-xs" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
