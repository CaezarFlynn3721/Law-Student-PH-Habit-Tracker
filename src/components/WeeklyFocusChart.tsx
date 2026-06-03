import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TimerSession } from '../types';
import { BarChart2, TrendingUp, Zap, Clock, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface WeeklyFocusChartProps {
  timerSessions: TimerSession[];
}

export function WeeklyFocusChart({ timerSessions }: WeeklyFocusChartProps) {
  // Generate list of the past 7 days: [6 days ago, ..., today]
  const dateNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    
    // Format YYYY-MM-DD
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const isTodayStr = dateStr === today.toISOString().split('T')[0] || 
                       d.getDate() === today.getDate() && d.getMonth() === today.getMonth();

    return {
      dateStr,
      dayLabel: isTodayStr ? 'Today' : dateNames[d.getDay()],
      dayNum: d.getDate(),
      minutes: 0,
    };
  });

  // Aggregate minutes by matching date strings
  timerSessions.forEach(session => {
    if (!session.completedAt) return;
    
    const compDate = new Date(session.completedAt);
    const year = compDate.getFullYear();
    const month = String(compDate.getMonth() + 1).padStart(2, '0');
    const day = String(compDate.getDate()).padStart(2, '0');
    const sessionDateStr = `${year}-${month}-${day}`;

    const matchedDay = days.find(d => d.dateStr === sessionDateStr);
    if (matchedDay) {
      matchedDay.minutes += Math.round(session.duration / 60);
    }
  });

  // Calculate high-level insights for the past 7 days
  const totalMinutes7Days = days.reduce((acc, d) => acc + d.minutes, 0);
  const averageMinutes = Math.round(totalMinutes7Days / 7);
  
  const peakDayObj = [...days].sort((a, b) => b.minutes - a.minutes)[0];
  const peakMinutes = peakDayObj ? peakDayObj.minutes : 0;
  const peakDayName = peakDayObj ? `${peakDayObj.dayLabel} (${peakDayObj.dayNum})` : 'N/A';
  
  const activeDaysCount = days.filter(d => d.minutes > 0).length;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-lg text-xs leading-none">
          <p className="font-bold text-slate-300 font-sans mb-1.5">{payload[0].payload.dayLabel} ({payload[0].payload.dateStr})</p>
          <p className="text-indigo-400 font-extrabold font-mono text-[13px]">{payload[0].value} Mins Engaged</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-slate-205 rounded-2xl p-5 md:p-6 shadow-sm w-full flex flex-col gap-6"
    >
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            Weekly Focus Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Visualize study minutes completed over the last 7 days</p>
        </div>

        {/* Dynamic focus performance pill */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-indigo-50/50 border border-indigo-100/50 rounded-xl px-3.5 py-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-800">
            {totalMinutes7Days} Focus Minutes Logged This Week
          </span>
        </div>
      </div>

      {/* Grid containing Insights and the actual Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Insights Column */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 lg:flex lg:flex-col lg:grid-cols-none gap-4">
          
          {/* Card 1: Daily Average */}
          <div className="bg-slate-50 border border-slate-150/60 rounded-xl p-4 flex items-center gap-3.5 flex-1">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shrink-0">
              <Clock className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <div>
              <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">DAILY AVERAGE</span>
              <span className="text-lg font-extrabold text-slate-800 leading-none">
                {averageMinutes} Mins
              </span>
            </div>
          </div>

          {/* Card 2: Peak Study Day */}
          <div className="bg-slate-50 border border-slate-150/60 rounded-xl p-4 flex items-center gap-3.5 flex-1">
            <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl text-amber-600 shrink-0">
              <Zap className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <div>
              <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">PEAK LOAD DAY</span>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-extrabold text-slate-800 block">
                  {peakMinutes > 0 ? `${peakMinutes} Mins` : 'No logs yet'}
                </span>
                {peakMinutes > 0 && (
                  <span className="text-[10px] text-slate-500 font-sans mt-0.5 font-medium">{peakDayName}</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Consistency Day Score */}
          <div className="bg-slate-50 border border-slate-150/60 rounded-xl p-4 flex items-center gap-3.5 flex-1">
            <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 shrink-0">
              <Calendar className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <div>
              <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">CONSISTENCY</span>
              <span className="text-lg font-extrabold text-slate-800 leading-none block">
                {activeDaysCount} of 7 Days
              </span>
              <span className="text-[10px] text-slate-500 font-sans font-medium mt-0.5 block">
                {activeDaysCount >= 5 ? 'Masterful pacing!' : activeDaysCount >= 3 ? 'Steady output' : 'Get into focus!'}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Recharts Bar Plot Column */}
        <div className="lg:col-span-3 h-64 md:h-72 border border-slate-150/50 rounded-xl p-4 md:p-5 bg-slate-50/20 relative">
          
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={days}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#e2e8f0" 
              />
              
              <XAxis 
                dataKey="dayLabel" 
                stroke="#94a3b8" 
                fontSize={11}
                fontWeight={650}
                tickLine={false} 
                axisLine={false}
                dy={6}
              />
              
              <YAxis 
                stroke="#94a3b8" 
                fontSize={11}
                fontWeight={600}
                tickLine={false} 
                axisLine={false}
                allowDecimals={false}
                dx={-6}
              />
              
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'rgba(148, 163, 184, 0.06)', radius: 12 }}
              />
              
              <Bar 
                dataKey="minutes" 
                fill="url(#focusGradient)" 
                radius={[8, 8, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
