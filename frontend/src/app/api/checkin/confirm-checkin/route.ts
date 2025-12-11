import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/checkin/confirm-checkin - Check in a verified user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is already checked in
    const { data: existingCheckin } = await supabase
      .from('active_checkins')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingCheckin) {
      return NextResponse.json(
        { message: 'User is already checked in' },
        { status: 400 }
      )
    }

    // Check in the user
    const checkedInAt = new Date().toISOString()
    const { error: checkinError } = await supabase
      .from('active_checkins')
      .insert({
        user_id: userId,
        checked_in_at: checkedInAt
      })

    if (checkinError) {
      console.error('Error checking in user:', checkinError)
      return NextResponse.json(
        { error: 'Failed to check in user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Successfully checked in',
      userId,
      firstName: user.first_name,
      lastName: user.last_name,
      checkedInAt
    })

  } catch (error) {
    console.error('Error in confirm-checkin API:', error)
    return NextResponse.json(
      { error: 'Failed to check in user' },
      { status: 500 }
    )
  }
}