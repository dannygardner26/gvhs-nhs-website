import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mock NHS Elementary visits data for admin view
const mockNHSElementaryData = {
  students: [
    {
      id: '1',
      submissionId: 'sub_001',
      nhsUserId: '123456',
      name: 'Emily Chen',
      email: 'emily.chen@student.gvsd.org',
      school: 'charlestown',
      teacherLastName: 'Johnson',
      emergencyContact: 'Mrs. Chen (555) 123-4567',
      emergencyPhone: '(555) 123-4567',
      rideStatus: 'available-to-drive',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      submissionId: 'sub_002',
      nhsUserId: '789012',
      name: 'Marcus Johnson',
      email: 'marcus.johnson@student.gvsd.org',
      school: 'sugartown',
      teacherLastName: 'Davis',
      emergencyContact: 'Mr. Johnson Sr. (555) 234-5678',
      emergencyPhone: '(555) 234-5678',
      rideStatus: 'available-to-drive',
      createdAt: '2024-01-15T11:15:00Z'
    },
    {
      id: '3',
      submissionId: 'sub_003',
      nhsUserId: '345678',
      name: 'Sarah Martinez',
      email: 'sarah.martinez@student.gvsd.org',
      school: 'general-wayne',
      teacherLastName: 'Wilson',
      emergencyContact: 'Mrs. Martinez (555) 345-6789',
      emergencyPhone: '(555) 345-6789',
      rideStatus: 'needs-ride',
      createdAt: '2024-01-15T12:00:00Z'
    },
    {
      id: '4',
      submissionId: 'sub_004',
      nhsUserId: '901234',
      name: 'Alex Kim',
      email: 'alex.kim@student.gvsd.org',
      school: 'kd-markley',
      teacherLastName: 'Brown',
      emergencyContact: 'Dr. Kim (555) 456-7890',
      emergencyPhone: '(555) 456-7890',
      rideStatus: 'has-own-ride',
      createdAt: '2024-01-15T12:30:00Z'
    },
    {
      id: '5',
      submissionId: 'sub_005',
      nhsUserId: '567890',
      name: 'Jamie Lopez',
      email: 'jamie.lopez@student.gvsd.org',
      school: 'charlestown',
      teacherLastName: 'Garcia',
      emergencyContact: 'Ms. Lopez (555) 567-8901',
      emergencyPhone: '(555) 567-8901',
      rideStatus: 'needs-ride',
      createdAt: '2024-01-15T13:00:00Z'
    }
  ]
};

// GET /api/admin/nhs-elementary-visits - Get all NHS elementary visit registrations for admin management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolFilter = searchParams.get('school');
    const rideStatusFilter = searchParams.get('rideStatus');

    try {
      // Try to get data from database
      const { data: nhsElementarySubmissions, error } = await supabase
        .from('volunteer_interest_submissions')
        .select(`
          *,
          nhs_transportation_requests(*)
        `)
        .eq('event_id', 'nhs-elementary')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('NHS Elementary table not available, using mock data:', error);
        return getMockNHSElementaryData(schoolFilter, rideStatusFilter);
      }

      // Process real data
      const students: any[] = [];

      nhsElementarySubmissions?.forEach(submission => {
        const transportation = submission.nhs_transportation_requests?.[0];

        // Determine ride status
        let rideStatus = 'has-own-ride';
        if (transportation) {
          if (transportation.is_driver) {
            rideStatus = 'available-to-drive';
          } else {
            rideStatus = 'needs-ride';
          }
        }

        students.push({
          id: submission.id,
          submissionId: submission.id,
          nhsUserId: submission.nhs_user_id,
          name: submission.name || 'Unknown',
          email: submission.email || '',
          school: submission.preferred_school || 'no-preference',
          teacherLastName: submission.teacher_last_name || '',
          emergencyContact: submission.emergency_contact || '',
          emergencyPhone: submission.emergency_phone || '',
          rideStatus,
          createdAt: submission.created_at
        });
      });

      // Apply filters
      let filteredStudents = students;

      if (schoolFilter && schoolFilter !== 'all') {
        filteredStudents = students.filter(s => s.school === schoolFilter);
      }

      if (rideStatusFilter && rideStatusFilter !== 'all') {
        filteredStudents = filteredStudents.filter(s => s.rideStatus === rideStatusFilter);
      }

      const responseData = {
        students: filteredStudents,
        summary: {
          totalStudents: students.length,
          bySchool: {
            charlestown: countByField(students, 'school', 'charlestown'),
            sugartown: countByField(students, 'school', 'sugartown'),
            'general-wayne': countByField(students, 'school', 'general-wayne'),
            'kd-markley': countByField(students, 'school', 'kd-markley'),
            'no-preference': countByField(students, 'school', 'no-preference')
          },
          byRideStatus: {
            'available-to-drive': countByField(students, 'rideStatus', 'available-to-drive'),
            'has-own-ride': countByField(students, 'rideStatus', 'has-own-ride'),
            'needs-ride': countByField(students, 'rideStatus', 'needs-ride')
          }
        }
      };

      return NextResponse.json(responseData);

    } catch (dbError) {
      console.log('Database connection error, using mock data:', dbError);
      return getMockNHSElementaryData(schoolFilter, rideStatusFilter);
    }

  } catch (error) {
    console.error('Error in NHS elementary visits API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getMockNHSElementaryData(schoolFilter?: string | null, rideStatusFilter?: string | null) {
  let { students } = mockNHSElementaryData;

  // Apply school filter
  if (schoolFilter && schoolFilter !== 'all') {
    students = students.filter(s => s.school === schoolFilter);
  }

  // Apply ride status filter
  if (rideStatusFilter && rideStatusFilter !== 'all') {
    students = students.filter(s => s.rideStatus === rideStatusFilter);
  }

  return NextResponse.json({
    students,
    summary: {
      totalStudents: mockNHSElementaryData.students.length,
      bySchool: {
        charlestown: countByField(mockNHSElementaryData.students, 'school', 'charlestown'),
        sugartown: countByField(mockNHSElementaryData.students, 'school', 'sugartown'),
        'general-wayne': countByField(mockNHSElementaryData.students, 'school', 'general-wayne'),
        'kd-markley': countByField(mockNHSElementaryData.students, 'school', 'kd-markley'),
        'no-preference': countByField(mockNHSElementaryData.students, 'school', 'no-preference')
      },
      byRideStatus: {
        'available-to-drive': countByField(mockNHSElementaryData.students, 'rideStatus', 'available-to-drive'),
        'has-own-ride': countByField(mockNHSElementaryData.students, 'rideStatus', 'has-own-ride'),
        'needs-ride': countByField(mockNHSElementaryData.students, 'rideStatus', 'needs-ride')
      }
    },
    note: 'Using mock data - database not available'
  });
}

function countByField(items: any[], field: string, value: string): number {
  return items.filter(item => item[field] === value).length;
}