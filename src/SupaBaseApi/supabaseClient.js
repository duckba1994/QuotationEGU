import { createClient } from '@supabase/supabase-js'

// Use the provided Supabase Project URL and Anon Key
const supabaseUrl = 'https://lcwwaazqmrdvpfjkruax.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjd3dhYXpxbXJkdnBmamtydWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzU3MjUsImV4cCI6MjA3NjYxMTcyNX0.OxKxKU_n4js7roX9Nar9BJ9QvsuG2-OsquYilOZ_J-E'

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Optional: Add Authentication functions if needed ---
// Example: Get current user function
export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  return session?.user ?? null; // Return user object or null
}

// Example: Get user ID function
export const getCurrentUserId = async () => {
    const user = await getCurrentUser();
    return user?.id; // Returns user ID or undefined
}

