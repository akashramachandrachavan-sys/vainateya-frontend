import { HeroSection } from './HeroSection';
import { ProblemAndSolutionSection } from './ProblemAndSolutionSection';
import { ArrowRight } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="space-y-0 bg-slate-50 text-slate-900">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Problem and 6-Step Pipeline */}
      <ProblemAndSolutionSection />

      {/* 3. Bottom Call to Action Banner: Turn Sonar Data Into Action (No background image) */}
      <section className="relative overflow-hidden bg-[#02182c] border-t border-slate-800 py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="space-y-2 sm:space-y-3">
            {/* Main Headline */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight leading-tight">
              Turn Sonar Data Into{' '}
              <span className="text-sky-400 font-bold">Action.</span>
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
              Upload Side-Scan Sonar imagery, let VAINATEYA identify potential underwater debris and anomalies.
            </p>
          </div>

          {/* Interactive Button */}
          <div>
            <a
              href="/auth.html?mode=signup"
              className="inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm md:text-base shadow-xl shadow-blue-600/50 hover:shadow-blue-500/60 hover:scale-105 active:scale-95 transition-all duration-200 group"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Bottom Tagline & Accent Line */}
          <div className="pt-2 space-y-1.5">
            <p className="text-[9px] sm:text-[10px] md:text-[11px] font-mono font-medium tracking-[0.22em] text-slate-400 uppercase">
              CLEANER OCEANS BRIGHTER TOMORROWS
            </p>
            <div className="w-5 sm:w-6 h-0.5 bg-sky-400/80 mx-auto rounded-full shadow-xs" />
          </div>
        </div>
      </section>
    </div>
  );
}
