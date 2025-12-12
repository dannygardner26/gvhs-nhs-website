"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Building2, Plus, Edit, Trash2, X, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import type { Organization, VolunteerEvent, CreateEventInput } from '@/lib/types';

const ICON_OPTIONS = ['Users', 'Heart', 'BookOpen', 'Monitor', 'Camera', 'Sparkles', 'Building', 'Globe'];
const COLOR_OPTIONS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444', '#14B8A6', '#6366F1'];

export function AdminOrganizationManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOrgForm, setShowOrgForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const [orgForm, setOrgForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon_name: 'Users',
    color: '#3B82F6',
    contact_email: '',
    website: ''
  });

  const [eventForm, setEventForm] = useState<CreateEventInput>({
    organization_id: '',
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    spots_available: 10
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOrg = async () => {
    if (!orgForm.name.trim()) {
      setMessage('Organization name is required');
      return;
    }

    try {
      const slug = orgForm.slug || orgForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const payload = { ...orgForm, slug };

      const response = await fetch(
        editingOrg ? `/api/organizations/${editingOrg.id}` : '/api/organizations',
        {
          method: editingOrg ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        setMessage(editingOrg ? 'Organization updated!' : 'Organization created!');
        setShowOrgForm(false);
        setEditingOrg(null);
        setOrgForm({ name: '', slug: '', description: '', icon_name: 'Users', color: '#3B82F6', contact_email: '', website: '' });
        fetchOrganizations();
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to save organization');
      }
    } catch (error) {
      console.error('Error saving organization:', error);
      setMessage('Error saving organization');
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    try {
      const response = await fetch(`/api/organizations/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage('Organization deleted');
        fetchOrganizations();
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
    }
  };

  const handleEditOrg = (org: Organization) => {
    setEditingOrg(org);
    setOrgForm({
      name: org.name,
      slug: org.slug,
      description: org.description || '',
      icon_name: org.icon_name,
      color: org.color,
      contact_email: org.contact_email || '',
      website: org.website || ''
    });
    setShowOrgForm(true);
  };

  const handleSaveEvent = async (organizationId: string) => {
    if (!eventForm.title.trim() || !eventForm.event_date) {
      setMessage('Event title and date are required');
      return;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eventForm, organization_id: organizationId })
      });

      if (response.ok) {
        setMessage('Event created!');
        setShowEventForm(null);
        setEventForm({
          organization_id: '',
          title: '',
          description: '',
          event_date: '',
          start_time: '',
          end_time: '',
          location: '',
          spots_available: 10
        });
        fetchOrganizations();
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setMessage('Error creating event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Delete this event?')) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage('Event deleted');
        fetchOrganizations();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading organizations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Organizations & Events
        </h2>
        <Button onClick={() => { setShowOrgForm(true); setEditingOrg(null); setOrgForm({ name: '', slug: '', description: '', icon_name: 'Users', color: '#3B82F6', contact_email: '', website: '' }); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Organization
        </Button>
      </div>

      {message && (
        <p className={`text-sm ${message.includes('Error') || message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}

      {/* Organization Form */}
      {showOrgForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{editingOrg ? 'Edit Organization' : 'New Organization'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  placeholder="NHS Elementary Visits"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={orgForm.slug}
                  onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value })}
                  placeholder="nhs-elementary-visits"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={orgForm.description}
                onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                placeholder="Describe this organization..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ICON_OPTIONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setOrgForm({ ...orgForm, icon_name: icon })}
                      className={`px-3 py-1 text-sm rounded ${orgForm.icon_name === icon ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setOrgForm({ ...orgForm, color })}
                      className={`w-8 h-8 rounded-full border-2 ${orgForm.color === color ? 'border-gray-800' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={orgForm.contact_email}
                  onChange={(e) => setOrgForm({ ...orgForm, contact_email: e.target.value })}
                  placeholder="contact@org.com"
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={orgForm.website}
                  onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveOrg}>{editingOrg ? 'Update' : 'Create'}</Button>
              <Button variant="outline" onClick={() => { setShowOrgForm(false); setEditingOrg(null); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organizations List */}
      <div className="space-y-4">
        {organizations.map(org => (
          <Card key={org.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: org.color }}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <p className="text-sm text-gray-500">{org.events?.length || 0} events</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEditOrg(org)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteOrg(org.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedOrg(expandedOrg === org.id ? null : org.id)}
                  >
                    {expandedOrg === org.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedOrg === org.id && (
              <CardContent className="pt-0">
                {org.description && (
                  <p className="text-sm text-gray-600 mb-4">{org.description}</p>
                )}

                {/* Add Event Button */}
                <div className="mb-4">
                  <Button size="sm" variant="outline" onClick={() => setShowEventForm(org.id)}>
                    <Calendar className="h-4 w-4 mr-1" /> Add Event
                  </Button>
                </div>

                {/* Event Form */}
                {showEventForm === org.id && (
                  <div className="p-4 border rounded-lg bg-gray-50 mb-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">New Event</h4>
                      <Button size="sm" variant="ghost" onClick={() => setShowEventForm(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Label>Title *</Label>
                        <Input
                          value={eventForm.title}
                          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                          placeholder="Elementary School Visit"
                        />
                      </div>
                      <div>
                        <Label>Date *</Label>
                        <Input
                          type="date"
                          value={eventForm.event_date}
                          onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={eventForm.location}
                          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                          placeholder="Main Campus"
                        />
                      </div>
                      <div>
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={eventForm.start_time}
                          onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={eventForm.end_time}
                          onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Spots Available</Label>
                        <Input
                          type="number"
                          value={eventForm.spots_available}
                          onChange={(e) => setEventForm({ ...eventForm, spots_available: parseInt(e.target.value) || 10 })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          value={eventForm.description}
                          onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                          placeholder="Event details..."
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleSaveEvent(org.id)}>Create Event</Button>
                  </div>
                )}

                {/* Events List */}
                {org.events && org.events.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-500">Events</h4>
                    {org.events.map((event: VolunteerEvent) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-500">
                            {event.event_date && new Date(event.event_date).toLocaleDateString()}
                            {event.location && ` • ${event.location}`}
                            {event.spots_available && ` • ${event.spots_filled || 0}/${event.spots_available} spots`}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No events yet</p>
                )}
              </CardContent>
            )}
          </Card>
        ))}

        {organizations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No organizations yet. Click &quot;Add Organization&quot; to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
