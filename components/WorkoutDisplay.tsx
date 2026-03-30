
import React, { useState, useEffect } from 'react';
import { WorkoutPlan, UserProfile } from '../types';
import { geminiService, ExerciseMotion } from '../services/geminiService';

interface Props {
  plan: WorkoutPlan;
  profile: UserProfile;
  onSave?: () => void;
}

const WorkoutDisplay: React.FC<Props> = ({ plan, profile, onSave }) => {
  const [visuals, setVisuals] = useState<{ [key: string]: ExerciseMotion }>({});
  const [loadingVisuals, setLoadingVisuals] = useState<{ [key: string]: boolean }>({});
  const [motionFrame, setMotionFrame] = useState(0); // 0 = start, 1 = end

  // Animation loop for motion visuals
  useEffect(() => {
    const timer = setInterval(() => {
      setMotionFrame(prev => (prev === 0 ? 1 : 0));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const loadVisual = async (exerciseName: string) => {
    if (visuals[exerciseName] || loadingVisuals[exerciseName]) return;

    setLoadingVisuals(prev => ({ ...prev, [exerciseName]: true }));
    const motion = await geminiService.generateExerciseMotion(exerciseName);
    if (motion) {
      setVisuals(prev => ({ ...prev, [exerciseName]: motion }));
    }
    setLoadingVisuals(prev => ({ ...prev, [exerciseName]: false }));
  };

  const exportToCSV = () => {
    const headers = ["Day", "Focus", "Exercise", "Target Muscle", "Sets", "Reps", "Instructions"];
    const rows = plan.days.flatMap(day => 
      day.exercises.map(ex => [
        day.dayName,
        day.focus,
        ex.name,
        ex.targetMuscle,
        ex.sets,
        ex.reps,
        ex.instructions.replace(/,/g, ';').replace(/\n/g, ' ')
      ])
    );

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileName = `${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_forge_plan.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-5xl font-bebas text-emerald-500">{plan.title}</h1>
          <div className="flex flex-wrap gap-2">
            {onSave && (
              <button 
                onClick={onSave}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save Plan</span>
              </button>
            )}
            <button 
              onClick={exportToCSV}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 text-emerald-400 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all group shadow-lg"
            >
              <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export to Excel</span>
            </button>
          </div>
        </div>
        
        <p className="text-slate-300 text-lg leading-relaxed mb-6">{plan.overview}</p>
        
        <div className="flex flex-wrap gap-3">
          <Badge label="Equipment" value={`${profile.equipment.length} items`} />
          <Badge label="Level" value={profile.experienceLevel} />
          <Badge label="Goal" value={profile.goals} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plan.days.map((day, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-emerald-500/50 transition-colors">
            <div className="bg-emerald-600/10 p-4 border-b border-slate-800">
              <h3 className="text-2xl font-bebas text-emerald-400">{day.dayName}</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest">{day.focus}</p>
            </div>
            <div className="p-4 space-y-6">
              {day.exercises.map((ex, eIdx) => (
                <div key={eIdx} className="border-l-2 border-emerald-500/30 pl-4 py-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-100 text-lg">{ex.name}</h4>
                      <p className="text-xs text-slate-400">Target: {ex.targetMuscle}</p>
                    </div>
                    <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
                      {ex.sets} × {ex.reps}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 leading-tight italic">{ex.instructions}</p>
                  </div>

                  {/* Enhanced Motion Visual Section */}
                  <div className="mt-3">
                    {visuals[ex.name] ? (
                      <div className="relative group overflow-hidden rounded-xl border border-emerald-500/20 bg-slate-950 aspect-square w-full sm:w-56 mx-auto sm:mx-0 shadow-inner">
                        <img 
                          src={visuals[ex.name].start} 
                          alt={`${ex.name} Start`} 
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${motionFrame === 0 ? 'opacity-100' : 'opacity-0'}`}
                        />
                        <img 
                          src={visuals[ex.name].end} 
                          alt={`${ex.name} Peak`} 
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${motionFrame === 1 ? 'opacity-100' : 'opacity-0'}`}
                        />
                        
                        {/* Overlay Labels */}
                        <div className="absolute top-2 left-2 pointer-events-none">
                          <span className={`text-[9px] font-bold uppercase tracking-widest bg-emerald-500/80 text-white px-1.5 py-0.5 rounded shadow transition-opacity duration-300 ${motionFrame === 0 ? 'opacity-100' : 'opacity-20'}`}>
                            Start
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 pointer-events-none">
                          <span className={`text-[9px] font-bold uppercase tracking-widest bg-teal-500/80 text-white px-1.5 py-0.5 rounded shadow transition-opacity duration-300 ${motionFrame === 1 ? 'opacity-100' : 'opacity-20'}`}>
                            Peak
                          </span>
                        </div>
                        
                        {/* Motion indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                          <div className={`w-1 h-1 rounded-full transition-all duration-300 ${motionFrame === 0 ? 'bg-emerald-400 scale-125' : 'bg-slate-700'}`}></div>
                          <div className={`w-1 h-1 rounded-full transition-all duration-300 ${motionFrame === 1 ? 'bg-emerald-400 scale-125' : 'bg-slate-700'}`}></div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => loadVisual(ex.name)}
                        disabled={loadingVisuals[ex.name]}
                        className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500/70 hover:text-emerald-400 transition-colors group"
                      >
                        {loadingVisuals[ex.name] ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Generating Motion Demo...</span>
                          </div>
                        ) : (
                          <>
                            <svg className="w-4 h-4 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Show Motion Demo</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-900/20 p-8 rounded-3xl border border-emerald-500/20">
        <h3 className="text-2xl font-bebas text-emerald-400 mb-4">Nutritional Strategy</h3>
        <p className="text-slate-300 leading-relaxed italic">{plan.dietaryAdvice}</p>
      </div>
    </div>
  );
};

const Badge: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-full px-4 py-1 flex items-center space-x-2">
    <span className="text-[10px] text-slate-500 uppercase font-bold">{label}:</span>
    <span className="text-xs text-slate-200 truncate max-w-[150px]">{value}</span>
  </div>
);

export default WorkoutDisplay;
