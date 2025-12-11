import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const {
      eventId,
      nhsUserId,
      name,
      email,
      message,
      preferredContact,
      // NHS Elementary specific fields
      preferredSchool,
      teacherLastName,
      teacherEmail,
      emergencyContact,
      emergencyPhone,
      // Transportation data
      hasOwnRide,
      drivingMinutes,
      driverAddress,
      passengerCapacity,
      riderAddress,
      rideNeeds
    } = await request.json();

    // Validate required fields
    if (!eventId || !nhsUserId || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate NHS User ID format
    if (!/^\d{6}$/.test(nhsUserId)) {
      return NextResponse.json(
        { error: 'NHS User ID must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Check if user already expressed interest in this event
    const { data: existingInterest } = await supabase
      .from('volunteer_interest_submissions')
      .select('id')
      .eq('event_id', eventId)
      .eq('nhs_user_id', nhsUserId)
      .single();

    if (existingInterest) {
      return NextResponse.json(
        { error: 'You have already expressed interest in this event' },
        { status: 400 }
      );
    }

    // Insert interest submission into database
    const submissionData: any = {
      event_id: eventId,
      nhs_user_id: nhsUserId,
      name,
      email,
      message: message || null,
      preferred_contact: preferredContact || 'email',
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Add NHS Elementary specific fields if this is an elementary school visit
    if (eventId === 'nhs-elementary') {
      submissionData.preferred_school = preferredSchool || null;
      submissionData.teacher_last_name = teacherLastName || null;
      submissionData.teacher_email = teacherEmail || null;
      submissionData.emergency_contact = emergencyContact || null;
      submissionData.emergency_phone = emergencyPhone || null;
    }

    const { data, error } = await supabase
      .from('volunteer_interest_submissions')
      .insert(submissionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating volunteer interest submission:', error);
      return NextResponse.json(
        { error: 'Failed to submit interest' },
        { status: 500 }
      );
    }

    // Handle transportation data for NHS Elementary visits
    if (eventId === 'nhs-elementary' && hasOwnRide && data?.id) {
      try {
        const transportationData: any = {
          submission_id: data.id,
          nhs_user_id: nhsUserId,
          has_own_ride: hasOwnRide === 'yes',
          created_at: new Date().toISOString()
        };

        if (hasOwnRide === 'yes') {
          // Driver data
          transportationData.is_driver = true;
          transportationData.driving_minutes = drivingMinutes || 5;
          transportationData.driver_address = driverAddress || null;
          transportationData.passenger_capacity = passengerCapacity || 1;
        } else {
          // Rider data
          transportationData.is_driver = false;
          transportationData.rider_address = riderAddress || null;
          transportationData.ride_needs = rideNeeds || 'both';
        }

        // Insert transportation data (gracefully handle if table doesn't exist)
        const { error: transportError } = await supabase
          .from('nhs_transportation_requests')
          .insert(transportationData);

        if (transportError) {
          console.log('Transportation table may not exist:', transportError);
          // Don't fail the main submission if transportation table doesn't exist
        }
      } catch (transportError) {
        console.log('Error handling transportation data:', transportError);
        // Don't fail the main submission if transportation handling fails
      }
    }

    return NextResponse.json({
      message: 'Interest submitted successfully',
      submissionId: data.id
    });

  } catch (error) {
    console.error('Error in volunteer interest API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const { data: submissions, error } = await supabase
      .from('volunteer_interest_submissions')
      .select(`
        *,
        volunteer_events(title)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching volunteer interest submissions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      submissions: submissions || []
    });

  } catch (error) {
    console.error('Error in volunteer interest GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}