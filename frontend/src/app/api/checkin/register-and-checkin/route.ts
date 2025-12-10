import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// POST /api/checkin/register-and-checkin - Register new user and check them in
export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, customUserId, email, password } = await request.json()

    if (!firstName || !lastName || !customUserId) {
      return NextResponse.json(
        { error: 'First name, last name, and user ID are required' },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if email is already taken (only if email provided)
    if (email) {
      const { data: existingEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()

      if (existingEmail) {
        return NextResponse.json({
          message: 'An account with this email already exists. Please use a different email or login with your existing account.'
        }, { status: 400 })
      }
    }

    const fullName = `${firstName} ${lastName}`

    // Check if user with this name already exists
    const { data: existingUserWithName } = await supabase
      .from('users')
      .select('*')
      .ilike('username', fullName)
      .single()

    if (existingUserWithName) {
      return NextResponse.json({
        message: `A user with the name "${fullName}" already exists. Please use a different name or contact an administrator.`
      }, { status: 400 })
    }

    // Check if the custom user ID is already taken
    const { data: existingUserId } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', customUserId)
      .single()

    if (existingUserId) {
      return NextResponse.json({
        message: `User ID "${customUserId}" is already taken. Please choose a different ID.`
      }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        user_id: customUserId,
        first_name: firstName,
        last_name: lastName,
        username: fullName,
        email: email ? email.toLowerCase() : null,
        password_hash: passwordHash
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Check in the new user
    const checkedInAt = new Date().toISOString()
    const { error: checkinError } = await supabase
      .from('active_checkins')
      .insert({
        user_id: customUserId,
        username: fullName,
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
      message: 'Successfully registered and checked in',
      id: newUser.id,
      userId: customUserId,
      firstName: firstName,
      lastName: lastName,
      username: fullName,
      email: email,
      checkedInAt
    })

  } catch (error) {
    console.error('Error in register-and-checkin API:', error)
    return NextResponse.json(
      { error: 'Failed to register and check in user' },
      { status: 500 }
    )
  }
}