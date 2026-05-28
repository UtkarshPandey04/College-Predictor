'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  compareList: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  showAuthModal: string | null;
  openAuthModal: (tab?: string) => void;
  closeAuthModal: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // Restore compare list from localStorage
    const saved = localStorage.getItem('uf_compare');
    if (saved) setCompareList(JSON.parse(saved));

    // Check auth
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.success) setUser(d.data.user); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('uf_compare', JSON.stringify(compareList));
  }, [compareList]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setUser(data.data.user);
    closeAuthModal();
    showToast(`Welcome back, ${data.data.user.name}!`);
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setUser(data.data.user);
    closeAuthModal();
    showToast(`Welcome to UnivFind, ${data.data.user.name}!`);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    showToast('Signed out successfully');
  };

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) { showToast('Max 3 colleges for comparison'); return prev; }
      return [...prev, id];
    });
  };

  const clearCompare = () => setCompareList([]);
  const openAuthModal = (tab = 'login') => setShowAuthModal(tab);
  const closeAuthModal = () => setShowAuthModal(null);

  return (
    <AuthContext.Provider value={{
      user, loading, login, signup, logout,
      compareList, toggleCompare, clearCompare,
      showAuthModal, openAuthModal, closeAuthModal,
      toast, showToast,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
