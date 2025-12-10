import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/admin/debug-database - Show actual database structure and sample data
export async function GET(request: NextRequest) {
  try {
    console.log('Debugging database structure...')

    const debug: Record<string, unknown> = {
      tables: {},
      errors: []
    }

    // Check users table
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (usersError) {
        debug.errors.push(`users error: ${usersError.message}`)
      } else {
        debug.tables.users = {
          count: users?.length || 0,
          sampleData: users?.[0] || null,
          columns: users?.[0] ? Object.keys(users[0]) : []
        }
      }
    } catch (e) {
      debug.errors.push(`users exception: ${e}`)
    }

    // Check session_history table
    try {
      const { data: sessions, error: sessionsError } = await supabase
        .from('session_history')
        .select('*')
        .limit(1)

      if (sessionsError) {
        debug.errors.push(`session_history error: ${sessionsError.message}`)
      } else {
        debug.tables.session_history = {
          count: sessions?.length || 0,
          sampleData: sessions?.[0] || null,
          columns: sessions?.[0] ? Object.keys(sessions[0]) : []
        }
      }
    } catch (e) {
      debug.errors.push(`session_history exception: ${e}`)
    }

    // Check checkin_sessions table
    try {
      const { data: checkins, error: checkinsError } = await supabase
        .from('checkin_sessions')
        .select('*')
        .limit(1)

      if (checkinsError) {
        debug.errors.push(`checkin_sessions error: ${checkinsError.message}`)
      } else {
        debug.tables.checkin_sessions = {
          count: checkins?.length || 0,
          sampleData: checkins?.[0] || null,
          columns: checkins?.[0] ? Object.keys(checkins[0]) : []
        }
      }
    } catch (e) {
      debug.errors.push(`checkin_sessions exception: ${e}`)
    }

    // Check active_checkins table
    try {
      const { data: active, error: activeError } = await supabase
        .from('active_checkins')
        .select('*')
        .limit(1)

      if (activeError) {
        debug.errors.push(`active_checkins error: ${activeError.message}`)
      } else {
        debug.tables.active_checkins = {
          count: active?.length || 0,
          sampleData: active?.[0] || null,
          columns: active?.[0] ? Object.keys(active[0]) : []
        }
      }
    } catch (e) {
      debug.errors.push(`active_checkins exception: ${e}`)
    }

    // Check opportunity_suggestions table
    try {
      const { data: suggestions, error: suggestionsError } = await supabase
        .from('opportunity_suggestions')
        .select('*')
        .limit(1)

      if (suggestionsError) {
        debug.errors.push(`opportunity_suggestions error: ${suggestionsError.message}`)
      } else {
        debug.tables.opportunity_suggestions = {
          count: suggestions?.length || 0,
          sampleData: suggestions?.[0] || null,
          columns: suggestions?.[0] ? Object.keys(suggestions[0]) : []
        }
      }
    } catch (e) {
      debug.errors.push(`opportunity_suggestions exception: ${e}`)
    }

    // Check school_visit_signups table
    try {
      const { data: visits, error: visitsError } = await supabase
        .from('school_visit_signups')
        .select('*')
        .limit(1)

      if (visitsError) {
        debug.errors.push(`school_visit_signups error: ${visitsError.message}`)
      } else {
        debug.tables.school_visit_signups = {
          count: visits?.length || 0,
          sampleData: visits?.[0] || null,
          columns: visits?.[0] ? Object.keys(visits[0]) : []
        }
      }
    } catch (e) {
      debug.errors.push(`school_visit_signups exception: ${e}`)
    }

    console.log('Database debug complete:', debug)

    return NextResponse.json({
      message: 'Database structure analysis complete',
      debug: debug
    })

  } catch (error) {
    console.error('Error in debug database API:', error)
    return NextResponse.json(
      { error: 'Failed to debug database', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}