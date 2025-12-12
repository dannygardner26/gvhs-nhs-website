import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/isp/[id] - Get single project with check-ins
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: project, error } = await supabase
      .from('independent_projects')
      .select(`
        *,
        isp_checkins (*)
      `)
      .eq('id', id)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/isp/[id] - Update project (status change)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { project_title, project_description, expected_end_date, status } = body;

    const updateData: Record<string, unknown> = {};

    if (project_title) updateData.project_title = project_title;
    if (project_description) updateData.project_description = project_description;
    if (expected_end_date) updateData.expected_end_date = expected_end_date;
    if (status && ['active', 'completed', 'abandoned'].includes(status)) {
      updateData.status = status;
    }

    const { data, error } = await supabase
      .from('independent_projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in ISP PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/isp/[id] - Delete project (only if no check-ins)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check for check-ins
    const { count } = await supabase
      .from('isp_checkins')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete project with existing check-ins. Mark as abandoned instead.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('independent_projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Error in ISP DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
