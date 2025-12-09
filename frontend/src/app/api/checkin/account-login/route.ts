import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// POST /api/checkin/account-login - Login with email/username and password, then check in
export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, password } = await request.json()

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    // Try to find user by email first, then by username
    let user = null

    // Try email
    const { data: userByEmail } = await supabase
      .from('users')
      .select('*')
      .eq('email', emailOrUsername.toLowerCase())
      .single()

    if (userByEmail) {
      user = userByEmail
    } else {
      // Try username (case insensitive)
      const { data: userByUsername } = await supabase
        .from('users')
        .select('*')
        .ilike('username', emailOrUsername)
        .single()

      if (userByUsername) {
        user = userByUsername
      }
    }

    if (!user) {
      return NextResponse.json({
        message: 'Invalid email/username or password'
      }, { status: 401 })
    }

    // Check if user has a password set
    if (!user.password_hash) {
      return NextResponse.json({
        message: 'This account does not have a password set. Please use your 6-digit ID to login.'
      }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return NextResponse.json({
        message: 'Invalid email/username or password'
      }, { status: 401 })
    }

    // Check if already checked in
    const { data: existingCheckin } = await supabase
      .from('active_checkins')
      .select('*')
      .eq('user_id', user.user_id)
      .single()

    if (existingCheckin) {
      return NextResponse.json({
        message: 'You are already checked in',
        userId: user.user_id,
        username: user.username,
        isCheckedIn: true,
        checkedInAt: existingCheckin.checked_in_at
      })
    }

    // Check in the user
    const checkedInAt = new Date().toISOString()
    const { error: checkinError } = await supabase
      .from('active_checkins')
      .insert({
        user_id: user.user_id,
        username: user.username,
        checked_in_at: checkedInAt
      })

    if (checkinError) {
      console.error('Error checking in user:', checkinError)
      return NextResponse.json(
        { error: 'Failed to check in' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Successfully logged in and checked in',
      userId: user.user_id,
      username: user.username,
      checkedInAt
    })

  } catch (error) {
    console.error('Error in account-login API:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
