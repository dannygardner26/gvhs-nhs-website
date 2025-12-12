import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to get current quarter
function getCurrentQuarter(): string {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `${now.getFullYear()}-Q${quarter}`;
}

// GET /api/isp/[id]/checkins - Get check-ins for a project
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: checkins, error } = await supabase
      .from('isp_checkins')
      .select('*')
      .eq('project_id', id)
      .order('quarter', { ascending: false });

    if (error) {
      console.log('ISP checkins query error:', error.message);
      return NextResponse.json([]);
    }

    return NextResponse.json(checkins || []);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json([]);
  }
}

// POST /api/isp/[id]/checkins - Submit quarterly check-in
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quarter, progress_update } = body;

    if (!progress_update) {
      return NextResponse.json(
        { error: 'Progress update is required' },
        { status: 400 }
      );
    }

    const quarterToUse = quarter || getCurrentQuarter();

    // Validate quarter format (YYYY-Q#)
    if (!/^\d{4}-Q[1-4]$/.test(quarterToUse)) {
      return NextResponse.json(
        { error: 'Quarter must be in YYYY-Q# format (e.g., 2024-Q4)' },
        { status: 400 }
      );
    }

    // Check if check-in already exists for this quarter
    const { data: existing } = await supabase
      .from('isp_checkins')
      .select('id, status')
      .eq('project_id', id)
      .eq('quarter', quarterToUse)
      .single();

    if (existing) {
      // Update if not reviewed
      if (existing.status !== 'submitted') {
        return NextResponse.json(
          { error: 'Cannot edit a reviewed check-in' },
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
        console.error('Error updating check-in:', error);
        return NextResponse.json({ error: 'Failed to update check-in' }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    // Create new check-in
    const { data, error } = await supabase
      .from('isp_checkins')
      .insert({
        project_id: id,
        quarter: quarterToUse,
        progress_update,
        status: 'submitted'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating check-in:', error);
      return NextResponse.json({ error: 'Failed to create check-in' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in check-in POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/isp/[id]/checkins - Admin review check-in
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params; // Project ID not directly used for review
    const body = await request.json();
    const { checkin_id, status, admin_notes, reviewed_by } = body;

    if (!checkin_id || !status) {
      return NextResponse.json({ error: 'Check-in ID and status required' }, { status: 400 });
    }

    if (!['submitted', 'approved', 'flagged'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('isp_checkins')
      .update({
        status,
        admin_notes: admin_notes || null,
        reviewed_by: reviewed_by || 'admin',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', checkin_id)
      .select()
      .single();

    if (error) {
      console.error('Error reviewing check-in:', error);
      return NextResponse.json({ error: 'Failed to review check-in' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in check-in PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
