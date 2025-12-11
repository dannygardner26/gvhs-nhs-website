"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Edit, Trash2, Save, X } from "lucide-react";

interface VolunteerEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  date: string;
  icon: string;
  category: string;
  spots?: number;
  requirements: string[];
  contact_type: string;
  contact_info?: string;
  contact_label?: string;
  signup_link?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

interface NewEventForm {
  title: string;
  description: string;
  location: string;
  duration: string;
  date: string;
  icon: string;
  category: string;
  spots: string;
  requirements: string;
  contactType: string;
  contactInfo: string;
  contactLabel: string;
  signupLink: string;
}

const initialFormState: NewEventForm = {
  title: "",
  description: "",
  location: "",
  duration: "",
  date: "",
  icon: "heart",
  category: "community",
  spots: "",
  requirements: "",
  contactType: "email",
  contactInfo: "",
  contactLabel: "",
  signupLink: ""
};

export function AdminEventManager() {
  const [events, setEvents] = useState<VolunteerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<VolunteerEvent | null>(null);
  const [formData, setFormData] = useState<NewEventForm>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/volunteer-events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      } else {
        setMessage("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setMessage("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.location || !formData.duration || !formData.date) {
      setMessage("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const requirements = formData.requirements.split('\n').filter(req => req.trim() !== '');

      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        duration: formData.duration,
        date: formData.date,
        icon: formData.icon,
        category: formData.category,
        spots: formData.spots ? parseInt(formData.spots) : null,
        requirements,
        contactType: formData.contactType,
        contactInfo: formData.contactInfo || null,
        contactLabel: formData.contactLabel || null,
        signupLink: formData.signupLink || null
      };

      const url = editingEvent
        ? `/api/admin/volunteer-events/${editingEvent.id}`
        : "/api/admin/volunteer-events";

      const method = editingEvent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage(editingEvent ? "Event updated successfully!" : "Event created successfully!");
        setShowForm(false);
        setEditingEvent(null);
        setFormData(initialFormState);
        fetchEvents();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to save event");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      setMessage("Error connecting to server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event: VolunteerEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      duration: event.duration,
      date: event.date,
      icon: event.icon,
      category: event.category,
      spots: event.spots?.toString() || "",
      requirements: event.requirements.join('\n'),
      contactType: event.contact_type,
      contactInfo: event.contact_info || "",
      contactLabel: event.contact_label || "",
      signupLink: event.signup_link || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/volunteer-events/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage("Event deleted successfully!");
        fetchEvents();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      setMessage("Error connecting to server");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData(initialFormState);
    setMessage("");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-royal-blue" />
            Volunteer Events Management ({events.length})
          </CardTitle>
          <Button onClick={() => setShowForm(true)} disabled={showForm}>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.includes("Error") || message.includes("Failed")
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}>
            {message}
          </div>
        )}

        {/* Add/Edit Event Form */}
        {showForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">
              {editingEvent ? "Edit Event" : "Add New Event"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Event title"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="community">Community</option>
                    <option value="social-media">Social Media</option>
                    <option value="tutoring">Tutoring</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Event description"
                  rows={3}
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Event location"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 2-3 hours"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Schedule *</Label>
                  <Input
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    placeholder="e.g., Weekly, Monthly"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="spots">Available Spots</Label>
                  <Input
                    id="spots"
                    type="number"
                    value={formData.spots}
                    onChange={(e) => setFormData(prev => ({ ...prev, spots: e.target.value }))}
                    placeholder="Number of spots"
                    className="mt-1"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="contactType">Contact Type *</Label>
                  <select
                    id="contactType"
                    value={formData.contactType}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactType: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="email">Email</option>
                    <option value="link">External Link</option>
                    <option value="signup">Signup Form</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactInfo">Contact Info</Label>
                  <Input
                    id="contactInfo"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                    placeholder="Email or URL"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contactLabel">Contact Label</Label>
                  <Input
                    id="contactLabel"
                    value={formData.contactLabel}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactLabel: e.target.value }))}
                    placeholder="Button text"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Requirements (one per line)</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="Background check required&#10;Training session attendance&#10;Reliable transportation"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {submitting ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="text-center py-8">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No events created yet</div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">{event.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Location:</span> {event.location}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span> {event.duration}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Schedule:</span> {event.date}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Category:</span> {event.category}
                  </div>
                  {event.spots && (
                    <div>
                      <span className="font-medium text-gray-700">Spots:</span> {event.spots}
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Contact:</span> {event.contact_type}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created:</span> {formatDateTime(event.created_at)}
                  </div>
                  {event.updated_at && (
                    <div>
                      <span className="font-medium text-gray-700">Updated:</span> {formatDateTime(event.updated_at)}
                    </div>
                  )}
                </div>
                {event.requirements.length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium text-gray-700 text-sm">Requirements:</span>
                    <ul className="text-sm text-gray-600 ml-4 list-disc">
                      {event.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}