import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/announcements - Get announcements (optionally include inactive)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';

    let query = supabase
      .from('announcements')
      .select('*');

    if (!includeInactive) {
      query = query
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
    }

    const { data: announcements, error } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Announcements query error:', error.message);
      return NextResponse.json([]);
    }

    return NextResponse.json(announcements || []);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json([]);
  }
}

// POST /api/announcements - Create new announcement (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, priority, is_pinned, expires_at, created_by, link_url } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        priority: priority || 'normal',
        is_pinned: is_pinned || false,
        expires_at: expires_at || null,
        created_by: created_by || 'admin',
        link_url: link_url || null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in announcement POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/announcements - Update announcement
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, priority, is_pinned, expires_at, is_active, link_url } = body;

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('announcements')
      .update({
        title,
        content,
        priority,
        is_pinned,
        expires_at,
        is_active,
        link_url
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating announcement:', error);
      return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in announcement PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/announcements - Soft delete announcement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('announcements')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting announcement:', error);
      return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('Error in announcement DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
