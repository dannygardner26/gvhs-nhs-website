// Organization & Event Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  color: string;
  contact_email?: string;
  website?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  event_count?: number;
  events?: VolunteerEvent[];
}

export interface VolunteerEvent {
  id: string;
  organization_id: string;
  organization?: Organization;
  title: string;
  description: string;
  location: string;
  event_date: string;
  start_time: string;
  end_time: string;
  spots_available?: number;
  spots_filled: number;
  requirements?: string[];
  is_active: boolean;
  created_at: string;
}

export interface EventSignup {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  status: 'confirmed' | 'cancelled' | 'waitlisted' | 'attended' | 'no_show';
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  color: string;
  extendedProps: {
    organization: string;
    organizationId: string;
    location: string;
    spotsAvailable?: number;
    spotsFilled: number;
    description: string;
  };
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  is_pinned: boolean;
  created_by: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

// Monthly Service Types
export interface MonthlyServiceSubmission {
  id: string;
  user_id: string;
  user_name: string;
  month: string; // Format: "2024-12"
  description: string;
  status: 'submitted' | 'approved' | 'flagged';
  admin_notes?: string;
  student_feedback?: string; // Feedback visible to the student
  reviewed_by?: string;
  reviewed_at?: string;
  resubmitted_at?: string; // When a previously reviewed submission was resubmitted
  created_at: string;
}

// Independent Service Project Types
export interface IndependentProject {
  id: string;
  user_id: string;
  user_name: string;
  project_title: string;
  project_description: string;
  start_date: string;
  expected_end_date?: string;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  checkins?: ISPCheckin[];
}

export interface ISPCheckin {
  id: string;
  project_id: string;
  semester: string; // Format: "2024-Fall" or "2025-Spring"
  progress_update: string;
  status: 'submitted' | 'approved' | 'flagged';
  admin_notes?: string;
  student_feedback?: string; // Feedback visible to the student
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

// Form input types
export interface CreateOrganizationInput {
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  color: string;
  contact_email?: string;
  website?: string;
}

export interface CreateEventInput {
  organization_id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  start_time: string;
  end_time: string;
  spots_available?: number;
  requirements?: string[];
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  is_pinned?: boolean;
  created_by: string;
  expires_at?: string;
}

export interface CreateMonthlyServiceInput {
  month: string;
  description: string;
}

export interface CreateISPInput {
  project_title: string;
  project_description: string;
  start_date: string;
  expected_end_date?: string;
}

export interface CreateISPCheckinInput {
  quarter: string;
  progress_update: string;
}
