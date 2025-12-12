import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get current semester
function getCurrentSemester(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  // Fall: September (9) - December (12)
  // Spring: January (1) - May (5)
  if (month >= 9 && month <= 12) {
    return `${year}-Fall`;
  } else if (month >= 1 && month <= 5) {
    return `${year}-Spring`;
  } else {
    // Summer months (June-August) - show as next Fall
    return `${year}-Fall`;
  }
}

// GET /api/isp/semester - Get semester submissions for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const semester = searchParams.get('semester');
    const status = searchParams.get('status');

    let query = supabase
      .from('isp_checkins')
      .select(`
        *,
        independent_projects (id, project_title, user_id, user_name)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      // Filter by user through the project relationship
      query = query.eq('independent_projects.user_id', userId);
    }

    if (semester) {
      query = query.eq('quarter', semester); // 'quarter' column stores semester value
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.log('ISP semester query error:', error.message);
      return NextResponse.json([]);
    }

    // Filter out null projects (when user_id filter doesn't match)
    const filtered = submissions?.filter(s => s.independent_projects !== null) || [];

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching ISP submissions:', error);
    return NextResponse.json([]);
  }
}

// POST /api/isp/semester - Create or update semester submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, user_name, semester, progress_update } = body;

    if (!user_id || !progress_update) {
      return NextResponse.json(
        { error: 'User ID and progress update are required' },
        { status: 400 }
      );
    }

    const currentSemester = semester || getCurrentSemester();

    // Validate semester format
    if (!/^\d{4}-(Fall|Spring)$/.test(currentSemester)) {
      return NextResponse.json(
        { error: 'Semester must be in format YYYY-Fall or YYYY-Spring' },
        { status: 400 }
      );
    }

    // Get or create the user's ISP project (simplified - one project per user)
    const { data: existingProject } = await supabase
      .from('independent_projects')
      .select('id')
      .eq('user_id', user_id)
      .single();

    let projectId: string;

    if (existingProject) {
      projectId = existingProject.id;
    } else {
      // Create a default project for the user
      const { data: newProject, error: projectError } = await supabase
        .from('independent_projects')
        .insert({
          user_id,
          user_name: user_name || 'Unknown',
          project_title: 'Independent Service Project',
          project_description: 'Semester-based service project submissions',
          status: 'active',
          start_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (projectError || !newProject) {
        console.error('Error creating project:', projectError);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
      }
      projectId = newProject.id;
    }

    // Check if submission exists for this semester
    const { data: existing } = await supabase
      .from('isp_checkins')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('quarter', currentSemester)
      .single();

    if (existing) {
      // Update existing (only if not already reviewed)
      if (existing.status !== 'submitted') {
        return NextResponse.json(
          { error: 'Cannot edit a reviewed submission' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('isp_checkins')
        .update({ progress_update })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating submission:', error);
        return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    // Create new submission
    const { data, error } = await supabase
      .from('isp_checkins')
      .insert({
        project_id: projectId,
        quarter: currentSemester, // storing semester in quarter column
        progress_update,
        status: 'submitted'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating submission:', error);
      return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in ISP semester POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/isp/semester - Admin review submission
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const submissionId = body.submission_id || body.id;
    const { status, admin_notes, student_feedback, reviewed_by } = body;

    if (!submissionId || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    if (!['submitted', 'approved', 'flagged'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('isp_checkins')
      .update({
        status,
        admin_notes: admin_notes || null,
        student_feedback: student_feedback || null,
        reviewed_by: reviewed_by || 'admin',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) {
      console.error('Error reviewing submission:', error);
      return NextResponse.json({ error: 'Failed to review submission' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in ISP semester PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
