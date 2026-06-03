import { useState } from 'react';
import { useAppState } from './lib/store';
import { Header } from './components/Header';
import { HabitList } from './components/HabitList';
import { StudyTimer } from './components/StudyTimer';
import { BriefingKit } from './components/BriefingKit';
import { WeeklyFocusChart } from './components/WeeklyFocusChart';
import { Scale, BookOpen, Clock, Dumbbell, ShieldCheck, Plus, Trash2, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRESET_LAW_SUBJECTS } from './types';

export default function App() {
  const {
    currentUser,
    loading,
    syncStatus,
    habits,
    timerSessions,
    caseBriefs,
    pagesReadEntries,
    addHabit,
    toggleHabitCompletion,
    deleteHabit,
    logTimerSession,
    saveCaseBrief,
    deleteCaseBrief,
    logPagesRead,
    deletePagesRead
  } = useAppState();

  const [isDistractionFree, setIsDistractionFree] = useState(false);
  
  // Local state for logging pages read
  const [isLoggingPages, setIsLoggingPages] = useState(false);
  const [pagesInput, setPagesInput] = useState<number>(10);
  const [pagesSubject, setPagesSubject] = useState<string>('PERSONS AND FAMILY RELATIONS');
  const [pagesNotes, setPagesNotes] = useState<string>('');

  // Calculate total focus minutes Completed
  const totalMinutes = timerSessions.reduce((acc, curr) => acc + Math.round(curr.duration / 60), 0);
  
  // Sum total pages read count
  const totalPagesRead = (pagesReadEntries || []).reduce((acc, curr) => acc + (curr.count || 0), 0);

  // Loading Screen Template
  if (loading) {
    return (
      <div id="loading-view" className="fixed inset-0 bg-neutral-50 flex flex-col items-center justify-center font-sans">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="p-3 bg-neutral-900 rounded-xl text-white mb-4"
        >
          <Scale className="w-8 h-8 stroke-[1.5]" />
        </motion.div>
        <p className="text-sm font-semibold text-neutral-800 tracking-tight animate-pulse">
          Opening Focus Vault...
        </p>
        <p className="text-xs text-neutral-400 mt-1">Gearing legal parameters</p>
      </div>
    );
  }

  return (
    <div id="app-container" className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col transition-colors duration-300">
      
      {/* 1. Orchestrated Navigation Header */}
      {!isDistractionFree && (
        <Header 
          currentUser={currentUser} 
          syncStatus={syncStatus} 
          totalMinutes={totalMinutes} 
        />
      )}

      {/* 2. Primary Layout Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Dynamic header summary statistics metrics banner */}
        {!isDistractionFree && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Stat block 1 - Case Briefs updated with Sleek border and indigo tones */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 flex items-center gap-3.5 shadow-sm transition-all duration-200">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/50">
                <BookOpen className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">CASES READ</span>
                <span className="text-base md:text-lg font-extrabold text-slate-900 tracking-tight">
                  {caseBriefs.length} Case{caseBriefs.length !== 1 ? 's' : ''} Read
                </span>
              </div>
            </div>

            {/* Stat block 2 - Pages Read block styled with amber tones and active trigger */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 flex items-center justify-between gap-3.5 shadow-sm transition-all duration-200">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100/50 flex-shrink-0">
                  <FileText className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">PAGES READ</span>
                  <span className="text-base md:text-lg font-extrabold text-slate-900 tracking-tight block truncate">
                    {totalPagesRead} Page{totalPagesRead !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsLoggingPages(true)}
                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 rounded-xl transition-all border border-amber-100/30 font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Log</span>
              </button>
            </div>

            {/* Stat block 3 - Focus block updated with violet tones */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 flex items-center gap-3.5 shadow-sm transition-all duration-200">
              <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl border border-violet-100/50">
                <Clock className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">DEEP FOCUS SESSIONS</span>
                <span className="text-base md:text-lg font-extrabold text-slate-900 tracking-tight">
                  {timerSessions.length} Session{timerSessions.length !== 1 ? 's' : ''} Logged
                </span>
              </div>
            </div>

            {/* Stat block 4 - Habits updated with emerald/mint tones */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 flex items-center gap-3.5 shadow-sm transition-all duration-200">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/50">
                <Dumbbell className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">HABITS MAINTAINED</span>
                <span className="text-base md:text-lg font-extrabold text-slate-900 tracking-tight">
                  {habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length} of {habits.length} Met Today
                </span>
              </div>
            </div>
          </div>
        )}

        {/* The 3-panel layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
          {/* Column 1: Habit list tracker */}
          <div className={`${isDistractionFree ? 'hidden' : 'lg:col-span-4'} flex flex-col`}>
            <HabitList 
              habits={habits}
              addHabit={addHabit}
              toggleHabitCompletion={toggleHabitCompletion}
              deleteHabit={deleteHabit}
            />
          </div>

          {/* Column 2: Interactive Countdown Timer */}
          <div className={`${isDistractionFree ? 'col-span-12' : 'lg:col-span-4'} flex flex-col`}>
            <StudyTimer 
              logTimerSession={logTimerSession}
              isDistractionFree={isDistractionFree}
              setIsDistractionFree={setIsDistractionFree}
            />
          </div>

          {/* Column 3: Briefing card notebook */}
          <div className={`${isDistractionFree ? 'hidden' : 'lg:col-span-4'} flex flex-col`}>
            <BriefingKit 
              caseBriefs={caseBriefs}
              saveCaseBrief={saveCaseBrief}
              deleteCaseBrief={deleteCaseBrief}
            />
          </div>
        </div>

        {/* 3. Weekly Focus Consistency Insights & Chart */}
        {!isDistractionFree && (
          <WeeklyFocusChart timerSessions={timerSessions} />
        )}
      </main>

      {/* Footer system details */}
      {!isDistractionFree && (
        <footer id="app-footer" className="bg-white border-t border-slate-200 py-4.5 px-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-slate-400 font-mono font-bold tracking-wider">
            LAW STUDENT FOCUS • REAL-TIME DESTRUCT-FREE VAULT ENGINE
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-sans font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2]" />
            <span>Encrypted local storage with real-time Firebase syncing</span>
          </div>
        </footer>
      )}

      {/* Pages read logger popup modal */}
      <AnimatePresence>
        {isLoggingPages && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoggingPages(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
            />
            
            {/* Dialog Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col z-10 font-sans"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 tracking-tight text-sm">Log Pages Read</h3>
                </div>
                <button 
                  onClick={() => setIsLoggingPages(false)}
                  className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-4 md:p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                {/* Subject Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Focusing Subject
                  </label>
                  <select
                    value={pagesSubject}
                    onChange={(e) => setPagesSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden transition-all"
                  >
                    {PRESET_LAW_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* Pages Counter input */}
                <div>
                  <label className="block text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Pages Completed
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={pagesInput}
                      onChange={(e) => setPagesInput(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-20 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-center font-mono font-bold text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
                    />
                    <div className="flex-1 grid grid-cols-4 gap-1.5">
                      {[5, 10, 20, 50].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setPagesInput(val)}
                          className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                            pagesInput === val
                              ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          +{val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Optional short comment */}
                <div>
                  <label className="block text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Reading Notes / Assignment (Optional)
                  </label>
                  <input
                    type="text"
                    value={pagesNotes}
                    onChange={(e) => setPagesNotes(e.target.value)}
                    placeholder="e.g. Chapter 2; Title III Cases 1 to 5"
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-hidden focus:bg-white focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={async () => {
                    if (pagesInput > 0) {
                      await logPagesRead(pagesInput, pagesSubject, pagesNotes);
                      setPagesNotes('');
                      setIsLoggingPages(false);
                    }
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors shadow-sm mt-1 cursor-pointer"
                >
                  Confirm and Log Pages
                </button>

                {/* List of recent logs */}
                {pagesReadEntries && pagesReadEntries.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 mt-1.5">
                    <span className="block text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-2">
                      Recent Reading Logs
                    </span>
                    <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {pagesReadEntries.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex justify-between items-center gap-2 group text-[11px]">
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-800 block truncate">{entry.subject}</span>
                            <span className="text-slate-500 font-medium block truncate">
                              {entry.count} pages {entry.notes && `• ${entry.notes}`}
                            </span>
                          </div>
                          <button
                            onClick={() => deletePagesRead(entry.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-200/50 transition-colors flex-shrink-0 cursor-pointer"
                            title="Delete Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

