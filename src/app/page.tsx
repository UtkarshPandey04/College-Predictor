'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { College } from '@/types';
import CollegeCard from '@/components/CollegeCard';
import CompareBanner from '@/components/CompareBanner';
import { useAuth } from '@/components/AuthProvider';

function fmt(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(0)}L`;
  return `${n}`;
}

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [topColleges, setTopColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const { compareList } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/colleges?limit=4&sort=ranking')
      .then((r) => r.json())
      .then((d) => { if (d.success) setTopColleges(d.data.colleges); })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/colleges?search=${encodeURIComponent(search)}`);
    else router.push('/colleges');
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #0ea5e9 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full" /> 10 colleges listed · Updated 2024
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4 leading-tight">
            Find Your Perfect<br />
            <span className="text-amber-400">College in India</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Search, compare and discover top colleges across India. Real placement data, student reviews, fees and more.
          </p>

          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search college, course, location..."
              className="flex-1 px-4 py-3.5 rounded-2xl text-slate-900 text-sm outline-none shadow-lg" />
            <button type="submit"
              className="px-6 py-3.5 bg-amber-400 text-slate-900 rounded-2xl font-semibold hover:bg-amber-300 transition-colors whitespace-nowrap shadow-lg">
              Search
            </button>
          </form>

          <div className="flex justify-center gap-8 mt-10 text-center">
            {[['800+', 'Colleges'], ['50+', 'Courses'], ['12L+', 'Students'], ['98%', 'Satisfaction']].map(([v, l]) => (
              <div key={l}>
                <div className="text-2xl font-display font-bold">{v}</div>
                <div className="text-blue-200 text-xs mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature pills */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex gap-3 flex-wrap justify-center">
          {[
            ['🏆', 'Rankings', '/colleges?sort=ranking'],
            ['💰', 'Best Value', '/colleges?sort=fees_low'],
            ['📈', 'Top Placements', '/colleges?sort=placement'],
            ['⭐', 'Highest Rated', '/colleges?sort=rating'],
            ['🎓', 'IIT Colleges', '/colleges?type=IIT'],
            ['🏫', 'NIT Colleges', '/colleges?type=NIT'],
          ].map(([emoji, label, href]) => (
            <Link key={label} href={href}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-full text-sm font-medium text-slate-700 transition-colors">
              {emoji} {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Top Colleges */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-900">Top Colleges</h2>
            <p className="text-slate-500 text-sm mt-1">Based on national rankings & placement records</p>
          </div>
          <Link href="/colleges" className="text-sm text-blue-600 font-semibold hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topColleges.map((c) => <CollegeCard key={c.id} college={c} />)}
          </div>
        )}
      </div>

      {/* Stats section */}
      <div className="bg-[#1e3a5f] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ['₹32L', 'Highest Package', 'Among listed colleges'],
            ['100%', 'Placement Rate', 'IIM Ahmedabad'],
            ['4.9/5', 'Top Rating', 'IIM Ahmedabad'],
            ['1922', 'Oldest College', 'Delhi University'],
          ].map(([val, label, sub]) => (
            <div key={label}>
              <div className="font-display font-bold text-3xl text-amber-400">{val}</div>
              <div className="font-semibold mt-1">{label}</div>
              <div className="text-blue-200 text-xs mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {compareList.length > 0 && <div className="h-16" />}
      {compareList.length > 0 && <CompareBanner />}
    </div>
  );
}
