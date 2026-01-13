import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// SUPABASE CLIENT CONFIGURATION
// ============================================
// Ganti dengan credentials dari Supabase Dashboard kamu

const supabaseUrl = 'https://hpcbhacobxpraiudavli.supabase.co';
const supabaseAnonKey = 'sb_publishable_sfUjiLnL7cJnOVChsyhLgg_K_3BR62U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_practice_time: number;
  total_sessions: number;
  overall_score: number;
  created_at: string;
  updated_at: string;
}

export interface TrainingSession {
  id: string;
  user_id: string;
  duration: number;
  overall_score: number;
  clarity_score: number;
  pace_score: number;
  confidence_score: number;
  words_per_minute: number | null;
  filler_word_count: number;
  session_type: 'free_practice' | 'teleprompter';
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: 'clarity' | 'pace' | 'confidence' | 'vocabulary';
  score: number;
  updated_at: string;
}

export interface DailyProgress {
  id: string;
  user_id: string;
  date: string;
  average_score: number;
  sessions_count: number;
  practice_time: number;
  created_at: string;
}
