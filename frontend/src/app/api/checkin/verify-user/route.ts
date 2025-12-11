import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/checkin/verify-user - Verify existing user ID without checking in
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user exists in users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { message: 'User ID not found. Please check your ID or register as a new user.' },
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
        {
          message: 'User is already checked in',
          firstName: user.first_name,
          lastName: user.last_name,
          alreadyCheckedIn: true,
          checkedInAt: existingCheckin.checked_in_at
        },
        { status: 400 }
      )
    }

    // User exists and is not checked in - return their info for confirmation
    return NextResponse.json({
      message: 'User verified successfully',
      userId,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      highlightedSubjects: user.highlighted_subjects || [],
      verified: true
    })

  } catch (error) {
    console.error('Error in verify-user API:', error)
    return NextResponse.json(
      { error: 'Failed to verify user' },
      { status: 500 }
    )
  }
}