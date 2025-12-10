import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { decryptData, maskUserId } from '@/lib/encryption'

// GET /api/checkin/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Get users from the main users table to access encrypted data
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        active_checkins(checked_in_at)
      `)
      .order('username')

    if (error) {
      console.error('Error getting all users:', error)
      return NextResponse.json(
        { error: 'Failed to get users' },
        { status: 500 }
      )
    }

    // Decrypt user IDs for admin panel but mask them for security
    const processedUsers = users?.map(user => {
      try {
        const decryptedUserId = decryptData(user.user_id)
        return {
          ...user,
          userId: maskUserId(decryptedUserId), // Masked for display
          user_id: maskUserId(decryptedUserId), // For compatibility
          isCheckedIn: user.active_checkins && user.active_checkins.length > 0,
          checkedInAt: user.active_checkins?.[0]?.checked_in_at || null,
          // Remove password hash from response
          password_hash: undefined
        }
      } catch (error) {
        console.error('Failed to decrypt user data:', error)
        return {
          ...user,
          userId: '***ERROR***',
          user_id: '***ERROR***',
          isCheckedIn: false,
          checkedInAt: null,
          password_hash: undefined
        }
      }
    }) || []

    return NextResponse.json(processedUsers)

  } catch (error) {
    console.error('Error in admin users API:', error)
    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    )
  }
}