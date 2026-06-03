import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TimerType, PRESET_LAW_SUBJECTS, LAW_FOCUS_QUOTES } from '../types';
import { Play, Pause, RotateCcw, Volume2, Maximize2, Minimize2, Check, Clock, ShieldAlert } from 'lucide-react';

interface StudyTimerProps {
  logTimerSession: (duration: number, type: TimerType, subject: string) => Promise<void>;
  isDistractionFree: boolean;
  setIsDistractionFree: (value: boolean) => void;
}

export function StudyTimer({ logTimerSession, isDistractionFree, setIsDistractionFree }: StudyTimerProps) {
  // Preset timers in seconds
  const PRESETS = [
    { name: 'Pomodoro', duration: 1500, type: 'pomodoro' as TimerType },
    { name: 'Case Briefing', duration: 2700, type: 'custom' as TimerType },
    { name: 'Exam Block', duration: 3600, type: 'custom' as TimerType },
    { name: 'Short Break', duration: 300, type: 'short_break' as TimerType },
    { name: 'Long Break', duration: 900, type: 'long_break' as TimerType },
  ];

  const [activePresetIdx, setActivePresetIdx] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(PRESETS[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(PRESET_LAW_SUBJECTS[0]);
  const [customMinutes, setCustomMinutes] = useState('25');
  const [customEnabled, setCustomEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Breathing simulation state for Distraction-Free mode
  const [breathPhase, setBreathPhase] = useState<'In' | 'Hold' | 'Out'>('In');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesizes an elegant sound chord without needing external asset files
  const playSynthesizedChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Chime note frequencies (C major 7th chord aura)
      const notes = [261.63, 329.63, 392.00, 493.88];
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Stagger entrance slightly for arpeggio effect
        const start = ctx.currentTime + (idx * 0.1);
        osc.start(start);
        
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 1.8);
        osc.stop(start + 2.0);
      });
    } catch (e) {
      console.warn("Web Audio API not supported or blocked by browser gesture constraints", e);
    }
  };

  // Timer loop logic
  useEffect(() => {
    if (isActive && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsRemaining]);

  // Breathing Cycle loop (Breathing guide triggers every 8 seconds)
  useEffect(() => {
    if (!isDistractionFree) return;
    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === 'In') return 'Hold';
        if (prev === 'Hold') return 'Out';
        return 'In';
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isDistractionFree]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    playSynthesizedChime();

    const loggedDuration = PRESETS[activePresetIdx].duration - secondsRemaining;
    const finalDuration = loggedDuration > 0 ? loggedDuration : PRESETS[activePresetIdx].duration;

    try {
      await logTimerSession(
        finalDuration,
        PRESETS[activePresetIdx].type,
        selectedSubject
      );
      alert(`🎉 Excellent session! Completed ${Math.round(finalDuration / 60)} minutes of ${selectedSubject}. Your session has been synced.`);
    } catch (e) {
      console.error("Session recording error boundaries caught exception:", e);
    }

    // Reset back to preset duration
    setSecondsRemaining(PRESETS[activePresetIdx].duration);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (customEnabled) {
      const parsed = parseInt(customMinutes);
      setSecondsRemaining(isNaN(parsed) ? 1500 : parsed * 60);
    } else {
      setSecondsRemaining(PRESETS[activePresetIdx].duration);
    }
  };

  const selectPreset = (idx: number) => {
    setActivePresetIdx(idx);
    setCustomEnabled(false);
    setIsActive(false);
    setSecondsRemaining(PRESETS[idx].duration);
  };

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customMinutes);
    if (isNaN(parsed) || parsed <= 0 || parsed > 480) return;

    setCustomEnabled(true);
    setIsActive(false);
    setSecondsRemaining(parsed * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeDurationMax = customEnabled 
    ? (parseInt(customMinutes) || 25) * 60 
    : PRESETS[activePresetIdx].duration;

  const progressPercentage = ((activeDurationMax - secondsRemaining) / activeDurationMax) * 100  // Render Distraction-Free View (Focus Vault Overlay)
  if (isDistractionFree) {
    return (
      <AnimatePresence>
        <motion.div
          id="focus-vault"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col items-center justify-between p-6 md:p-12 font-sans overflow-hidden select-none"
        >
          {/* Top header stats */}
          <div className="w-full max-w-4xl flex items-center justify-between border-b border-slate-900 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">
                Focus Vault Active • Subject: {selectedSubject}
              </span>
            </div>

            <button
              id="btn-trigger-vault-volume"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              <Volume2 className={`w-4 h-4 ${soundEnabled ? 'opacity-100' : 'opacity-40 line-through'}`} />
            </button>
          </div>

          {/* Core Luminous Timer Core & Breathing Ring */}
          <div className="flex flex-col items-center justify-center my-auto gap-12">
            <div className="relative flex items-center justify-center w-72 h-72 md:w-80 md:h-80 select-none">
              
              {/* Dynamic Respiratory Pulsing Ring */}
              <motion.div
                animate={{
                  scale: breathPhase === 'In' ? 1.15 : breathPhase === 'Hold' ? 1.15 : 0.95,
                  opacity: breathPhase === 'In' ? 0.4 : breathPhase === 'Hold' ? 0.6 : 0.2,
                }}
                transition={{ duration: 4.5, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full border-2 border-indigo-900/30 bg-indigo-950/10"
              />

              {/* Glowing circular progress indicator */}
              <svg className="absolute w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  className="stroke-slate-900 fill-none"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  className="stroke-indigo-500 fill-none"
                  strokeWidth="5"
                  strokeDasharray="282.6%"
                  animate={{ strokeDashoffset: `${282.6 - (282.6 * progressPercentage) / 100}%` }}
                  transition={{ ease: "linear" }}
                />
              </svg>

              {/* Big Typography Numbers */}
              <div className="z-10 text-center">
                <span className="text-6xl md:text-7xl font-extrabold tracking-tighter font-sans block tabular-nums leading-none">
                  {formatTime(secondsRemaining)}
                </span>
                <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-bold block mt-3 uppercase">
                  {breathPhase === 'In' ? 'Breathe In' : breathPhase === 'Hold' ? 'Hold & Focus' : 'Exhale Slowly'}
                </span>
              </div>
            </div>

            {/* Quick Interactive Controls */}
            <div className="flex items-center gap-5">
              <button
                id="btn-vault-reset"
                onClick={resetTimer}
                className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full text-slate-300 transition-colors cursor-pointer shadow-sm"
                title="Reset session"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                id="btn-vault-play-pause"
                onClick={toggleTimer}
                className="p-6 rounded-full font-bold transition-all transform scale-110 shadow-lg bg-indigo-650 hover:bg-indigo-600 text-white cursor-pointer hover:shadow-indigo-500/20"
              >
                {isActive ? <Pause className="w-6 h-6 stroke-[2.5]" /> : <Play className="w-6 h-6 stroke-[2.5]" />}
              </button>

              <button
                id="btn-vault-complete-early"
                onClick={handleTimerComplete}
                className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-full text-slate-300 transition-colors cursor-pointer shadow-sm"
                title="Settle/Complete session early"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrolling legal wisdom */}
          <div className="w-full max-w-2xl text-center border-t border-slate-900 pt-6">
            <p className="text-xs italic text-slate-400 max-w-lg mx-auto">
              "The physical requirements of reading casebooks demand rigorous, unwavering mental posture."
            </p>
            <button
              id="btn-exit-vault"
              onClick={() => setIsDistractionFree(false)}
              className="mt-6 flex items-center gap-1.5 mx-auto bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold py-2.5 px-5 rounded-xl transition-all text-slate-200 cursor-pointer shadow-sm"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Deactivate Focus Vault</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Normal / Desktop & Mobile Standard View
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 flex flex-col shadow-sm h-full justify-between gap-5 relative">
      
      {/* Top Section Headers */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Deep Focus Timer
            </h2>
            <p className="text-xs text-slate-500">Distraction-free Pomodoro study cycles</p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-toggle-sound"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'bg-slate-50 text-slate-500 hover:bg-slate-105 border-slate-200' 
                  : 'bg-red-50 text-red-500 hover:bg-red-105 border-red-105'
              }`}
              title={soundEnabled ? 'Mute alert chime' : 'Unmute alert chime'}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              id="btn-activate-focus-vault"
              onClick={() => setIsDistractionFree(true)}
              className="flex items-center gap-1.5 bg-slate-900 text-white text-[11px] font-bold py-2 px-3 rounded-xl hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
              title="Activate full distraction-free screen focus"
            >
              <Maximize2 className="w-3 h-3 text-slate-200" />
              <span className="hidden sm:inline">Go Distraction-Free</span>
            </button>
          </div>
        </div>

        {/* Preset selections */}
        <div className="flex items-center gap-1.5 pt-4 overflow-x-auto whitespace-nowrap pb-1">
          {PRESETS.map((preset, idx) => (
            <button
              id={`select-preset-${idx}`}
              key={preset.name}
              onClick={() => selectPreset(idx)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer border ${
                activePresetIdx === idx && !customEnabled
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-105 border-slate-200/80'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Timer Display Block */}
      <div className="flex flex-col items-center justify-center my-auto py-4">
        {/* Progress gauge & Time digit pair */}
        <div className="relative w-60 h-60 flex items-center justify-center">
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-slate-100 fill-none"
              strokeWidth="5"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-indigo-650 fill-none"
              strokeWidth="6"
              strokeDasharray="276.4%"
              animate={{ strokeDashoffset: `${276.4 - (276.4 * progressPercentage) / 100}%` }}
              transition={{ ease: "linear" }}
            />
          </svg>

          <div className="text-center z-10">
            <span className="text-5xl font-extrabold tracking-tight font-sans block tabular-nums text-slate-900">
              {formatTime(secondsRemaining)}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 mt-1 block uppercase font-bold">
              {isActive ? 'SESSION RUNNING' : 'STANDING BY'}
            </span>
          </div>
        </div>
      </div>

      {/* Subject and customizable session parameters */}
      <div className="space-y-4">
        {/* Dynamic Focus Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider font-bold">FOCUSING SUBJECT</label>
            <select
              id="select-active-subjects"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50/55 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-sans focus:outline-none focus:border-indigo-500"
            >
              {PRESET_LAW_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider font-bold">OR ENTRY CUSTOM (MINS)</label>
            <form onSubmit={handleCustomSubmit} className="flex gap-1.5">
              <input
                id="input-timer-custom-minutes"
                type="number"
                min="1"
                max="480"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                placeholder="25"
                className="w-full text-center bg-slate-50/55 border border-slate-200 rounded-xl px-2 text-xs py-2 focus:outline-none focus:border-indigo-500"
              />
              <button
                id="btn-apply-timer-custom"
                type="submit"
                className="bg-slate-100 border border-slate-250 rounded-xl px-3 hover:bg-slate-200 text-xs text-slate-705 font-bold transition-colors cursor-pointer"
              >
                Apply
              </button>
            </form>
          </div>
        </div>

        {/* Operating Control cluster */}
        <div className="flex gap-3 justify-center items-center">
          <button
            id="btn-timer-reset"
            onClick={resetTimer}
            className="flex items-center justify-center w-11 h-11 bg-slate-50 border border-slate-205 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="btn-timer-play-pause"
            onClick={toggleTimer}
            className="flex items-center justify-center w-48 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-full shadow-md shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-300 transition-all text-center cursor-pointer"
          >
            {isActive ? (
              <span className="flex items-center justify-center gap-1.5">
                <Pause className="w-4 h-4 font-bold" /> Pause Focus Block
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Play className="w-4 h-4 font-bold" /> Begin Focus Block
              </span>
            )}
          </button>

          <button
            id="btn-timer-complete-premature"
            onClick={handleTimerComplete}
            disabled={secondsRemaining === activeDurationMax}
            className={`flex items-center justify-center w-11 h-11 border rounded-full transition-all cursor-pointer ${
              secondsRemaining === activeDurationMax 
                ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' 
                : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700'
            }`}
            title="Settle/Complete current elapsed session early"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

