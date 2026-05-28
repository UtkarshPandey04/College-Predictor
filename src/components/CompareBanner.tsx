'use client';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';

export default function CompareBanner({ collegeName }: { collegeName?: (id: string) => string }) {
  const { compareList, toggleCompare, clearCompare } = useAuth();
  const router = useRouter();

  if (!compareList.length) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1e3a5f] text-white py-3 px-4 flex items-center gap-3 shadow-2xl">
      <span className="text-sm font-semibold shrink-0">Comparing:</span>
      <div className="flex gap-2 flex-1 flex-wrap">
        {compareList.map((id) => (
          <div key={id} className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs">
            <span>{collegeName?.(id) || id.slice(0, 8)}</span>
            <button onClick={() => toggleCompare(id)} className="opacity-70 hover:opacity-100 text-sm">×</button>
          </div>
        ))}
        {compareList.length < 3 && (
          <div className="flex items-center gap-1 text-xs opacity-60 px-2 py-1 border border-white/30 rounded-full">
            + Add {3 - compareList.length} more
          </div>
        )}
      </div>
      <button onClick={() => router.push('/compare')}
        className="bg-amber-400 text-slate-900 px-4 py-1.5 rounded-xl text-sm font-semibold hover:bg-amber-300 transition-colors shrink-0">
        Compare Now
      </button>
      <button onClick={clearCompare}
        className="text-xs opacity-60 hover:opacity-100 shrink-0">Clear</button>
    </div>
  );
}
