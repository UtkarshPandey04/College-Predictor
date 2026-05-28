'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import AuthModal from './AuthModal';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, compareList, openAuthModal, showAuthModal } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/colleges', label: 'Colleges' },
    {
      href: '/compare',
      label: `Compare${compareList.length ? ` (${compareList.length})` : ''}`,
    },
    { href: '/saved', label: 'Saved' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg text-[#1e3a5f] shrink-0">
            <span className="w-7 h-7 bg-[#1e3a5f] text-white rounded-lg flex items-center justify-center text-sm">U</span>
            Univ<span className="text-amber-500">Find</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 ml-4">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 ml-auto">
            {user ? (
              <>
                <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-sm font-semibold">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700">{user.name.split(' ')[0]}</span>
                <button onClick={logout}
                  className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 border border-slate-200">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => openAuthModal('login')}
                  className="text-sm text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 border border-slate-200">
                  Sign in
                </button>
                <button onClick={() => openAuthModal('signup')}
                  className="text-sm text-white px-4 py-1.5 rounded-lg bg-[#1e3a5f] hover:bg-[#162d4a]">
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden ml-auto p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="w-5 h-0.5 bg-slate-700 mb-1" />
            <div className="w-5 h-0.5 bg-slate-700 mb-1" />
            <div className="w-5 h-0.5 bg-slate-700" />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 flex flex-col gap-2">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === l.href ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                }`}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <button onClick={() => { logout(); setMenuOpen(false); }}
                className="text-sm text-left px-3 py-2 text-slate-600">
                Sign out ({user.name})
              </button>
            ) : (
              <div className="flex gap-2 mt-1">
                <button onClick={() => { openAuthModal('login'); setMenuOpen(false); }}
                  className="flex-1 text-sm border border-slate-200 rounded-lg py-2">Sign in</button>
                <button onClick={() => { openAuthModal('signup'); setMenuOpen(false); }}
                  className="flex-1 text-sm bg-[#1e3a5f] text-white rounded-lg py-2">Sign up</button>
              </div>
            )}
          </div>
        )}
      </nav>

      {showAuthModal && <AuthModal />}
    </>
  );
}
