import { supabase, TrainingSession, UserSkill, DailyProgress } from './supabase';

// ============================================
// USER SKILLS
// ============================================

export async function getSkills(): Promise<UserSkill[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_skills')
    .select('*')
    .eq('user_id', user.id);

  if (error) throw error;
  return data as UserSkill[];
}

// ============================================
// DAILY PROGRESS
// ============================================

export async function getWeeklyProgress(): Promise<DailyProgress[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', sevenDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw error;
  return data as DailyProgress[];
}

// ============================================
// TRAINING SESSIONS
// ============================================

export async function createSession(sessionData: {
  duration: number;
  overall_score: number;
  clarity_score: number;
  pace_score: number;
  confidence_score: number;
  words_per_minute?: number;
  filler_word_count?: number;
  session_type?: 'free_practice' | 'teleprompter';
}): Promise<TrainingSession> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('training_sessions')
    .insert({
      user_id: user.id,
      ...sessionData,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TrainingSession;
}

export async function updateDailyProgress(sessionScore: number, sessionDuration: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  if (existing) {
    const newSessionsCount = existing.sessions_count + 1;
    const newAverageScore = Math.round(
      (existing.average_score * existing.sessions_count + sessionScore) / newSessionsCount
    );

    const { error } = await supabase
      .from('daily_progress')
      .update({
        average_score: newAverageScore,
        sessions_count: newSessionsCount,
        practice_time: existing.practice_time + sessionDuration,
      })
      .eq('id', existing.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('daily_progress')
      .insert({
        user_id: user.id,
        date: today,
        average_score: sessionScore,
        sessions_count: 1,
        practice_time: sessionDuration,
      });

    if (error) throw error;
  }
}

export async function saveCompleteSession(data: {
  duration: number;
  overall_score: number;
  clarity_score: number;
  pace_score: number;
  confidence_score: number;
  words_per_minute?: number;
  session_type?: 'free_practice' | 'teleprompter';
  filler_word_count?: number;
}) {
  const session = await createSession(data);
  await updateDailyProgress(data.overall_score, data.duration);
  return session;
}
