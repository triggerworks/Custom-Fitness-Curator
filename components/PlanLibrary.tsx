
import React from 'react';
import { SavedPlan } from '../types';

interface Props {
  plans: SavedPlan[];
  onLoad: (plan: SavedPlan) => void;
  onDelete: (id: string) => void;
}

const PlanLibrary: React.FC<Props> = ({ plans, onLoad, onDelete }) => {
  if (plans.length === 0) {
    return (
      <div className="bg-slate-900/50 p-12 rounded-3xl border border-slate-800 text-center animate-in fade-in duration-500">
        <div className="text-5xl mb-4">📚</div>
        <h3 className="text-2xl font-bebas text-emerald-500 mb-2 uppercase">Library Empty</h3>
        <p className="text-slate-500 text-sm">You haven't saved any plans yet. Generate a plan and click "Save Plan" to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-left duration-500">
      <h2 className="text-4xl font-bebas text-emerald-500 mb-6">Your Plan Library</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/40 transition-all group flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bebas text-slate-100 group-hover:text-emerald-400 transition-colors">{p.plan.title}</h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-800 px-2 py-1 rounded">
                  {new Date(p.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4 italic">{p.plan.overview}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                  {p.profile.experienceLevel}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded">
                  {p.profile.schedule}
                </span>
              </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t border-slate-800">
              <button 
                onClick={() => onLoad(p)}
                className="flex-1 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
              >
                Load Plan
              </button>
              <button 
                onClick={() => {
                  if(confirm('Delete this plan from your library?')) onDelete(p.id);
                }}
                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Delete Plan"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanLibrary;
