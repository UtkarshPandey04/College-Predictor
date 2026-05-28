'use client';
import { useAuth } from './AuthProvider';

export default function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[300] bg-slate-800 text-white text-sm px-4 py-3 rounded-xl shadow-xl fade-up max-w-sm">
      {toast}
    </div>
  );
}
