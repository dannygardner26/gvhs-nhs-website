import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/checkin/count - Get current count of checked-in users
export async function GET(_request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, returning mock count for demo')
      return NextResponse.json({ count: 3 })
    }

    // Use select and count the rows (more reliable than count query)
    const { data, error, status, statusText } = await supabase
      .from('active_checkins')
      .select('user_id')

    console.log('[COUNT API] Supabase response:', {
      data,
      error,
      status,
      statusText,
      dataLength: data?.length
    })

    if (error) {
      console.error('[COUNT API] Error getting checkin count:', error)
      return NextResponse.json({ count: 0, error: error.message, debug: 'supabase_error' })
    }

    const count = data?.length || 0
    console.log('[COUNT API] Returning count:', count)
    return NextResponse.json({ count })

  } catch (error) {
    console.error('[COUNT API] Exception:', error)
    return NextResponse.json({ count: 0, debug: 'exception' })
  }
}