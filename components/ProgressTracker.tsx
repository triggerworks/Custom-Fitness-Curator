
import React, { useState } from 'react';
import { ProgressLog, WorkoutPlan } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Props {
  logs: ProgressLog[];
  onAddLog: (log: ProgressLog) => void;
  currentPlan: WorkoutPlan;
}

const ProgressTracker: React.FC<Props> = ({ logs, onAddLog, currentPlan }) => {
  const [showForm, setShowForm] = useState(false);
  const [newLog, setNewLog] = useState<Partial<ProgressLog>>({
    workoutTitle: currentPlan.days[0]?.dayName || '',
    completionRate: 100,
    mood: 'Energized',
    notes: ''
  });

  const chartData = [...logs].reverse().map(l => ({
    date: new Date(l.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: l.completionRate
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog({
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      workoutTitle: newLog.workoutTitle || 'Unknown Workout',
      completionRate: newLog.completionRate || 0,
      notes: newLog.notes || '',
      mood: newLog.mood || 'Neutral'
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-bebas text-emerald-500">Progress Dashboard</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-500 text-slate-900 font-bebas px-6 py-2 rounded-lg text-xl hover:bg-emerald-400 transition-colors"
        >
          {showForm ? 'Cancel' : 'Log Workout'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Which Workout?</label>
              <select 
                value={newLog.workoutTitle}
                onChange={e => setNewLog({...newLog, workoutTitle: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 outline-none"
              >
                {currentPlan.days.map(d => <option key={d.dayName}>{d.dayName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Completion %</label>
              <input 
                type="number"
                min="0"
                max="100"
                value={newLog.completionRate}
                onChange={e => setNewLog({...newLog, completionRate: Number(e.target.value)})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase text-slate-500 font-bold mb-1">How did it feel?</label>
            <input 
              type="text"
              placeholder="Energized, tired, strong..."
              value={newLog.mood}
              onChange={e => setNewLog({...newLog, mood: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Notes</label>
            <textarea 
              value={newLog.notes}
              onChange={e => setNewLog({...newLog, notes: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 outline-none h-20"
            />
          </div>
          <button type="submit" className="w-full bg-emerald-600 py-3 rounded-lg font-bold">Save Log</button>
        </form>
      )}

      {logs.length > 1 && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 h-[350px]">
          <h3 className="text-xl font-bebas text-slate-400 mb-6 uppercase">Completion Consistency</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bebas text-slate-400 uppercase">Workout History</h3>
        {logs.length === 0 ? (
          <div className="bg-slate-900 p-12 rounded-2xl border border-slate-800 text-center text-slate-500 italic">
            No logs yet. Complete your first session to see history!
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h4 className="font-bold text-slate-100">{log.workoutTitle}</h4>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded uppercase font-bold">{log.mood}</span>
                </div>
                <p className="text-xs text-slate-500">{new Date(log.date).toLocaleDateString()} • {log.notes || 'No notes added'}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bebas text-emerald-400">{log.completionRate}%</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Completion</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
