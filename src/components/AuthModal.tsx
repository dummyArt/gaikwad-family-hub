import React, { useState } from 'react';
import {
  User,
  Lock,
  Mail,
  Phone,
  Calendar,
  Key,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { t, language } = useLanguage();
  const { login, register, switchDemoUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthday, setBirthday] = useState('');
  const [address, setAddress] = useState('');
  const [inviteToken, setInviteToken] = useState(() => {
    // Check url parameter ?invite=...
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('invite') || '';
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const res = await register({
      name,
      email,
      phone,
      relationship,
      birthday,
      address,
      inviteToken
    });
    setLoading(false);

    if (res.success) {
      setSuccessMessage(res.message || 'Registration submitted for Admin approval!');
      setTimeout(() => {
        onClose();
      }, 2500);
    } else {
      setErrorMessage(res.error || 'Registration failed');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setSuccessMessage(data.message);
      } else {
        setErrorMessage(data.error || 'Failed to process request');
      }
    } catch {
      setLoading(false);
      setErrorMessage('Network error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-amber-300 dark:border-stone-800 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
              GF
            </div>
            <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-white">
              {mode === 'login' ? t.loginTitle : mode === 'register' ? t.registerTitle : t.forgotPassword}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                {t.emailLabel} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="04227kunalsaxena@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-stone-700 dark:text-stone-300">
                  {t.passwordLabel}
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-semibold"
                >
                  {t.forgotPassword}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-md transition-all mt-2"
            >
              {loading ? t.loading : t.loginButton}
            </button>

            <div className="text-center pt-2 text-stone-500">
              <span>{language === 'hi' ? 'नया परिवार सदस्य?' : 'New family member?'} </span>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-amber-700 dark:text-amber-400 font-bold hover:underline"
              >
                {t.registerButton}
              </button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="mt-4 space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                {t.fullNameLabel} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Gaikwad"
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                {t.emailLabel} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gaikwadfamily.org"
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {t.relationLabel}
                </label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="Son / Daughter / Cousin"
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {t.birthdayLabel}
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                {t.phoneLabel}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                {t.inviteTokenLabel}
              </label>
              <input
                type="text"
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                placeholder="e.g. GAIKWAD-FAMILY-2026"
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            <p className="text-[11px] text-amber-800 dark:text-amber-400 italic">
              {t.pendingApprovalNotice}
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-md transition-all mt-2"
            >
              {loading ? t.loading : t.registerButton}
            </button>

            <div className="text-center pt-1 text-stone-500">
              <span>{language === 'hi' ? 'पहले से खाता है?' : 'Already have an account?'} </span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-amber-700 dark:text-amber-400 font-bold hover:underline"
              >
                {t.loginButton}
              </button>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="mt-4 space-y-3.5 text-xs">
            <p className="text-stone-600 dark:text-stone-400">
              {language === 'hi'
                ? 'अपना पंजीकृत ईमेल दर्ज करें। हम रीसेट निर्देश या व्यवस्थापक संपर्क सहायता प्रदान करेंगे।'
                : 'Enter your registered email address. Password reset instructions will be processed.'}
            </p>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                {t.emailLabel}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gaikwadfamily.org"
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md"
            >
              {loading ? t.loading : t.resetPassword}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-stone-500 hover:text-stone-800 font-semibold"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {/* Quick Role Switcher for Verification & Evaluation */}
        <div className="mt-5 pt-4 border-t border-stone-200 dark:border-stone-800 text-xs">
          <p className="font-bold text-stone-500 text-[10px] uppercase tracking-wider mb-2 text-center">
            ⚡ Quick Test Role Switcher
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => {
                switchDemoUser('super_admin');
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold truncate text-left"
            >
              👑 Kunal (Super Admin)
            </button>
            <button
              type="button"
              onClick={() => {
                switchDemoUser('admin');
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 font-bold truncate text-left"
            >
              🛡️ Dada ji (Admin)
            </button>
            <button
              type="button"
              onClick={() => {
                switchDemoUser('member');
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold truncate text-left"
            >
              👤 Priya (Member)
            </button>
            <button
              type="button"
              onClick={() => {
                switchDemoUser('pending');
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold truncate text-left"
            >
              ⏳ Vikas (Pending)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
