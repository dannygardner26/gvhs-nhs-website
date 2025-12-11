import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        tutoringSubjects: [],
        highlightedSubjects: []
      });
    }

    console.log('=== USER SUBJECTS GET DEBUG ===');
    console.log('Fetching subjects for user:', userId);

    // Check environment configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ Supabase not configured, using localStorage fallback');

      // Try to get from localStorage as fallback
      return NextResponse.json({
        tutoringSubjects: [],
        highlightedSubjects: [],
        debug: 'Supabase not configured, using localStorage fallback'
      });
    }

    try {
      // Try to get from user_tutoring_subjects table
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('user_tutoring_subjects')
        .select('tutoring_subjects, highlighted_subjects')
        .eq('user_id', userId)
        .single();

      if (subjectsError) {
        // If table doesn't exist or user not found, create empty record
        if (subjectsError.code === '42P01' || subjectsError.code === 'PGRST116') {
          console.log('📝 user_tutoring_subjects table does not exist or user not found, returning empty');
          return NextResponse.json({
            tutoringSubjects: [],
            highlightedSubjects: [],
            debug: 'No subjects table or user record found'
          });
        }

        console.log('❌ Error fetching subjects:', subjectsError);
        return NextResponse.json({
          tutoringSubjects: [],
          highlightedSubjects: [],
          debug: 'Error fetching subjects: ' + subjectsError.message
        });
      }

      console.log('✅ Successfully fetched subjects:', subjectsData);

      return NextResponse.json({
        tutoringSubjects: subjectsData?.tutoring_subjects || [],
        highlightedSubjects: subjectsData?.highlighted_subjects || [],
        debug: 'Loaded from user_tutoring_subjects table'
      });

    } catch (dbError) {
      console.log('❌ Database error:', dbError);
      return NextResponse.json({
        tutoringSubjects: [],
        highlightedSubjects: [],
        debug: 'Database connection error'
      });
    }

  } catch (error) {
    console.error('❌ Error in user subjects GET:', error);
    return NextResponse.json({
      tutoringSubjects: [],
      highlightedSubjects: []
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, tutoringSubjects, highlightedSubjects } = await request.json();

    console.log('=== USER SUBJECTS SAVE DEBUG ===');
    console.log('User ID:', userId);
    console.log('Tutoring subjects:', tutoringSubjects);
    console.log('Highlighted subjects:', highlightedSubjects);

    if (!userId) {
      return NextResponse.json({
        message: 'User ID is required',
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Check environment configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('⚠️ Supabase not configured, indicating localStorage use');
      return NextResponse.json({
        message: 'Subjects saved (localStorage - Supabase not configured)',
        tutoringSubjects: tutoringSubjects || [],
        highlightedSubjects: highlightedSubjects || [],
        debug: 'Supabase not configured'
      });
    }

    try {
      // Use upsert to create or update the user's subjects
      const { data, error } = await supabase
        .from('user_tutoring_subjects')
        .upsert({
          user_id: userId,
          tutoring_subjects: tutoringSubjects || [],
          highlighted_subjects: highlightedSubjects || [],
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.log('❌ Database upsert error:', error);

        // Handle table doesn't exist
        if (error.code === '42P01') {
          console.log('📝 user_tutoring_subjects table does not exist');
          return NextResponse.json({
            message: 'Subjects saved (localStorage - database table missing)',
            tutoringSubjects: tutoringSubjects || [],
            highlightedSubjects: highlightedSubjects || [],
            debug: 'user_tutoring_subjects table does not exist'
          });
        }

        return NextResponse.json({
          message: 'Database error: ' + error.message,
          tutoringSubjects: tutoringSubjects || [],
          highlightedSubjects: highlightedSubjects || [],
          error: error.message
        }, { status: 500 });
      }

      console.log('✅ Successfully saved subjects to database');

      return NextResponse.json({
        message: 'Subjects saved successfully to database',
        tutoringSubjects: data.tutoring_subjects || [],
        highlightedSubjects: data.highlighted_subjects || [],
        debug: 'Saved to user_tutoring_subjects table'
      });

    } catch (dbError) {
      console.log('❌ Database connection error:', dbError);
      return NextResponse.json({
        message: 'Database connection error: ' + (dbError as Error).message,
        tutoringSubjects: tutoringSubjects || [],
        highlightedSubjects: highlightedSubjects || [],
        error: (dbError as Error).message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in user subjects POST:', error);
    return NextResponse.json({
      message: 'Server error',
      tutoringSubjects: [],
      highlightedSubjects: [],
      error: 'Server error'
    }, { status: 500 });
  }
}