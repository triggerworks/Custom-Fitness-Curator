
export interface UserProfile {
  equipment: string[];
  goals: string;
  schedule: string;
  timeline: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  instructions: string;
  targetMuscle: string;
}

export interface WorkoutDay {
  dayName: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  title: string;
  overview: string;
  days: WorkoutDay[];
  dietaryAdvice: string;
}

export interface SavedPlan {
  id: string;
  date: string;
  plan: WorkoutPlan;
  profile: UserProfile;
}

export interface ProgressLog {
  id: string;
  date: string;
  workoutTitle: string;
  completionRate: number; // 0 to 100
  notes: string;
  mood: string;
}
