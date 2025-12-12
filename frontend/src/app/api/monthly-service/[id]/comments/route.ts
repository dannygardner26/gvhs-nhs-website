import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/monthly-service/[id]/comments - Get all comments for a submission
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionId } = await params;

    const { data: comments, error } = await supabase
      .from('monthly_service_comments')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    return NextResponse.json(comments || []);
  } catch (error) {
    console.error('Error in comments GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/monthly-service/[id]/comments - Add a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionId } = await params;
    const body = await request.json();
    const { author_type, author_id, author_name, message } = body;

    // Validate required fields
    if (!author_type || !author_id || !author_name || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: author_type, author_id, author_name, message' },
        { status: 400 }
      );
    }

    // Validate author_type
    if (!['admin', 'student'].includes(author_type)) {
      return NextResponse.json(
        { error: 'author_type must be "admin" or "student"' },
        { status: 400 }
      );
    }

    // Verify the submission exists
    const { data: submission, error: submissionError } = await supabase
      .from('monthly_service_submissions')
      .select('id, status')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Insert the comment
    const { data: comment, error } = await supabase
      .from('monthly_service_comments')
      .insert({
        submission_id: submissionId,
        author_type,
        author_id,
        author_name,
        message
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error in comments POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
