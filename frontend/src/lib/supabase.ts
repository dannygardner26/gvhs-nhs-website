import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for our database tables
export interface User {
  id: string
  user_id: string
  first_name: string
  last_name: string
  username: string
  created_at: string
  updated_at: string
}

export interface SessionHistory {
  id: string
  user_id: string
  username: string
  checked_in_at: string
  checked_out_at: string | null
  duration_ms: number | null
  forced_by_admin: boolean
  created_at: string
}

export interface ActiveCheckin {
  user_id: string
  username: string
  checked_in_at: string
  created_at: string
}

export interface UserStats {
  user_id: string
  username: string
  first_name: string
  last_name: string
  total_sessions: number
  total_duration_ms: number
  total_hours: number
  currently_checked_in_at: string | null
  is_currently_checked_in: boolean
}