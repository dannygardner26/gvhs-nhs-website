import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/announcements/[id]/read - Mark announcement as read by user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: announcementId } = await params;
    const body = await request.json();
    const { user_id, user_name } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Upsert to handle duplicates gracefully
    const { data, error } = await supabase
      .from('announcement_read_receipts')
      .upsert(
        {
          announcement_id: announcementId,
          user_id,
          user_name: user_name || null,
          read_at: new Date().toISOString()
        },
        {
          onConflict: 'announcement_id,user_id',
          ignoreDuplicates: true
        }
      )
      .select()
      .single();

    if (error && error.code !== '23505') { // Ignore unique violation errors
      console.error('Error recording read receipt:', error);
      return NextResponse.json({ error: 'Failed to record read receipt' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in read receipt POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/announcements/[id]/read - Get read receipts for an announcement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: announcementId } = await params;

    const { data: receipts, error } = await supabase
      .from('announcement_read_receipts')
      .select('*')
      .eq('announcement_id', announcementId)
      .order('read_at', { ascending: false });

    if (error) {
      console.error('Error fetching read receipts:', error);
      return NextResponse.json({ error: 'Failed to fetch read receipts' }, { status: 500 });
    }

    return NextResponse.json({
      count: receipts?.length || 0,
      receipts: receipts || []
    });
  } catch (error) {
    console.error('Error in read receipt GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
