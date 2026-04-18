import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables.');
}

export type ArtistProject = {
  id: string;
  title: string;
  format: string;
  phase: string;
  logline: string | null;
  cover_asset_path: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ArtistTrack = {
  id: string;
  project_id: string;
  title: string;
  kind: string;
  version_label: string | null;
  bpm: string | null;
  musical_key: string | null;
  notes: string | null;
  audio_asset_path: string | null;
  duration_seconds: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
