'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { College } from '@/types';
import { useAuth } from '@/components/AuthProvider';
import CollegeCard from '@/components/CollegeCard';
import CompareBanner from '@/components/CompareBanner';

export default function SavedPage() {
  const { user, loading: authLoading, openAuthModal, compareList } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/saved');
      const data = await res.json();
      if (data.success) setColleges(data.data.colleges);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchSaved();
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="skeleton h-8 w-48 rounded-xl mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🔖</div>
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">Saved Colleges</h1>
        <p className="text-slate-500 mb-6">Sign in to save colleges and access them anytime.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => openAuthModal('login')}
            className="px-6 py-3 bg-[#1e3a5f] text-white rounded-xl font-semibold hover:bg-[#162d4a]">
            Sign In
          </button>
          <button onClick={() => openAuthModal('signup')}
            className="px-6 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50">
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Saved Colleges</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading...' : `${colleges.length} college${colleges.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>
        {colleges.length > 0 && (
          <Link href="/colleges"
            className="text-sm text-blue-600 font-semibold hover:underline">
            Browse more →
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : colleges.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💔</div>
          <h2 className="font-semibold text-slate-700 mb-2">No saved colleges yet</h2>
          <p className="text-slate-500 text-sm mb-6">
            Click the ♡ button on any college card to save it here.
          </p>
          <Link href="/colleges"
            className="inline-block px-6 py-3 bg-[#1e3a5f] text-white rounded-xl font-semibold hover:bg-[#162d4a]">
            Browse Colleges
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {colleges.map((c) => (
              <CollegeCard key={c.id} college={c} onSaveToggle={() => fetchSaved()} />
            ))}
          </div>

          {/* Summary card */}
          <div className="mt-8 bg-gradient-to-r from-[#1e3a5f] to-[#1d4ed8] rounded-2xl p-6 text-white">
            <h3 className="font-semibold text-lg mb-1">Ready to compare?</h3>
            <p className="text-blue-200 text-sm mb-4">
              Select colleges using the Compare checkbox and compare them side by side.
            </p>
            <Link href="/compare"
              className="inline-block px-5 py-2 bg-amber-400 text-slate-900 rounded-xl text-sm font-semibold hover:bg-amber-300">
              Go to Compare →
            </Link>
          </div>
        </>
      )}

      {compareList.length > 0 && <div className="h-16" />}
      {compareList.length > 0 && <CompareBanner />}
    </div>
  );
}
