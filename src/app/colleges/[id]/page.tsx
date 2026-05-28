'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { College } from '@/types';
import { useAuth } from '@/components/AuthProvider';
import CompareBanner from '@/components/CompareBanner';

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'text-base' : 'text-sm';
  return (
    <span className={`${sz} text-amber-400`}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  );
}

const TABS = ['Overview', 'Courses', 'Placements', 'Reviews'];

export default function CollegeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, compareList, toggleCompare, openAuthModal, showToast } = useAuth();

  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '', pros: '', cons: '', batch: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/colleges/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) { setCollege(d.data.college); setSaved(d.data.college.isSaved); }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!user) { openAuthModal('login'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(data.data.saved);
        showToast(data.data.message);
      }
    } finally { setSaving(false); }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { openAuthModal('login'); return; }
    setReviewError('');
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId: id, ...reviewForm }),
      });
      const data = await res.json();
      if (!data.success) { setReviewError(data.error); return; }
      showToast('Review submitted!');
      // Refresh
      const refreshed = await fetch(`/api/colleges/${id}`).then((r) => r.json());
      if (refreshed.success) setCollege(refreshed.data.college);
      setReviewForm({ rating: 5, text: '', pros: '', cons: '', batch: '' });
    } finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div className="skeleton h-40 rounded-2xl" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
    </div>
  );

  if (!college) return (
    <div className="text-center py-20">
      <p className="text-slate-500">College not found.</p>
      <Link href="/colleges" className="text-blue-600 font-semibold mt-2 inline-block">Back to listings</Link>
    </div>
  );

  const isCompared = compareList.includes(college.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 fade-up">
      <button onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        ← Back
      </button>

      {/* Hero card */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1d4ed8] rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center font-bold text-lg shrink-0">
            {college.shortName}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{college.type}</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">NAAC {college.naacGrade}</span>
              <span className="text-xs bg-amber-400/80 text-slate-900 px-2 py-0.5 rounded-full font-semibold">Rank #{college.ranking}</span>
            </div>
            <h1 className="font-display font-bold text-2xl leading-tight">{college.name}</h1>
            <p className="text-blue-200 text-sm mt-1">📍 {college.location} · Est. {college.establishedYear} · {college.campusSize}</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button onClick={handleSave} disabled={saving}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                saved ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
              }`}>
              {saved ? '♥ Saved' : '♡ Save'}
            </button>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer justify-center">
              <input type="checkbox" checked={isCompared} onChange={() => toggleCompare(college.id)}
                className="accent-amber-400" />
              Compare
            </label>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Annual Fees', value: fmt(college.feesPerYear) },
          { label: 'Avg Package', value: fmt(college.avgPackage) },
          { label: 'Placement', value: `${college.placementRate}%` },
          { label: 'Rating', value: `${college.rating} ★` },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-xl p-4 text-center">
            <div className="font-display font-bold text-xl text-[#1e3a5f]">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-[#1e3a5f] text-[#1e3a5f]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Overview' && (
        <div className="space-y-6 fade-up">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">About {college.name}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{college.description}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Key Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['Total Students', college.totalStudents.toLocaleString()],
                ['Faculty', college.facultyCount.toLocaleString()],
                ['Campus Size', college.campusSize],
                ['Established', college.establishedYear],
                ['Hostel', college.hasHostel ? 'Available' : 'Not available'],
                ['Sports Facility', college.hasSports ? 'Available' : 'Not available'],
                ['Admission Cutoff', college.cutoff],
                ['Highest Package', fmt(college.highestPackage)],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-3">
                  <span className="text-xs text-slate-500 font-medium">{k}</span>
                  <span className="text-sm font-semibold text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </div>
          {college.website && (
            <a href={college.website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
              🌐 Visit official website ↗
            </a>
          )}
        </div>
      )}

      {activeTab === 'Courses' && (
        <div className="fade-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {college.courses?.map((course) => (
              <div key={course.id} className="bg-white border border-slate-100 rounded-xl p-4">
                <div className="font-semibold text-sm text-slate-800">{course.name}</div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-slate-500">{course.degree}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">{course.duration}</span>
                  {course.seats && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">{course.seats} seats</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Placements' && (
        <div className="space-y-5 fade-up">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Placed Students', value: `${college.placementRate}%` },
              { label: 'Avg CTC', value: fmt(college.avgPackage) },
              { label: 'Highest CTC', value: fmt(college.highestPackage) },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-slate-100 rounded-xl p-4 text-center">
                <div className="font-display font-bold text-2xl text-[#1e3a5f]">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Sector-wise Placement</h3>
            <div className="space-y-3">
              {college.placements?.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-36 shrink-0">{p.sector}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full bg-[#1e3a5f] bar-animated"
                      style={{ width: `${p.percent}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-8 text-right">{p.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Top Recruiters</h3>
            <div className="flex flex-wrap gap-2">
              {college.recruiters?.map((r) => (
                <span key={r.id}
                  className={`badge ${r.tier === 'premium' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                  {r.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Reviews' && (
        <div className="space-y-4 fade-up">
          {/* Avg rating summary */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-6">
            <div className="text-center">
              <div className="font-display font-bold text-4xl text-[#1e3a5f]">{college.rating.toFixed(1)}</div>
              <Stars rating={college.rating} size="md" />
              <div className="text-xs text-slate-500 mt-1">{college.reviews?.length} reviews</div>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = college.reviews?.filter((r) => r.rating === star).length || 0;
                const pct = college.reviews?.length ? (count / college.reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="text-amber-400 w-4">{star}★</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-slate-500 w-4">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews list */}
          {college.reviews?.map((review) => (
            <div key={review.id} className="bg-white border border-slate-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-sm text-slate-800">{review.user.name}</span>
                  {review.batch && <span className="text-xs text-slate-400 ml-2">Batch of {review.batch}</span>}
                </div>
                <Stars rating={review.rating} />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{review.text}</p>
              {(review.pros || review.cons) && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {review.pros && (
                    <div className="bg-green-50 rounded-xl p-3">
                      <div className="text-xs font-semibold text-green-700 mb-1">👍 Pros</div>
                      <div className="text-xs text-green-600">{review.pros}</div>
                    </div>
                  )}
                  {review.cons && (
                    <div className="bg-red-50 rounded-xl p-3">
                      <div className="text-xs font-semibold text-red-700 mb-1">👎 Cons</div>
                      <div className="text-xs text-red-600">{review.cons}</div>
                    </div>
                  )}
                </div>
              )}
              <div className="text-xs text-slate-400 mt-2">{new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}</div>
            </div>
          ))}

          {/* Write review */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Write a Review</h3>
            {!user ? (
              <div className="text-center py-4">
                <p className="text-slate-500 text-sm mb-3">Sign in to write a review</p>
                <button onClick={() => openAuthModal('login')}
                  className="px-5 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-semibold">
                  Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button"
                        onClick={() => setReviewForm((f) => ({ ...f, rating: s }))}
                        className={`text-2xl transition-transform hover:scale-110 ${s <= reviewForm.rating ? 'text-amber-400' : 'text-slate-200'}`}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Review *</label>
                  <textarea value={reviewForm.text} onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
                    placeholder="Share your experience at this college... (min. 20 characters)"
                    rows={4} required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none outline-none focus:border-blue-300" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pros</label>
                    <input type="text" value={reviewForm.pros} onChange={(e) => setReviewForm((f) => ({ ...f, pros: e.target.value }))}
                      placeholder="What did you like?"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cons</label>
                    <input type="text" value={reviewForm.cons} onChange={(e) => setReviewForm((f) => ({ ...f, cons: e.target.value }))}
                      placeholder="What could be better?"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-300" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Batch Year</label>
                  <input type="text" value={reviewForm.batch} onChange={(e) => setReviewForm((f) => ({ ...f, batch: e.target.value }))}
                    placeholder="e.g. 2023"
                    className="w-40 px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-300" />
                </div>
                {reviewError && (
                  <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2.5">{reviewError}</div>
                )}
                <button type="submit" disabled={submittingReview}
                  className="px-6 py-2.5 bg-[#1e3a5f] text-white rounded-xl text-sm font-semibold hover:bg-[#162d4a] disabled:opacity-60">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {compareList.length > 0 && <div className="h-16" />}
      {compareList.length > 0 && <CompareBanner />}
    </div>
  );
}
