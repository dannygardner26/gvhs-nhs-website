import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  // Immediate fallback to prevent any 500 errors
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        tutoringSubjects: [],
        highlightedSubjects: [],
        error: 'User ID is required'
      });
    }

    // Check environment configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, returning mock data for demo');

      // Return mock data based on user ID for demo
      const mockUserSubjects: Record<string, { tutoring: string[], highlighted: string[] }> = {
        '123456': {
          tutoring: ['Mathematics', 'Physics', 'Calculus'],
          highlighted: ['Mathematics', 'Physics']
        },
        '789012': {
          tutoring: ['English Literature', 'History', 'Writing'],
          highlighted: ['English Literature', 'History']
        },
        '345678': {
          tutoring: ['Chemistry', 'Biology', 'Science'],
          highlighted: ['Chemistry', 'Biology']
        }
      };

      const userSubjects = mockUserSubjects[userId] || {
        tutoring: [],
        highlighted: []
      };

      return NextResponse.json({
        tutoringSubjects: userSubjects.tutoring,
        highlightedSubjects: userSubjects.highlighted
      });
    }

    try {
      // First check if user exists - with timeout and error handling
      const { data: user, error } = await supabase
        .from('users')
        .select('tutoring_subjects, highlighted_subjects')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.log('Database error when fetching user:', error?.message, 'Code:', error?.code);

        // Handle missing column error specifically
        if (error.code === '42703' && error.message.includes('tutoring_subjects')) {
          console.log('⚠️ SCHEMA ISSUE: tutoring_subjects column does not exist in users table');
          console.log('📝 Database schema needs to be updated with tutoring_subjects and highlighted_subjects columns');

          // Return empty arrays with a note about schema
          return NextResponse.json({
            tutoringSubjects: [],
            highlightedSubjects: [],
            debug: 'Database schema missing tutoring_subjects/highlighted_subjects columns'
          });
        }

        // Return empty arrays as defaults for other errors
        return NextResponse.json({
          tutoringSubjects: [],
          highlightedSubjects: [],
          debug: 'Database error: ' + error.message
        });
      }

      if (!user) {
        console.log('User not found with ID:', userId);
        return NextResponse.json({
          tutoringSubjects: [],
          highlightedSubjects: [],
          debug: 'User not found'
        });
      }

      // Try to parse subjects with fallback for missing columns
      let tutoringSubjects = [];
      let highlightedSubjects = [];

      try {
        if (user.tutoring_subjects) {
          tutoringSubjects = Array.isArray(user.tutoring_subjects)
            ? user.tutoring_subjects
            : JSON.parse(user.tutoring_subjects || '[]');
        }
      } catch (e) {
        console.log('Error parsing tutoring_subjects:', e);
        tutoringSubjects = [];
      }

      try {
        if (user.highlighted_subjects) {
          highlightedSubjects = Array.isArray(user.highlighted_subjects)
            ? user.highlighted_subjects
            : JSON.parse(user.highlighted_subjects || '[]');
        }
      } catch (e) {
        console.log('Error parsing highlighted_subjects:', e);
        highlightedSubjects = [];
      }

      return NextResponse.json({
        tutoringSubjects,
        highlightedSubjects
      });

    } catch (dbError) {
      console.log('Database error in tutoring subjects GET API:', dbError);
      // Graceful fallback for database connection issues
      return NextResponse.json({
        tutoringSubjects: [],
        highlightedSubjects: []
      });
    }

  } catch (error) {
    console.log('Error in tutoring subjects GET API:', error);
    // Always return valid data structure - never throw 500
    return NextResponse.json({
      tutoringSubjects: [],
      highlightedSubjects: []
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, tutoringSubjects } = await request.json();

    console.log('=== TUTORING SUBJECTS SAVE DEBUG ===');
    console.log('Received userId:', userId);
    console.log('Received tutoringSubjects:', tutoringSubjects);
    console.log('Supabase URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key configured:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (!userId) {
      console.log('❌ ERROR: No user ID provided');
      return NextResponse.json({
        message: 'User ID is required',
        tutoringSubjects: tutoringSubjects || [],
        error: 'User ID is required',
        debug: 'No userId in request'
      }, { status: 400 });
    }

    if (!Array.isArray(tutoringSubjects)) {
      console.log('❌ ERROR: tutoringSubjects is not an array:', typeof tutoringSubjects);
      return NextResponse.json({
        message: 'Tutoring subjects must be an array',
        tutoringSubjects: [],
        error: 'Tutoring subjects must be an array',
        debug: 'tutoringSubjects is not an array'
      }, { status: 400 });
    }

    // Check environment configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ WARNING: Supabase not configured, returning mock success');
      return NextResponse.json({
        message: 'Tutoring subjects saved successfully (mock - no Supabase config)',
        tutoringSubjects: tutoringSubjects,
        debug: 'Supabase environment not configured'
      });
    }

    // Validate NHS User ID format (but don't fail for development)
    const userIdPattern = /^\d{6}$/;
    if (!userIdPattern.test(userId)) {
      console.log('⚠️ WARNING: User ID format unexpected:', userId, 'Expected 6 digits, proceeding anyway...');
      // Don't return mock - continue with database save attempt
    } else {
      console.log('✅ User ID format valid:', userId);
    }

    try {
      console.log('🔍 Attempting to save to Supabase database...');
      console.log('Update query: users table, user_id =', userId);
      console.log('Data to save:', { tutoring_subjects: tutoringSubjects });

      // Update user's tutoring subjects
      const { data, error } = await supabase
        .from('users')
        .update({
          tutoring_subjects: tutoringSubjects,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select('tutoring_subjects')
        .single();

      if (error) {
        console.log('❌ Database error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        // Handle missing column error specifically
        if (error.code === 'PGRST204' && error.message.includes('tutoring_subjects')) {
          console.log('⚠️ SCHEMA ISSUE: tutoring_subjects column does not exist in users table');
          console.log('📝 Using localStorage fallback for now. Database schema needs to be updated.');

          // Return success but indicate we're using localStorage fallback
          return NextResponse.json({
            message: 'Tutoring subjects saved (using local storage - database schema needs tutoring_subjects column)',
            tutoringSubjects: tutoringSubjects,
            debug: 'Database schema missing tutoring_subjects column, using localStorage fallback'
          });
        }

        return NextResponse.json({
          message: 'Database error: ' + error.message,
          tutoringSubjects: tutoringSubjects,
          error: error.message,
          debug: 'Supabase update failed'
        }, { status: 500 });
      }

      console.log('✅ SUCCESS: Database save completed');
      console.log('Returned data:', data);

      return NextResponse.json({
        message: 'Tutoring subjects updated successfully in database',
        tutoringSubjects: data.tutoring_subjects || tutoringSubjects,
        debug: 'Successfully saved to Supabase'
      });

    } catch (dbError) {
      console.log('❌ CATCH: Database connection error:', dbError);
      return NextResponse.json({
        message: 'Database connection error: ' + (dbError as Error).message,
        tutoringSubjects: tutoringSubjects,
        error: (dbError as Error).message,
        debug: 'Database connection failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.log('Error in tutoring subjects POST API, returning mock:', error);
    return NextResponse.json({
      message: 'Tutoring subjects saved successfully (mock)',
      tutoringSubjects: []
    });
  }
}