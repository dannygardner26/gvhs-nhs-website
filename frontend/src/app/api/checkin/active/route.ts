import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/checkin/active - Get all checked-in users
export async function GET(request: NextRequest) {
  try {
    const { data: activeUsers, error } = await supabase
      .from('active_checkins')
      .select(`
        user_id,
        checked_in_at,
        users (
          first_name,
          last_name
        )
      `)
      .order('checked_in_at', { ascending: false })

    if (error) {
      console.error('Error getting active users:', error)
      return NextResponse.json(
        { error: 'Failed to get active users' },
        { status: 500 }
      )
    }

    return NextResponse.json(activeUsers || [])

  } catch (error) {
    console.error('Error in active users API:', error)
    return NextResponse.json(
      { error: 'Failed to get active users' },
      { status: 500 }
    )
  }
}