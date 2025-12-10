import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// DELETE /api/checkin/admin/delete-user - Completely remove a user from all tables
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      console.error('Delete user API: No user ID provided')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('=== USER DELETION START ===')
    console.log('Received user ID:', userId)
    console.log('User ID type:', typeof userId)
    console.log('User ID length:', userId.length)

    // Validate that we received what looks like a real user ID (not a masked one)
    if (userId.includes('*')) {
      console.error('Invalid user ID format - appears to be masked ID:', userId)
      return NextResponse.json(
        { error: 'Invalid user ID format - cannot delete with masked ID' },
        { status: 400 }
      )
    }

    console.log('Deleting user:', userId, 'from all tables...')

    // Delete from all related tables in the correct order
    const deletedTables = []

    // 1. Delete from active_checkins (if currently checked in)
    const { error: activeCheckinsError } = await supabase
      .from('active_checkins')
      .delete()
      .eq('user_id', userId)

    if (activeCheckinsError) {
      console.error('Error deleting from active_checkins:', activeCheckinsError)
    } else {
      deletedTables.push('active_checkins')
      console.log('Deleted from active_checkins')
    }

    // 2. Delete from session_history (all session history)
    const { error: sessionHistoryError } = await supabase
      .from('session_history')
      .delete()
      .eq('user_id', userId)

    if (sessionHistoryError) {
      console.error('Error deleting from session_history:', sessionHistoryError)
    } else {
      deletedTables.push('session_history')
      console.log('Deleted from session_history')
    }

    // 3. Delete from checkin_sessions (alternative session storage)
    const { error: checkinSessionsError } = await supabase
      .from('checkin_sessions')
      .delete()
      .eq('user_id', userId)

    if (checkinSessionsError) {
      console.error('Error deleting from checkin_sessions:', checkinSessionsError)
    } else {
      deletedTables.push('checkin_sessions')
      console.log('Deleted from checkin_sessions')
    }

    // 4. Delete from opportunity_suggestions (suggestions made by this user)
    const { error: suggestionsError } = await supabase
      .from('opportunity_suggestions')
      .delete()
      .eq('nhs_user_id', userId) // Corrected field name

    if (suggestionsError) {
      console.error('Error deleting from opportunity_suggestions:', suggestionsError)
    } else {
      deletedTables.push('opportunity_suggestions')
      console.log('Deleted from opportunity_suggestions')
    }

    // 5. Delete from school_visit_signups (if user signed up for visits)
    const { error: schoolVisitsError } = await supabase
      .from('school_visit_signups')
      .delete()
      .eq('nhs_user_id', userId)

    if (schoolVisitsError) {
      console.error('Error deleting from school_visit_signups:', schoolVisitsError)
    } else {
      deletedTables.push('school_visit_signups')
      console.log('Deleted from school_visit_signups')
    }

    // 6. Finally, delete from users table (main user record)
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
    } else {
      deletedTables.push('users')
      console.log('Deleted from users table')
    }

    console.log('Successfully deleted user from:', deletedTables)

    // Verify deletion by checking if user still exists in main table
    const { data: verificationCheck, error: verificationError } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (verificationError) {
      console.error('Error during deletion verification:', verificationError)
    } else if (verificationCheck) {
      console.error('DELETION FAILED: User still exists in database after deletion attempt')
      return NextResponse.json(
        { error: 'User deletion failed - user still exists in database' },
        { status: 500 }
      )
    } else {
      console.log('✅ DELETION VERIFIED: User successfully removed from database')
    }

    console.log('=== USER DELETION COMPLETE ===')

    return NextResponse.json({
      message: `User ${userId} has been completely deleted from all systems`,
      deletedFrom: deletedTables,
      verified: true
    })

  } catch (error) {
    console.error('Error in delete-user API:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}