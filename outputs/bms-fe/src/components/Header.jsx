import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  ArrowRightLeft,
  ShieldCheck,
  LogOut,
  User,
} from 'lucide-react';
import Logo from './Logo';

export default function Header({
  activeTab,
  setActiveTab,
  pendingCounts,
  user,
  onLogout,
  onOpenNewAccount,
  onOpenNewTransaction,
}) {
  const totalPending = (pendingCounts?.accounts || 0) + (pendingCounts?.transactions || 0);
  const isManager = user?.role === 'manager';

  // Exactly 2 primary navigation tabs: Dashboard (with accounts embedded) & Requests/Ledger combined
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'operations',
      label: 'Requests & Ledger',
      icon: Receipt,
      badge: isManager && totalPending > 0 ? totalPending : null,
    },
  ];

  return (
    <header role="banner" className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white safe-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Logo className="w-8 h-8 sm:w-9 sm:h-9" />
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg tracking-tight text-white">
                ApexCore
              </span>
              <span className="text-[10px] text-emerald-400 font-bold -mt-1 hidden xs:inline tracking-wider uppercase">
                Bank Portal
              </span>
            </div>
          </div>

          {/* Desktop Navigation: Exactly 2 tabs */}
          <nav aria-label="Main Navigation" className="hidden sm:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-xs font-bold rounded-full bg-amber-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action & Session Controls */}
          <div className="flex items-center gap-2">
            {/* Quick action: New Transaction Request (Teller) */}
            <button
              type="button"
              onClick={onOpenNewTransaction}
              title="Submit Money Request"
              aria-label="Submit Money Request"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors min-h-[36px]"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Money Request</span>
              <span className="sm:hidden text-[11px]">Request</span>
            </button>

            {/* Quick action: Apply for Account */}
            <button
              type="button"
              onClick={onOpenNewAccount}
              title="Apply for New Bank Account"
              aria-label="Apply for New Bank Account"
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors min-h-[36px]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Apply Account</span>
              <span className="md:hidden text-[11px]">Apply</span>
            </button>

            {/* User Profile Badge & Sign Out */}
            {user && (
              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-white flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {user.name || user.username}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 capitalize">
                    {user.role === 'manager' ? 'Manager (Approves)' : 'Teller (Requests)'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Sign out of session"
                  title="Sign Out"
                  className="p-2 sm:p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-rose-400 transition-colors flex items-center gap-1 text-xs min-h-[36px] min-w-[36px] justify-center"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline font-semibold">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar: Exactly 2 tabs */}
        <nav
          aria-label="Mobile Navigation"
          className="flex sm:hidden items-center justify-around py-1.5 border-t border-slate-800 -mx-3 px-2"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center justify-center gap-2 py-1.5 px-4 rounded-xl text-xs font-semibold transition-colors min-h-[40px] flex-1 ${
                  isActive ? 'text-emerald-400 bg-slate-800 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-amber-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
