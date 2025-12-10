import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/checkin/admin/total-hours/[userId] - Get total volunteer hours for a specific user
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const { data: sessions, error } = await supabase
      .from('session_history')
      .select('duration_ms, duration')
      .eq('user_id', userId)

    if (error) {
      console.error('Error getting total hours:', error)
      return NextResponse.json(
        { error: 'Failed to get total hours' },
        { status: 500 }
      )
    }

    // Handle both duration_ms (new) and duration (old) fields for backwards compatibility
    const validSessions = sessions?.filter(session =>
      session.duration_ms !== null || session.duration !== null
    ) || []

    const totalMilliseconds = validSessions.reduce((sum, session) => {
      // Prefer duration_ms if available, otherwise use duration field
      const durationMs = session.duration_ms || session.duration || 0
      return sum + durationMs
    }, 0)

    const totalHours = totalMilliseconds / (1000 * 60 * 60)
    const hours = Math.floor(totalHours)
    const minutes = Math.floor((totalHours - hours) * 60)

    return NextResponse.json({
      userId,
      totalSessions: validSessions.length,
      totalMilliseconds,
      totalHours: `${hours}h ${minutes}m`
    })

  } catch (error) {
    console.error('Error in total hours API:', error)
    return NextResponse.json(
      { error: 'Failed to get total hours' },
      { status: 500 }
    )
  }
}