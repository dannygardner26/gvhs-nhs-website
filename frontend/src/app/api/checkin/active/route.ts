import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/checkin/active - Get all checked-in users
export async function GET(_request: NextRequest) {
  // Return mock data for development/demo purposes when Supabase isn't configured
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, returning mock data for demo')

      // Return mock active users for testing
      const mockUsers = [
        {
          user_id: '123456',
          checked_in_at: new Date().toISOString(),
          users: {
            first_name: 'John',
            last_name: 'Smith',
            highlighted_subjects: ['Mathematics', 'Physics']
          }
        },
        {
          user_id: '789012',
          checked_in_at: new Date().toISOString(),
          users: {
            first_name: 'Emily',
            last_name: 'Johnson',
            highlighted_subjects: ['English Literature', 'History']
          }
        },
        {
          user_id: '345678',
          checked_in_at: new Date().toISOString(),
          users: {
            first_name: 'Michael',
            last_name: 'Brown',
            highlighted_subjects: ['Chemistry', 'Biology']
          }
        }
      ]

      return NextResponse.json(mockUsers)
    }

    try {
      const { data: activeUsers, error } = await supabase
        .from('active_checkins')
        .select(`
          user_id,
          checked_in_at,
          users (
            first_name,
            last_name,
            highlighted_subjects
          )
        `)
        .order('checked_in_at', { ascending: false })

      if (error) {
        console.log('Error getting active users (table may not exist):', error.message)
        // Return empty array if table doesn't exist or has issues
        return NextResponse.json([])
      }

      return NextResponse.json(activeUsers || [])

    } catch (dbError) {
      console.log('Database connection error in active users API:', dbError)
      // Return empty array for graceful degradation
      return NextResponse.json([])
    }

  } catch (error) {
    console.log('Error in active users API:', error)
    // Always return valid array structure - never throw 500
    return NextResponse.json([])
  }
}