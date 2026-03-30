
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  onSubmit: (profile: UserProfile) => void;
}

const ProfileForm: React.FC<Props> = ({ onSubmit }) => {
  const commonGoals = [
    "Increase Strength & Power",
    "Build Muscle (Hypertrophy)",
    "Weight Loss & Fat Burning",
    "Improve Cardiovascular Stamina",
    "Flexibility & Mobility",
    "General Fitness & Toning",
    "Sport Specific (e.g. Football, MMA)",
    "Custom Goal"
  ];

  const commonTimelines = [
    "4 Weeks (Quick Blast)",
    "8 Weeks (Focused Growth)",
    "12 Weeks (Standard Transformation)",
    "6 Months (Lifestyle Change)",
    "1 Year (Total Overhaul)",
    "Custom Date Range"
  ];

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [specificDetails, setSpecificDetails] = useState('');
  const [timelineType, setTimelineType] = useState(commonTimelines[2]); // Default to 12 weeks
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const [formData, setFormData] = useState<UserProfile>({
    equipment: [],
    goals: '',
    schedule: '3 days a week',
    timeline: '',
    experienceLevel: 'beginner'
  });

  const commonEquipment = ['Dumbbells', 'Barbell', 'Kettlebells', 'Bench', 'Squat Rack', 'Pull-up Bar', 'Resistance Bands', 'Yoga Mat', 'None (Bodyweight Only)'];

  const toggleEquipment = (item: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(item) 
        ? prev.equipment.filter(e => e !== item) 
        : [...prev.equipment, item]
    }));
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goal)) {
        return prev.filter(g => g !== goal);
      }
      if (prev.length < 3) {
        return [...prev, goal];
      }
      return prev;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedGoals.length === 0 && !specificDetails.trim()) {
      return alert("Please select or specify at least one fitness goal!");
    }

    let finalTimeline = timelineType;
    if (timelineType === "Custom Date Range") {
      if (!customStartDate || !customEndDate) {
        return alert("Please select both start and end dates for your custom timeline.");
      }
      finalTimeline = `From ${customStartDate} to ${customEndDate}`;
    }

    const goalsList = [...selectedGoals];
    const finalGoalString = goalsList.join(", ") + (specificDetails ? ` (Notes: ${specificDetails})` : '');
    
    onSubmit({
      ...formData,
      goals: finalGoalString,
      timeline: finalTimeline
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-xl animate-in fade-in duration-700">
      {/* Equipment Selection */}
      <div className="space-y-4">
        <label className="block text-emerald-400 text-sm font-bold uppercase tracking-wider">What equipment do you have?</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {commonEquipment.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => toggleEquipment(item)}
              className={`p-3 text-xs rounded-lg border transition-all text-left ${
                formData.equipment.includes(item) 
                ? 'bg-emerald-600 border-emerald-400 text-white' 
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Goal Selection (Multiple Up to 3) */}
      <div className="space-y-4 border-t border-slate-700/50 pt-6">
        <div className="flex justify-between items-end">
          <label className="block text-emerald-400 text-sm font-bold uppercase tracking-wider">Select Your Fitness Goals (Up to 3)</label>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedGoals.length === 3 ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'}`}>
            {selectedGoals.length}/3 SELECTED
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {commonGoals.map(goal => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={`p-3 text-xs rounded-lg border transition-all text-left ${
                selectedGoals.includes(goal) 
                ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-500/20' 
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500 disabled:opacity-30'
              }`}
              disabled={!selectedGoals.includes(goal) && selectedGoals.length >= 3}
            >
              <div className="flex items-center justify-between">
                <span>{goal}</span>
                {selectedGoals.includes(goal) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        <textarea
          value={specificDetails}
          onChange={e => setSpecificDetails(e.target.value)}
          placeholder="Add specific requirements or any other custom goals (optional)..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none min-h-[100px] transition-all"
        />
      </div>

      {/* Schedule and Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-700/50 pt-6">
        <div className="space-y-2">
          <label className="block text-emerald-400 text-sm font-bold uppercase tracking-wider">Workout Frequency</label>
          <div className="relative">
            <select 
              value={formData.schedule}
              onChange={e => setFormData({ ...formData, schedule: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              <option>2 days a week</option>
              <option>3 days a week</option>
              <option>4 days a week</option>
              <option>5 days a week</option>
              <option>6 days a week</option>
              <option>Every day</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-emerald-400 text-sm font-bold uppercase tracking-wider">Experience Level</label>
          <div className="relative">
            <select 
              value={formData.experienceLevel}
              onChange={e => setFormData({ ...formData, experienceLevel: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Target Timeline */}
      <div className="space-y-4 border-t border-slate-700/50 pt-6">
        <label className="block text-emerald-400 text-sm font-bold uppercase tracking-wider">Target Timeline</label>
        
        <div className="space-y-3">
          <div className="relative">
            <select 
              value={timelineType}
              onChange={e => setTimelineType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              {commonTimelines.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {timelineType === "Custom Date Range" && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top duration-300">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Start Date</label>
                <input 
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">End Date</label>
                <input 
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bebas text-2xl tracking-widest py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-1 active:scale-95"
      >
        Generate My Plan
      </button>
    </form>
  );
};

export default ProfileForm;
