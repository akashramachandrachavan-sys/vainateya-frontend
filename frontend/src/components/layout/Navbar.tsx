import React from 'react';
import type { UserProfile } from '../../types';
import { LogIn, LogOut } from 'lucide-react';

interface Props {
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[73px] py-1 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <a
          href="/index.html"
          className="flex items-center space-x-3 group shrink-0"
        >
          <img
            src="/vainateya-symbol.png"
            alt="VAINATEYA Logo"
            className="w-11 h-11 object-contain group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-wider font-['Space_Grotesk'] text-slate-900">
                VAINATEYA
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-200">
                PS 26057
              </span>
            </div>
            <p className="text-[10.5px] font-mono text-blue-600 font-medium -mt-0.5 hidden sm:block italic">
              When human vision ends, perception continues.
            </p>
          </div>
        </a>



        {/* User Auth: Single Compact Button */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-800">{currentUser.name}</div>
                <div className="text-[10px] font-mono text-blue-600 font-medium">{currentUser.role}</div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <a
              href="/auth.html?mode=signin"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Sign Up</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
