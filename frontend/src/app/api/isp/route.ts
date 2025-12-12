import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/isp - Get all projects or filter by user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('independent_projects')
      .select(`
        *,
        isp_checkins (*)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: projects, error } = await query;

    if (error) {
      console.log('ISP table may not exist:', error.message);
      return NextResponse.json([]);
    }

    return NextResponse.json(projects || []);
  } catch (error) {
    console.error('Error fetching ISP projects:', error);
    return NextResponse.json([]);
  }
}

// POST /api/isp - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, user_name, project_title, project_description, start_date, expected_end_date } = body;

    if (!user_id || !project_title || !project_description || !start_date) {
      return NextResponse.json(
        { error: 'User ID, title, description, and start date are required' },
        { status: 400 }
      );
    }

    // Check if user already has an active project
    const { data: existing } = await supabase
      .from('independent_projects')
      .select('id')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You already have an active project. Complete or abandon it first.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('independent_projects')
      .insert({
        user_id,
        user_name: user_name || 'Unknown',
        project_title,
        project_description,
        start_date,
        expected_end_date: expected_end_date || null,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in ISP POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
