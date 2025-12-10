import { NextRequest, NextResponse } from 'next/server'

// GET /api/health - Health check endpoint
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    message: 'GVHS NHS API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: 'Supabase PostgreSQL'
  })
}