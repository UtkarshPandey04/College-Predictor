'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { College } from '@/types';
import CollegeCard from '@/components/CollegeCard';
import CompareBanner from '@/components/CompareBanner';
import { useAuth } from '@/components/AuthProvider';

const TYPES = ['All', 'IIT', 'NIT', 'IIM', 'Private', 'Deemed'];
const STATES = ['All', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Rajasthan', 'Gujarat', 'Uttar Pradesh', 'West Bengal'];
const SORTS = [
  { value: 'ranking', label: 'Best Ranked' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'placement', label: 'Best Placement' },
  { value: 'package', label: 'Highest Package' },
  { value: 'fees_low', label: 'Fees: Low to High' },
  { value: 'fees_high', label: 'Fees: High to Low' },
];

export default function CollegesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { compareList } = useAuth();

  const [colleges, setColleges] = useState<College[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || 'All');
  const [state, setState] = useState(searchParams.get('state') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'ranking');
  const [page, setPage] = useState(1);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type !== 'All') params.set('type', type);
    if (state !== 'All') params.set('state', state);
    params.set('sort', sort);
    params.set('page', String(page));
    params.set('limit', '9');

    try {
      const res = await fetch(`/api/colleges?${params}`);
      const data = await res.json();
      if (data.success) {
        setColleges(data.data.colleges);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [search, type, state, sort, page]);

  useEffect(() => { fetchColleges(); }, [fetchColleges]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, type, state, sort]);

  const clearFilters = () => {
    setSearch(''); setType('All'); setState('All'); setSort('ranking');
  };

  const hasFilters = search || type !== 'All' || state !== 'All' || sort !== 'ranking';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-900">College Listings</h1>
        <p className="text-slate-500 text-sm mt-1">Explore and filter top colleges across India</p>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search colleges, courses, locations..."
              className="flex-1 text-sm outline-none bg-transparent" />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 outline-none">
            {TYPES.map((t) => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
          <select value={state} onChange={(e) => setState(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 outline-none">
            {STATES.map((s) => <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 outline-none">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters}
              className="px-3 py-2 text-sm text-red-500 border border-red-100 rounded-xl hover:bg-red-50">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {loading ? 'Loading...' : `${total} college${total !== 1 ? 's' : ''} found`}
        </p>
        {compareList.length > 0 && (
          <button onClick={() => router.push('/compare')}
            className="text-sm text-blue-600 font-semibold hover:underline">
            Compare {compareList.length} selected →
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : colleges.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-semibold text-slate-700 mb-1">No colleges found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your filters or search term</p>
          <button onClick={clearFilters} className="mt-4 text-sm text-blue-600 font-semibold hover:underline">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colleges.map((c) => (
            <CollegeCard key={c.id} college={c} onSaveToggle={() => fetchColleges()} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 text-sm border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50">
            ← Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 text-sm rounded-xl ${page === i + 1 ? 'bg-[#1e3a5f] text-white' : 'border border-slate-200 hover:bg-slate-50'}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 text-sm border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50">
            Next →
          </button>
        </div>
      )}

      {compareList.length > 0 && <CompareBanner />}
    </div>
  );
}
