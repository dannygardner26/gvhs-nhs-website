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
  link_url?: string;
  is_active: boolean;
  is_archived: boolean;
  archived_at?: string;
  created_at: string;
  read_count?: number;
}

export interface AnnouncementReadReceipt {
  id: string;
  announcement_id: string;
  user_id: string;
  user_name?: string;
  read_at: string;
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
  link_url?: string;
}
