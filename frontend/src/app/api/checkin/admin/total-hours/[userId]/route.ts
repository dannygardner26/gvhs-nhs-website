import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/checkin/admin/total-hours/[userId] - Get total volunteer hours for a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    const { data: sessions, error } = await supabase
      .from('session_history')
      .select('duration_ms')
      .eq('user_id', userId)
      .not('duration_ms', 'is', null)

    if (error) {
      console.error('Error getting total hours:', error)
      return NextResponse.json(
        { error: 'Failed to get total hours' },
        { status: 500 }
      )
    }

    const totalMilliseconds = sessions?.reduce((sum, session) => sum + (session.duration_ms || 0), 0) || 0
    const totalHours = totalMilliseconds / (1000 * 60 * 60)

    return NextResponse.json({
      userId,
      totalSessions: sessions?.length || 0,
      totalMilliseconds,
      totalHours: parseFloat(totalHours.toFixed(2))
    })

  } catch (error) {
    console.error('Error in total hours API:', error)
    return NextResponse.json(
      { error: 'Failed to get total hours' },
      { status: 500 }
    )
  }
}