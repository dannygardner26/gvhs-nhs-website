import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/checkin/admin/change-pin - Change user's PIN/userId (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId, newUserId } = await request.json()

    if (!userId || !newUserId) {
      return NextResponse.json(
        { error: 'Current User ID and new User ID are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if new userId is already taken (and it's not the same user)
    if (userId !== newUserId) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', newUserId)
        .single()

      if (existingUser) {
        return NextResponse.json(
          { error: 'New User ID is already taken' },
          { status: 400 }
        )
      }
    }

    // Update user ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ user_id: newUserId })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating user ID:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user ID' },
        { status: 500 }
      )
    }

    // Update session history
    const { error: historyUpdateError } = await supabase
      .from('session_history')
      .update({ user_id: newUserId })
      .eq('user_id', userId)

    if (historyUpdateError) {
      console.error('Error updating session history:', historyUpdateError)
    }

    // Update active checkins if user is currently checked in
    const { error: activeUpdateError } = await supabase
      .from('active_checkins')
      .update({ user_id: newUserId })
      .eq('user_id', userId)

    if (activeUpdateError) {
      console.error('Error updating active checkins:', activeUpdateError)
    }

    return NextResponse.json({
      message: 'User ID/PIN successfully updated',
      oldUserId: userId,
      newUserId,
      username: user.username
    })

  } catch (error) {
    console.error('Error changing PIN:', error)
    return NextResponse.json(
      { error: 'Failed to change PIN' },
      { status: 500 }
    )
  }
}