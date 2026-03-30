
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';

interface Props {
  goal: string;
}

const MotivationalHub: React.FC<Props> = ({ goal }) => {
  const [quote, setQuote] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      setLoading(true);
      const q = await geminiService.getMotivation(goal);
      setQuote(q);
      setLoading(false);
    };
    fetchQuote();
  }, [goal]);

  return (
    <div className="space-y-8 animate-in zoom-in duration-500">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-1 rounded-3xl shadow-2xl">
        <div className="bg-slate-950 p-10 rounded-[calc(1.5rem-1px)] relative overflow-hidden">
          {/* Decorative Background Icon */}
          <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
            <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2 4.86 3.43 6.29 2 8.43 3.43 9.86 2 11.29 3.43 12.71 7 9.14l8.57 8.57-3.57 3.57L13.43 22l1.43-1.43 1.43 1.43 2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L20.57 14.86z"/>
            </svg>
          </div>

          <div className="relative z-10 text-center space-y-6">
            <span className="text-emerald-500 text-sm font-bold uppercase tracking-[0.3em]">The AI Coach Says</span>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-slate-800 rounded w-3/4 mx-auto"></div>
                <div className="h-8 bg-slate-800 rounded w-1/2 mx-auto"></div>
              </div>
            ) : (
              <h2 className="text-3xl md:text-5xl font-bebas text-slate-100 leading-tight italic">
                "{quote}"
              </h2>
            )}
            <div className="pt-8">
              <button 
                onClick={() => {
                   setLoading(true);
                   geminiService.getMotivation(goal).then(q => {
                     setQuote(q);
                     setLoading(false);
                   });
                }}
                className="text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 mx-auto transition-colors"
              >
                <span>New Spark</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MotivCard 
          title="Daily Habit" 
          desc="Drink 3L of water today to keep your muscles hydrated and performance peak." 
          icon="💧" 
        />
        <MotivCard 
          title="Rest & Recovery" 
          desc="Prioritize 8 hours of sleep. Growth happens while you sleep, not while you train." 
          icon="🌙" 
        />
        <MotivCard 
          title="Mindset" 
          desc="Focus on the feeling of being finished, not the pain of the process." 
          icon="🧠" 
        />
      </div>
    </div>
  );
};

const MotivCard: React.FC<{ title: string; desc: string; icon: string }> = ({ title, desc, icon }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/30 transition-all">
    <div className="text-3xl mb-4">{icon}</div>
    <h4 className="text-xl font-bebas text-emerald-500 mb-2 uppercase">{title}</h4>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default MotivationalHub;
