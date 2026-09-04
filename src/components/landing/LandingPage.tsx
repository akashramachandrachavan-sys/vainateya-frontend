import { HeroSection } from './HeroSection';
import { ProblemAndSolutionSection } from './ProblemAndSolutionSection';
import { TechStackShowcase } from './TechStackShowcase';
import { ArrowRight, Anchor } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="space-y-0 bg-slate-50 text-slate-900">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Problem and 4-Step Pipeline */}
      <ProblemAndSolutionSection />

      {/* 3. Tech Stack Showcase */}
      <TechStackShowcase />

      {/* 5. Bottom Call to Action Banner */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-white to-blue-50/60 border-t border-slate-200 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mb-2 shadow-sm">
            <Anchor className="w-8 h-8" />
          </div>


          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
            Ready to Protect Our Marine Ecosystems?
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Experience the automated Side-Scan Sonar detection pipeline, test custom hydrographic swaths, and verify benthic targets with acoustic shadow geometry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="/auth.html?mode=signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base tracking-wide transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2"
            >
              <span>Create Free Officer Account</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <a
              href="/dashboard.html"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base border border-slate-300 hover:border-blue-400 transition-all shadow-sm flex items-center justify-center"
            >
              Enter Detection Studio Directly
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
