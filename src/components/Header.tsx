import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, loginWithGoogle, logout, isFirebaseConfigured } from '../lib/firebase';
import { User } from 'firebase/auth';
import { ShieldCheck, Cloud, CloudOff, LogIn, LogOut, Award, Scale, BookOpen } from 'lucide-react';
import { LAW_FOCUS_QUOTES, LawQuote } from '../types';

interface HeaderProps {
  currentUser: User | null;
  syncStatus: 'offline' | 'loading' | 'synced' | 'error';
  totalMinutes: number;
}

export function Header({ currentUser, syncStatus, totalMinutes }: HeaderProps) {
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Stagger / rotate the motivating quote every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIdx((prev) => (prev + 1) % LAW_FOCUS_QUOTES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const activeQuote: LawQuote = LAW_FOCUS_QUOTES[currentQuoteIdx];

  const handleAuthAction = async () => {
    if (currentUser) {
      if (confirm("Are you sure you want to sign out? Your cloud data is secure.")) {
        await logout();
      }
    } else {
      try {
        await loginWithGoogle();
      } catch (err: any) {
        alert("Google Login is only supported after Firebase is fully set up via the platform Secrets & setup panel. In the meantime, full offline local storage mode is active!");
      }
    }
  };

  return (
    <header id="app-header" className="w-full bg-white border-b border-slate-200 py-3.5 px-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
      {/* Title block with LexHabit visual identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-100">
          <div className="w-3.5 h-3.5 border-2 border-white rounded-sm rotate-45"></div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
              LexHabit
            </h1>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200/80">
              Focus Vault
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Law student dashboard & deep work engine</p>
        </div>
      </div>

      {/* Quote Block - Beautiful, centered, with Slate styling */}
      <div className="hidden lg:flex items-center flex-1 max-w-xl mx-8 px-4 border-l border-slate-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuoteIdx}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.4 }}
            className="text-left"
          >
            <p className="text-xs italic text-slate-700 tracking-wide font-sans">
              "{activeQuote.quote}"
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
              — {activeQuote.author} {activeQuote.explanation && `• ${activeQuote.explanation}`}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stats, Cloud status, and auth controls */}
      <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap md:flex-nowrap">
        {/* Study Score Counter */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl py-1 px-3">
          <Award className="w-4 h-4 text-indigo-600" />
          <div className="text-right">
            <span className="block text-[8px] font-mono leading-none text-slate-400 uppercase tracking-wider">TOTAL FOCUS</span>
            <span className="text-xs font-bold font-sans text-slate-900">{totalMinutes} Mins</span>
          </div>
        </div>

        {/* Sync Status Banner matching "Synced: Desktop & Mobile" style */}
        <div className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold flex items-center gap-1.5 uppercase tracking-wider transition-all duration-300 ${
          syncStatus === 'synced' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
            : syncStatus === 'loading'
            ? 'bg-amber-50 text-amber-800 border-amber-100 animate-pulse'
            : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          {syncStatus === 'synced' ? (
            <>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span>Synced: Desktop & Mobile</span>
            </>
          ) : syncStatus === 'loading' ? (
            <>
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
              <span>Syncing Archive...</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
              <span>Local Offline Mode</span>
            </>
          )}
        </div>

        {/* Auth profile segment */}
        <div className="relative">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                id="btn-profile"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors"
              >
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-6 h-6 rounded-lg object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center font-mono uppercase">
                    {currentUser.displayName ? currentUser.displayName.slice(0, 2) : currentUser.email ? currentUser.email.slice(0, 2) : 'LS'}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate hidden sm:inline">
                  {currentUser.displayName || currentUser.email || 'Counselor'}
                </span>
              </button>

              <button
                id="btn-signout"
                onClick={handleAuthAction}
                title="Sign Out"
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="btn-signin"
              onClick={handleAuthAction}
              className="flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold py-2 px-3.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-slate-200/50"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-200" />
              <span>Sign In to Sync</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
