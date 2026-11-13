import React, { useState } from 'react';
import { Lock, User, ShieldAlert, ArrowRight } from 'lucide-react';
import { authenticateStaff } from '../utils/staffStorage';
import Logo from './Logo';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('manager');
  const [password, setPassword] = useState('manager123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both your username and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const staffUser = authenticateStaff(username.trim().toLowerCase(), password);
        if (staffUser) {
          onLoginSuccess(staffUser);
        } else {
          setError('Invalid username or password. Please verify your credentials and try again.');
        }
      } catch (err) {
        setError(err.message || 'Authentication failed.');
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen flex items-center justify-center p-3 sm:p-6 bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white"
    >
      <div className="relative w-full max-w-md mx-auto my-auto">
        {/* Sign In Card */}
        <section
          aria-labelledby="signin-heading"
          className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6"
        >
          {/* Brand Logo & Title */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <Logo className="w-16 h-16 sm:w-18 sm:h-18" />
            </div>
            <div>
              <h1 id="signin-heading" className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                AxiomBank
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Manager Portal</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-2.5 animate-in fade-in duration-150"
              >
                <ShieldAlert aria-hidden="true" className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label htmlFor="login-username" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User aria-hidden="true" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  aria-invalid={!!error}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-base sm:text-sm bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock aria-hidden="true" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!error}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-base sm:text-sm bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight aria-hidden="true" className="w-4 h-4" />
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
