'use client';
import Link from 'next/link';
import { College } from '@/types';
import { useAuth } from './AuthProvider';
import { useState } from 'react';

const TYPE_COLORS: Record<string, string> = {
  IIT: 'bg-blue-100 text-blue-700',
  NIT: 'bg-green-100 text-green-700',
  IIM: 'bg-pink-100 text-pink-700',
  Private: 'bg-slate-100 text-slate-700',
  Deemed: 'bg-amber-100 text-amber-700',
};

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-amber-400">{'★'.repeat(Math.round(rating))}</span>
      <span className="font-semibold text-slate-700">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function CollegeCard({ college, onSaveToggle }: { college: College; onSaveToggle?: (id: string, saved: boolean) => void }) {
  const { user, compareList, toggleCompare, openAuthModal, showToast } = useAuth();
  const [saved, setSaved] = useState(college.isSaved ?? false);
  const [savingState, setSavingState] = useState(false);
  const isCompared = compareList.includes(college.id);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { openAuthModal('login'); return; }
    setSavingState(true);
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId: college.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(data.data.saved);
        showToast(data.data.saved ? `Saved ${college.name}` : `Removed ${college.name}`);
        onSaveToggle?.(college.id, data.data.saved);
      }
    } finally {
      setSavingState(false);
    }
  };

  const handleCompare = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleCompare(college.id);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 card-hover transition-all relative group">
      {/* Save button */}
      <button onClick={handleSave} disabled={savingState}
        className={`absolute top-4 right-4 text-xl transition-colors ${
          saved ? 'text-red-500' : 'text-slate-300 group-hover:text-slate-400'
        }`}>
        {saved ? '♥' : '♡'}
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {college.shortName}
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <span className={`badge text-xs ${TYPE_COLORS[college.type] || 'bg-slate-100 text-slate-600'}`}>
            {college.type}
          </span>
          <h3 className="font-semibold text-slate-900 text-sm mt-1 leading-tight">{college.name}</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <span>📍</span> {college.location}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <Stars rating={college.rating} />
        <span className="text-xs text-slate-500">Rank #{college.ranking}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 mb-3">
        <div className="text-center">
          <div className="text-sm font-bold text-slate-800">{fmt(college.feesPerYear)}</div>
          <div className="text-xs text-slate-500">Fees/yr</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-slate-800">{fmt(college.avgPackage)}</div>
          <div className="text-xs text-slate-500">Avg Pkg</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-slate-800">{college.placementRate}%</div>
          <div className="text-xs text-slate-500">Placed</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link href={`/colleges/${college.id}`}
          className="flex-1 text-center text-sm font-medium bg-[#1e3a5f] text-white rounded-xl py-2 hover:bg-[#162d4a] transition-colors">
          View Details
        </Link>
        <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer shrink-0">
          <input type="checkbox" checked={isCompared} onChange={handleCompare}
            className="w-3.5 h-3.5 accent-blue-600" />
          Compare
        </label>
      </div>
    </div>
  );
}
