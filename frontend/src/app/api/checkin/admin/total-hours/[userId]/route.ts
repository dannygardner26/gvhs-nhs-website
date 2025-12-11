import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/checkin/admin/total-hours/[userId] - Get total volunteer hours for a specific user
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    console.log(`=== TOTAL HOURS DEBUG for user ${userId} ===`);

    const { data: sessions, error } = await supabase
      .from('session_history')
      .select('duration_ms, checked_in_at, checked_out_at')
      .eq('user_id', userId)

    console.log('Session query result:', { sessions, error });

    if (error) {
      console.log('❌ Error getting total hours (table may not exist):', error)
      // Return default values if table doesn't exist
      return NextResponse.json({
        userId,
        totalSessions: 0,
        totalMilliseconds: 0,
        totalHours: '0h 0m',
        debug: `Database error: ${error.message}`
      })
    }

    // Use duration_ms field
    const validSessions = sessions?.filter(session =>
      session.duration_ms !== null && session.duration_ms !== undefined
    ) || []

    const totalMilliseconds = validSessions.reduce((sum, session) => {
      return sum + (session.duration_ms || 0)
    }, 0)

    const totalHours = totalMilliseconds / (1000 * 60 * 60)
    const hours = Math.floor(totalHours)
    const minutes = Math.floor((totalHours - hours) * 60)

    console.log(`✅ Total hours calculated: ${hours}h ${minutes}m from ${validSessions.length} sessions`);

    return NextResponse.json({
      userId,
      totalSessions: validSessions.length,
      totalMilliseconds,
      totalHours: `${hours}h ${minutes}m`,
      debug: `Found ${sessions?.length || 0} total sessions, ${validSessions.length} valid sessions`
    })

  } catch (error) {
    console.error('Error in total hours API:', error)
    return NextResponse.json({
      userId,
      totalSessions: 0,
      totalMilliseconds: 0,
      totalHours: '0h 0m'
    })
  }
}