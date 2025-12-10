import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/checkin/admin/all-sessions - Get all session history (admin only)
export async function GET(_request: NextRequest) {
  try {
    const { data: sessions, error } = await supabase
      .from('session_history')
      .select('*')
      .order('checked_in_at', { ascending: false })

    if (error) {
      console.error('Error getting all sessions:', error)
      return NextResponse.json(
        { error: 'Failed to get all sessions' },
        { status: 500 }
      )
    }

    return NextResponse.json(sessions || [])

  } catch (error) {
    console.error('Error in all sessions API:', error)
    return NextResponse.json(
      { error: 'Failed to get all sessions' },
      { status: 500 }
    )
  }
}