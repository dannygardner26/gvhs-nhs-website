import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/checkin/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const { data: users, error } = await supabase
      .from('user_stats')
      .select('*')
      .order('username')

    if (error) {
      console.error('Error getting all users:', error)
      return NextResponse.json(
        { error: 'Failed to get users' },
        { status: 500 }
      )
    }

    return NextResponse.json(users || [])

  } catch (error) {
    console.error('Error in admin users API:', error)
    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    )
  }
}