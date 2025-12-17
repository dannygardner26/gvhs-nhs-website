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

    // Use select and count the rows (more reliable than count query)
    const { data, error } = await supabase
      .from('active_checkins')
      .select('user_id')

    if (error) {
      console.error('Error getting checkin count:', error)
      return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: data?.length || 0 })

  } catch (error) {
    console.error('Error in count API:', error)
    return NextResponse.json({ count: 0 })
  }
}