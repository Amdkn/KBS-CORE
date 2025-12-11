import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Antigravity Alert: Supabase keys are missing from environment variables. ' +
    'The app will run in "Demo Mode" with limited functionality. ' +
    'Please check your .env.local file or Vercel settings.'
  );
}

// Create a single supabase client for interacting with your database
// Using a fallback URL to prevent crash during build time if envs are missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
);