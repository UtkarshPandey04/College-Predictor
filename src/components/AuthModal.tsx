'use client';
import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function AuthModal() {
  const { showAuthModal, closeAuthModal, login, signup } = useAuth();
  const [tab, setTab] = useState(showAuthModal || 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) closeAuthModal(); }}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-8 relative">
        <button onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-light">×</button>

        <div className="text-center mb-6">
          <div className="font-display font-bold text-2xl text-[#1e3a5f] mb-1">
            Univ<span className="text-amber-500">Find</span>
          </div>
          <h2 className="font-display font-semibold text-xl mt-3">
            {tab === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {tab === 'login'
              ? 'Sign in to save and compare colleges'
              : 'Join 12L+ students making smart choices'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
          {['login', 'signup'].map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}>
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
              <input type="text" required value={form.name} onChange={(e) => update('name', e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
            <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)}
              placeholder="you@email.com"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
            <input type="password" required value={form.password} onChange={(e) => update('password', e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2.5 border border-red-100">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-semibold hover:bg-[#162d4a] disabled:opacity-60 transition-colors">
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-4">
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-blue-600 font-semibold">
            {tab === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        {tab === 'login' && (
          <p className="text-center text-xs text-slate-400 mt-3">
            Demo: demo@univfind.in / password123
          </p>
        )}
      </div>
    </div>
  );
}
