import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// POST /api/seed-test-users - Create test users 000001, 000002, 000003
export async function POST() {
  try {
    const testUsers = [
      {
        user_id: '000001',
        first_name: 'Test',
        last_name: 'User One',
        email: 'test1@example.com',
        password: 'test123'
      },
      {
        user_id: '000002',
        first_name: 'Test',
        last_name: 'User Two',
        email: 'test2@example.com',
        password: 'test123'
      },
      {
        user_id: '000003',
        first_name: 'Test',
        last_name: 'User Three',
        email: 'test3@example.com',
        password: 'test123'
      }
    ]

    const results = []

    for (const user of testUsers) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.user_id)
        .single()

      if (existingUser) {
        results.push({ userId: user.user_id, status: 'already exists' })
        continue
      }

      // Hash password
      const passwordHash = await bcrypt.hash(user.password, 10)

      // Create user
      const { error } = await supabase
        .from('users')
        .insert({
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          password_hash: passwordHash
        })

      if (error) {
        results.push({ userId: user.user_id, status: 'error', error: error.message })
      } else {
        results.push({ userId: user.user_id, status: 'created' })
      }
    }

    return NextResponse.json({
      message: 'Test users seeded',
      results,
      credentials: 'Password for all test users: test123'
    })

  } catch (error) {
    console.error('Error seeding test users:', error)
    return NextResponse.json(
      { error: 'Failed to seed test users' },
      { status: 500 }
    )
  }
}

// GET /api/seed-test-users - Check if test users exist
export async function GET() {
  try {
    const testUserIds = ['000001', '000002', '000003']
    const results = []

    for (const userId of testUserIds) {
      const { data } = await supabase
        .from('users')
        .select('user_id, first_name, last_name, email')
        .eq('user_id', userId)
        .single()

      results.push({
        userId,
        exists: !!data,
        data: data || null
      })
    }

    return NextResponse.json({ testUsers: results })

  } catch (error) {
    console.error('Error checking test users:', error)
    return NextResponse.json(
      { error: 'Failed to check test users' },
      { status: 500 }
    )
  }
}
