import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Habit, HabitCategory } from '../types';
import { Check, Flame, Trash2, Plus, Calendar, Dumbbell, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';

interface HabitListProps {
  habits: Habit[];
  addHabit: (name: string, category: HabitCategory, frequency: 'daily' | 'weekly') => Promise<void>;
  toggleHabitCompletion: (habitId: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
}

export function HabitList({ habits, addHabit, toggleHabitCompletion, deleteHabit }: HabitListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>('study');
  const [newHabitFrequency, setNewHabitFrequency] = useState<'daily' | 'weekly'>('daily');

  // Days of the week for visualization (today & past 4 days)
  const getPastDays = () => {
    const days = [];
    const dateNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isToday = i === 0;
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: isToday ? 'Today' : dateNames[d.getDay()],
        dayNum: d.getDate()
      });
    }
    return days;
  };

  const recentDays = getPastDays();
  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreateHabit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    await addHabit(newHabitName.trim(), newHabitCategory, newHabitFrequency);
    setNewHabitName('');
    setShowAddForm(false);
  };

  const studyHabits = habits.filter(h => h.category === 'study');
  const workoutHabits = habits.filter(h => h.category === 'workout');

  const renderHabitCard = (habit: Habit) => {
    const isCompletedToday = habit.completedDates.includes(todayStr);

    return (
      <motion.div
        key={habit.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`p-4 bg-slate-50/30 border rounded-2xl hover:border-slate-300 transition-all ${
          isCompletedToday ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-100/80'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Elegant Circle Checkbox with Sleek Interface Emerald styling */}
            <button
               id={`toggle-habit-${habit.id}`}
               onClick={() => toggleHabitCompletion(habit.id)}
               className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                 isCompletedToday 
                   ? 'bg-emerald-100 border-emerald-300 text-emerald-600 shadow-sm' 
                   : 'bg-white border-slate-300 hover:border-slate-400'
               }`}
            >
              {isCompletedToday && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
            </button>

            <div>
              <h3 className={`text-sm font-semibold tracking-tight leading-tight ${
                isCompletedToday ? 'text-slate-400 line-through' : 'text-slate-900'
              }`}>
                {habit.name}
              </h3>

              {/* Status Row */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  habit.category === 'study' 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/60' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100/60'
                }`}>
                  {habit.category === 'study' ? '🎓 Study' : '💪 Sweat'}
                </span>

                <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase font-mono">
                  {habit.frequency}
                </span>

                {habit.streak > 0 && (
                  <span className="flex items-center gap-0.5 text-[11px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.2 rounded font-semibold">
                    <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{habit.streak}d streak</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            id={`delete-habit-${habit.id}`}
            onClick={() => deleteHabit(habit.id)}
            className="p-1 px-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent"
            title="Delete Habit"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Calendar visual checklist with Sleek theme */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-1.5 overflow-x-auto">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">Lately:</span>
          <div className="flex items-center gap-1.5">
            {recentDays.map((day) => {
              const isDone = habit.completedDates.includes(day.dateStr);
              return (
                <button
                  id={`calc-habit-${habit.id}-${day.dateStr}`}
                  key={day.dateStr}
                  onClick={() => toggleHabitCompletion(habit.id)}
                  title={`${isDone ? 'Registered complete' : 'Register incomplete'} on ${day.dayName} (${day.dateStr})`}
                  className={`flex flex-col items-center justify-between w-9 py-1 rounded-lg border text-center transition-all ${
                    isDone 
                      ? 'bg-indigo-600 border-indigo-600 text-white font-semibold' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350'
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-wider font-bold leading-none block opacity-85">
                    {day.dayName.slice(0, 3)}
                  </span>
                  <span className="text-xs font-bold mt-0.5 leading-none font-mono">
                    {day.dayNum}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 flex flex-col h-full shadow-sm">
      {/* List Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Core Habits
          </h2>
          <p className="text-xs text-slate-500">Track daily systems and consistencies</p>
        </div>

        <button
          id="btn-toggle-add-habit"
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-xl border cursor-pointer transition-all ${
            showAddForm 
              ? 'bg-slate-100 text-slate-800 border-slate-200' 
              : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-sm'
          }`}
        >
          {showAddForm ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add Habit</span>
            </>
          )}
        </button>
      </div>

      {/* Add Custom Habit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleCreateHabit}
            className="overflow-hidden border border-slate-200 bg-slate-50/50 p-3.5 rounded-xl mb-4 flex flex-col gap-3"
          >
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider font-bold">HABIT NAME</label>
              <input
                id="input-new-habit-name"
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="e.g. Constitutional Law Reading..."
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider font-bold">TRACK TYPE</label>
                <select
                  id="select-new-habit-category"
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value as HabitCategory)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="study">📚 Legal Studies</option>
                  <option value="workout">💪 Workout & Heat</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider font-bold">FREQUENCY</label>
                <select
                  id="select-new-habit-frequency"
                  value={newHabitFrequency}
                  onChange={(e) => setNewHabitFrequency(e.target.value as 'daily' | 'weekly')}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <button
              id="btn-submit-new-habit"
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-2 px-3 rounded-xl text-xs hover:bg-indigo-700 cursor-pointer transition-colors mt-1"
            >
              Verify & Add Habit
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Habits List Container */}
      <div className="flex-1 overflow-y-auto space-y-4 max-h-[500px] pr-1">
        {/* Study Category */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-3 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            🎓 Studies & Law Review ({studyHabits.length})
          </h3>

          {studyHabits.length === 0 ? (
            <div className="text-center py-4 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 bg-slate-50/20">
              No study habits registered.
            </div>
          ) : (
            <div className="space-y-2.5">
              {studyHabits.map((habit) => renderHabitCard(habit))}
            </div>
          )}
        </div>

        {/* Workout Category */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-3 flex items-center gap-1">
            <Dumbbell className="w-3.5 h-3.5 text-slate-400" />
            💪 Sweat & Workout Systems ({workoutHabits.length})
          </h3>

          {workoutHabits.length === 0 ? (
            <div className="text-center py-4 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 bg-slate-50/20">
              No workout habits registered.
            </div>
          ) : (
            <div className="space-y-2.5">
              {workoutHabits.map((habit) => renderHabitCard(habit))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
