import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// DELETE /api/checkin/admin/delete-user - Completely remove a user from all tables
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Start a transaction-like operation by deleting from all related tables

    // 1. Delete from active_checkins (if currently checked in)
    const { error: activeCheckinsError } = await supabase
      .from('active_checkins')
      .delete()
      .eq('user_id', userId)

    if (activeCheckinsError) {
      console.error('Error deleting from active_checkins:', activeCheckinsError)
    }

    // 2. Delete from checkin_sessions (session history)
    const { error: sessionsError } = await supabase
      .from('checkin_sessions')
      .delete()
      .eq('user_id', userId)

    if (sessionsError) {
      console.error('Error deleting from checkin_sessions:', sessionsError)
    }

    // 3. Delete from opportunity_suggestions (if user made suggestions)
    const { error: suggestionsError } = await supabase
      .from('opportunity_suggestions')
      .delete()
      .eq('suggested_by', userId)

    if (suggestionsError) {
      console.error('Error deleting from opportunity_suggestions:', suggestionsError)
    }

    // 4. Delete from any other user-related tables (add more as needed)
    // Add additional tables here as your schema grows

    // 5. Finally, delete from users table
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .eq('user_id', userId)

    if (usersError) {
      console.error('Error deleting from users table:', usersError)
      return NextResponse.json(
        { error: 'Failed to delete user from main table' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `User ${userId} has been completely deleted from all systems`,
      deletedFrom: [
        'users',
        'active_checkins',
        'checkin_sessions',
        'opportunity_suggestions'
      ]
    })

  } catch (error) {
    console.error('Error in delete-user API:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}