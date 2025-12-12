import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/monthly-service - Get all submissions (for admin) or filter by user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const month = searchParams.get('month');
    const status = searchParams.get('status');

    let query = supabase
      .from('monthly_service_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (month) {
      query = query.eq('month', month);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.log('Monthly service table may not exist:', error.message);
      return NextResponse.json([]);
    }

    return NextResponse.json(submissions || []);
  } catch (error) {
    console.error('Error fetching monthly service submissions:', error);
    return NextResponse.json([]);
  }
}

// POST /api/monthly-service - Create or update submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, user_name, month, description } = body;

    if (!user_id || !month || !description) {
      return NextResponse.json(
        { error: 'User ID, month, and description are required' },
        { status: 400 }
      );
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: 'Month must be in YYYY-MM format' },
        { status: 400 }
      );
    }

    // Check if submission exists for this user/month
    const { data: existing } = await supabase
      .from('monthly_service_submissions')
      .select('id, status')
      .eq('user_id', user_id)
      .eq('month', month)
      .single();

    if (existing) {
      // Allow editing any submission - reset status to 'submitted' on resubmit
      const updateData: Record<string, unknown> = { description };

      // Track resubmission if it was previously reviewed
      if (existing.status !== 'submitted') {
        updateData.status = 'submitted';
        updateData.resubmitted_at = new Date().toISOString();
        // Clear previous review data on resubmit
        updateData.reviewed_at = null;
        updateData.reviewed_by = null;
      }

      const { data, error } = await supabase
        .from('monthly_service_submissions')
        .update(updateData)
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
      .from('monthly_service_submissions')
      .insert({
        user_id,
        user_name: user_name || 'Unknown',
        month,
        description,
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
    console.error('Error in monthly service POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/monthly-service - Admin review submission
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    // Accept both 'id' and 'submission_id' for backwards compatibility
    const submissionId = body.submission_id || body.id;
    const { status, admin_notes, student_feedback, reviewed_by } = body;

    if (!submissionId || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    if (!['submitted', 'approved', 'flagged'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('monthly_service_submissions')
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

    // Auto-create a comment when flagging with feedback
    // This puts the admin feedback into the conversation thread
    if (status === 'flagged' && student_feedback) {
      await supabase.from('monthly_service_comments').insert({
        submission_id: submissionId,
        author_type: 'admin',
        author_id: 'admin',
        author_name: 'NHS Admin',
        message: student_feedback
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in monthly service PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
