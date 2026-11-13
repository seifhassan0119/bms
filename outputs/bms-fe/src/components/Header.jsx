import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import Logo from './Logo';

export default function Header({ user, onLogout }) {
  return (
    <header role="banner" className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white safe-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Logo className="w-8 h-8 sm:w-9 sm:h-9" />
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg tracking-tight text-white">
                AxiomBank
              </span>
              <span className="text-[10px] text-emerald-400 font-bold -mt-1 hidden xs:inline tracking-wider uppercase">
                Manager Portal
              </span>
            </div>
          </div>

          {/* User Profile Badge & Sign Out */}
          {user && (
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {user.name || 'Manager'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 capitalize">
                  Branch Manager
                </span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                aria-label="Sign out of session"
                title="Sign Out"
                className="p-2 sm:p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-xs min-h-[36px] min-w-[36px] justify-center"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-semibold">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
