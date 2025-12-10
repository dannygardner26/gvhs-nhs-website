import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/auth - Authenticate admin PIN
export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json()

    if (!pin) {
      return NextResponse.json(
        { error: 'Admin PIN is required' },
        { status: 400 }
      )
    }

    // Check for master admin override first
    const masterAdminPin = process.env.MASTER_ADMIN_PIN || "EMERGENCY_OVERRIDE_2024";
    if (pin === masterAdminPin) {
      return NextResponse.json({
        success: true,
        message: 'Master admin access granted'
      })
    }

    // Check against main admin PIN (simple string comparison)
    const adminPin = process.env.ADMIN_PIN || "Volunteeringisgreat";
    if (pin === adminPin) {
      return NextResponse.json({
        success: true,
        message: 'Admin access granted'
      })
    }

    // If neither PIN matches, return error
    return NextResponse.json({
      error: 'Invalid admin PIN'
    }, { status: 401 })

  } catch (error) {
    console.error('Admin authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}