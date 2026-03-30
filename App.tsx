
import React, { useState, useEffect } from 'react';
import { UserProfile, WorkoutPlan, ProgressLog, SavedPlan } from './types';
import { geminiService } from './services/geminiService';
import ProfileForm from './components/ProfileForm';
import WorkoutDisplay from './components/WorkoutDisplay';
import ProgressTracker from './components/ProgressTracker';
import MotivationalHub from './components/MotivationalHub';
import PlanLibrary from './components/PlanLibrary';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'progress' | 'motivation' | 'library'>('plan');

  // Persistence
  useEffect(() => {
    const savedProfile = localStorage.getItem('forge_profile');
    const savedPlan = localStorage.getItem('forge_plan');
    const savedLogs = localStorage.getItem('forge_logs');
    const savedLibrary = localStorage.getItem('forge_library');
    
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedPlan) setPlan(JSON.parse(savedPlan));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedLibrary) setSavedPlans(JSON.parse(savedLibrary));
  }, []);

  useEffect(() => {
    if (profile) localStorage.setItem('forge_profile', JSON.stringify(profile));
    if (plan) localStorage.setItem('forge_plan', JSON.stringify(plan));
    if (logs.length) localStorage.setItem('forge_logs', JSON.stringify(logs));
    if (savedPlans.length) localStorage.setItem('forge_library', JSON.stringify(savedPlans));
    else localStorage.removeItem('forge_library');
  }, [profile, plan, logs, savedPlans]);

  const handleProfileSubmit = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    setIsLoading(true);
    try {
      const generatedPlan = await geminiService.generateWorkoutPlan(newProfile);
      setPlan(generatedPlan);
      setActiveTab('plan');
    } catch (error) {
      console.error("Failed to generate plan", error);
      alert("Something went wrong generating your plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = () => {
    if (!plan || !profile) return;
    
    const isDuplicate = savedPlans.some(p => p.plan.title === plan.title && p.date.split('T')[0] === new Date().toISOString().split('T')[0]);
    if (isDuplicate) {
      alert("This plan is already in your library.");
      return;
    }

    const newSavedPlan: SavedPlan = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      plan: plan,
      profile: profile
    };
    setSavedPlans(prev => [newSavedPlan, ...prev]);
    alert("Plan saved to library!");
  };

  const handleLoadPlan = (saved: SavedPlan) => {
    setPlan(saved.plan);
    setProfile(saved.profile);
    setActiveTab('plan');
  };

  const handleDeleteSavedPlan = (id: string) => {
    setSavedPlans(prev => prev.filter(p => p.id !== id));
  };

  const addLog = (log: ProgressLog) => {
    setLogs(prev => [log, ...prev]);
  };

  const clearSession = () => {
    if (confirm("Reset current session? This will return you to the profile setup. Your library of saved plans will remain.")) {
      localStorage.removeItem('forge_profile');
      localStorage.removeItem('forge_plan');
      setProfile(null);
      setPlan(null);
      setActiveTab('plan');
    }
  };

  if (!profile || !plan) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        {isLoading ? (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bebas tracking-wider text-emerald-400">Forging Your Personal Plan...</h2>
            <p className="text-slate-400 mt-2">Our AI is analyzing your equipment and goals.</p>
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            <header className="text-center mb-10">
              <h1 className="text-6xl font-bebas text-emerald-500 tracking-tighter">ForgeAI</h1>
              <p className="text-slate-400 uppercase tracking-widest text-sm">Personalized Fitness Curator</p>
              {savedPlans.length > 0 && (
                <button 
                  onClick={() => setActiveTab('library')}
                  className="mt-4 text-emerald-500/70 hover:text-emerald-400 text-xs font-bold uppercase tracking-widest transition-colors flex items-center space-x-2 mx-auto"
                >
                  <span>Or Access Your Library ({savedPlans.length})</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </button>
              )}
            </header>
            {activeTab === 'library' && savedPlans.length > 0 ? (
              <div className="space-y-6">
                <button onClick={() => setActiveTab('plan')} className="text-slate-500 hover:text-white text-xs font-bold uppercase mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Back to New Plan
                </button>
                <PlanLibrary plans={savedPlans} onLoad={handleLoadPlan} onDelete={handleDeleteSavedPlan} />
              </div>
            ) : (
              <ProfileForm onSubmit={handleProfileSubmit} />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bebas text-emerald-500">ForgeAI</span>
        </div>
        <div className="flex space-x-2 md:space-x-4">
          <NavBtn active={activeTab === 'plan'} onClick={() => setActiveTab('plan')}>Plan</NavBtn>
          <NavBtn active={activeTab === 'progress'} onClick={() => setActiveTab('progress')}>Progress</NavBtn>
          <NavBtn active={activeTab === 'motivation'} onClick={() => setActiveTab('motivation')}>Coach</NavBtn>
          <NavBtn active={activeTab === 'library'} onClick={() => setActiveTab('library')}>Library</NavBtn>
          <button 
            onClick={clearSession} 
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 border border-slate-700 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            Reset
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        {activeTab === 'plan' && <WorkoutDisplay plan={plan} profile={profile} onSave={handleSavePlan} />}
        {activeTab === 'progress' && <ProgressTracker logs={logs} onAddLog={addLog} currentPlan={plan} />}
        {activeTab === 'motivation' && <MotivationalHub goal={profile.goals} />}
        {activeTab === 'library' && <PlanLibrary plans={savedPlans} onLoad={handleLoadPlan} onDelete={handleDeleteSavedPlan} />}
      </main>
      
      <footer className="py-6 text-center text-slate-600 text-xs uppercase tracking-widest">
        Powered by Gemini AI • Build Your Best Self
      </footer>
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 border border-transparent hover:bg-slate-800'
    }`}
  >
    {children}
  </button>
);

export default App;
