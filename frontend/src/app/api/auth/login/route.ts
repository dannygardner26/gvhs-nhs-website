import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { decryptData } from '@/lib/encryption'

// POST /api/auth/login - Login with User ID or email and password (no auto check-in)
export async function POST(request: NextRequest) {
  try {
    const { userIdOrEmail, password } = await request.json()

    if (!userIdOrEmail || !password) {
      return NextResponse.json(
        { error: 'User ID or email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email or encrypted user ID
    let user = null
    let decryptedUserId = null
    const inputValue = userIdOrEmail.trim().toLowerCase()

    // Check if the input looks like a 6-digit User ID
    const is6DigitId = /^\d{6}$/.test(inputValue)

    if (is6DigitId) {
      // Get all users and decrypt their user IDs to find a match
      const { data: allUsers } = await supabase
        .from('users')
        .select('*')

      if (allUsers) {
        for (const u of allUsers) {
          try {
            const decrypted = decryptData(u.user_id)
            if (decrypted === inputValue) {
              user = u
              decryptedUserId = decrypted
              break
            }
          } catch {
            // Skip users with invalid encrypted data
            continue
          }
        }
      }
    }

    // If not found by ID, try email
    if (!user) {
      const { data: userByEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', inputValue)
        .single()

      if (userByEmail) {
        user = userByEmail
        // Decrypt the user ID
        try {
          decryptedUserId = decryptData(userByEmail.user_id)
        } catch (error) {
          console.error('Failed to decrypt user ID:', error)
          return NextResponse.json({
            message: 'Account data corrupted'
          }, { status: 500 })
        }
      }
    }

    if (!user) {
      return NextResponse.json({
        message: 'Invalid User ID/email or password'
      }, { status: 401 })
    }

    // Check if user has a password set
    if (!user.password_hash) {
      return NextResponse.json({
        message: 'This account does not have a password set. Please use your 6-digit ID to login.'
      }, { status: 401 })
    }

    // Decrypt and verify password
    let decryptedPasswordHash
    try {
      decryptedPasswordHash = decryptData(user.password_hash)
    } catch (error) {
      console.error('Failed to decrypt password hash:', error)
      return NextResponse.json({
        message: 'Account data corrupted'
      }, { status: 500 })
    }

    const passwordMatch = await bcrypt.compare(password, decryptedPasswordHash)
    if (!passwordMatch) {
      return NextResponse.json({
        message: 'Invalid User ID/email or password'
      }, { status: 401 })
    }

    // Return user info (no check-in)
    return NextResponse.json({
      message: 'Login successful',
      id: user.id,
      userId: decryptedUserId,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      username: `${user.first_name} ${user.last_name}`.trim()
    })

  } catch (error) {
    console.error('Error in auth/login API:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
