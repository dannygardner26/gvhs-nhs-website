import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { encryptData } from '@/lib/encryption'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'

// Rate limiter: 5 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
})

// Validation Schema
const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").regex(/^[a-zA-Z\s-]+$/, "Name contains invalid characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").regex(/^[a-zA-Z\s-]+$/, "Name contains invalid characters").max(50),
  customUserId: z.string().length(6, "User ID must be exactly 6 digits").regex(/^\d+$/, "User ID must be numeric"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'
    try {
      await limiter.check(null, 5, ip)
    } catch {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()

    // 2. Input Validation
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { firstName, lastName, customUserId, email, password } = validation.data

    // Check if email passes secondary checks (optional vs empty string)
    let cleanEmail = null;
    if (email && email.trim() !== "") {
      cleanEmail = email.toLowerCase().trim();
      // Check if email is already taken
      const { data: existingEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
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

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        user_id: encryptedUserId,
        first_name: firstName,
        last_name: lastName,
        email: cleanEmail,
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

    // SUCCESS - Set Secure Cookie
    await setUserSessionCookie(customUserId);

    return NextResponse.json({
      message: 'Registration successful!',
      id: newUser.id,
      userId: customUserId,
      firstName: firstName,
      lastName: lastName,
      email: cleanEmail
    })

  } catch (error) {
    console.error('Error in register API:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}
