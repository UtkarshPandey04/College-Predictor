'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { College } from '@/types';
import { useAuth } from '@/components/AuthProvider';

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

const METRICS = [
  { label: 'Type', key: 'type', fmt: (v: unknown) => String(v), best: null },
  { label: 'Location', key: 'location', fmt: (v: unknown) => String(v), best: null },
  { label: 'National Ranking', key: 'ranking', fmt: (v: unknown) => `#${v}`, best: 'low' },
  { label: 'Rating', key: 'rating', fmt: (v: unknown) => `${Number(v).toFixed(1)} ★`, best: 'high' },
  { label: 'Annual Fees', key: 'feesPerYear', fmt: (v: unknown) => fmt(Number(v)), best: 'low' },
  { label: 'Avg Package', key: 'avgPackage', fmt: (v: unknown) => fmt(Number(v)), best: 'high' },
  { label: 'Highest Package', key: 'highestPackage', fmt: (v: unknown) => fmt(Number(v)), best: 'high' },
  { label: 'Placement Rate', key: 'placementRate', fmt: (v: unknown) => `${v}%`, best: 'high' },
  { label: 'Students', key: 'totalStudents', fmt: (v: unknown) => Number(v).toLocaleString(), best: null },
  { label: 'Faculty', key: 'facultyCount', fmt: (v: unknown) => Number(v).toLocaleString(), best: null },
  { label: 'NAAC Grade', key: 'naacGrade', fmt: (v: unknown) => String(v), best: null },
  { label: 'Campus Size', key: 'campusSize', fmt: (v: unknown) => String(v), best: null },
  { label: 'Established', key: 'establishedYear', fmt: (v: unknown) => String(v), best: null },
  { label: 'Hostel', key: 'hasHostel', fmt: (v: unknown) => (v ? '✅ Yes' : '❌ No'), best: null },
  { label: 'Sports', key: 'hasSports', fmt: (v: unknown) => (v ? '✅ Yes' : '❌ No'), best: null },
];

function getBest(colleges: College[], key: string, direction: 'high' | 'low' | null) {
  if (!direction) return null;
  const vals = colleges.map((c) => Number((c as Record<string, unknown>)[key]));
  return direction === 'high' ? Math.max(...vals) : Math.min(...vals);
}

export default function ComparePage() {
  const { compareList, toggleCompare, clearCompare } = useAuth();
  const router = useRouter();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compareList.length < 2) { setColleges([]); return; }
    setLoading(true);
    const params = compareList.map((id) => `ids=${id}`).join('&');
    fetch(`/api/compare?${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setColleges(d.data.colleges); })
      .finally(() => setLoading(false));
  }, [compareList]);

  if (compareList.length < 2) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">⚖️</div>
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">Compare Colleges</h1>
        <p className="text-slate-500 mb-6">
          Select at least 2 colleges from the listing to compare them side by side.
        </p>
        <Link href="/colleges"
          className="inline-block px-6 py-3 bg-[#1e3a5f] text-white rounded-xl font-semibold hover:bg-[#162d4a]">
          Browse Colleges
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">College Comparison</h1>
          <p className="text-slate-500 text-sm mt-1">Comparing {colleges.length} colleges side by side</p>
        </div>
        <div className="flex gap-2">
          <Link href="/colleges"
            className="px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">
            + Add more
          </Link>
          <button onClick={clearCompare}
            className="px-4 py-2 text-sm text-red-500 border border-red-100 rounded-xl hover:bg-red-50">
            Clear all
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-100 border border-green-300 inline-block" />
          Best in category
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-50 border border-red-200 inline-block" />
          Worst in category
        </span>
      </div>

      {/* Comparison table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left p-4 text-slate-500 font-medium text-xs w-36 bg-slate-50">Metric</th>
                {colleges.map((c) => (
                  <th key={c.id} className="p-4 text-left min-w-[180px]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] text-white flex items-center justify-center text-xs font-bold mb-1">
                          {c.shortName.slice(0, 2)}
                        </div>
                        <div className="font-semibold text-slate-900 text-sm">{c.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{c.location}</div>
                      </div>
                      <button onClick={() => toggleCompare(c.id)}
                        className="text-slate-300 hover:text-red-400 text-lg shrink-0">×</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((metric, idx) => {
                const bestVal = getBest(colleges, metric.key, metric.best as 'high' | 'low' | null);
                const worstVal = metric.best
                  ? getBest(colleges, metric.key, metric.best === 'high' ? 'low' : 'high')
                  : null;
                return (
                  <tr key={metric.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-4 text-xs font-medium text-slate-500 bg-slate-50 border-r border-slate-100">
                      {metric.label}
                    </td>
                    {colleges.map((c) => {
                      const rawVal = (c as Record<string, unknown>)[metric.key];
                      const numVal = Number(rawVal);
                      const isBest = bestVal !== null && numVal === bestVal;
                      const isWorst = worstVal !== null && numVal === worstVal && colleges.length > 1 && bestVal !== worstVal;
                      return (
                        <td key={c.id}
                          className={`p-4 font-medium text-sm ${
                            isBest ? 'bg-green-50 text-green-700' :
                            isWorst ? 'bg-red-50 text-red-600' :
                            'text-slate-800'
                          }`}>
                          {metric.fmt(rawVal)}
                          {isBest && <span className="ml-1 text-xs">👑</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Placements comparison */}
      {colleges.length > 0 && colleges[0].placements && (
        <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Placement Sector Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colleges.map((c) => (
              <div key={c.id}>
                <div className="font-medium text-sm text-slate-700 mb-3">{c.name}</div>
                <div className="space-y-2">
                  {c.placements?.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-28 shrink-0 truncate">{p.sector}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full bg-[#1e3a5f]" style={{ width: `${p.percent}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{p.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recruiters comparison */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Top Recruiters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colleges.map((c) => (
            <div key={c.id}>
              <div className="font-medium text-sm text-slate-700 mb-2">{c.name}</div>
              <div className="flex flex-wrap gap-1.5">
                {c.recruiters?.map((r) => (
                  <span key={r.id}
                    className={`text-xs px-2 py-1 rounded-full ${r.tier === 'premium' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-wrap gap-3">
        {colleges.map((c) => (
          <Link key={c.id} href={`/colleges/${c.id}`}
            className="px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700">
            View {c.shortName} details →
          </Link>
        ))}
      </div>
    </div>
  );
}
