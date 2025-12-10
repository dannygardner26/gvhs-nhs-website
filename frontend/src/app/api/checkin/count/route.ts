import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/checkin/count - Get current count of checked-in users
export async function GET(_request: NextRequest) {
  try {
    const { count, error } = await supabase
      .from('active_checkins')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error getting checkin count:', error)
      return NextResponse.json(
        { error: 'Failed to get checkin count' },
        { status: 500 }
      )
    }

    return NextResponse.json({ count: count || 0 })

  } catch (error) {
    console.error('Error in count API:', error)
    return NextResponse.json(
      { error: 'Failed to get checkin count' },
      { status: 500 }
    )
  }
}