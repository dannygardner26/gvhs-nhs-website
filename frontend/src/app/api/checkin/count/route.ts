import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/checkin/count - Get current count of checked-in users
export async function GET(_request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, returning mock count for demo')
      return NextResponse.json({ count: 3 })
    }

    const { count, error } = await supabase
      .from('active_checkins')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error getting checkin count:', error)
      return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: count || 0 })

  } catch (error) {
    console.error('Error in count API:', error)
    return NextResponse.json({ count: 0 })
  }
}