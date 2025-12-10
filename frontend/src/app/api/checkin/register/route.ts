import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { encryptData } from '@/lib/encryption'

// POST /api/checkin/register - Register new user (without auto check-in)
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
      .eq('first_name', firstName)
      .eq('last_name', lastName)
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

    // Encrypt sensitive data
    const encryptedUserId = encryptData(customUserId)
    const encryptedPasswordHash = encryptData(passwordHash)

    // Create new user (without checking in)
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        user_id: encryptedUserId,
        first_name: firstName,
        last_name: lastName,
        email: email ? email.toLowerCase() : null,
        password_hash: encryptedPasswordHash
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

    return NextResponse.json({
      message: 'Registration successful! You can now check in using your User ID.',
      id: newUser.id,
      userId: customUserId,
      firstName: firstName,
      lastName: lastName,
      email: email
    })

  } catch (error) {
    console.error('Error in register API:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}
