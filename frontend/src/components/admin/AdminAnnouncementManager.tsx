"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bell, Plus, Edit, Trash2, Pin, AlertTriangle, Info, X, Link } from 'lucide-react';
import type { Announcement, CreateAnnouncementInput } from '@/lib/types';

const priorityOptions = [
  { value: 'normal', label: 'Normal', icon: Info, color: 'bg-blue-100 text-blue-700' },
  { value: 'important', label: 'Important', icon: Bell, color: 'bg-amber-100 text-amber-700' },
  { value: 'urgent', label: 'Urgent', icon: AlertTriangle, color: 'bg-red-100 text-red-700' }
];

export function AdminAnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState<CreateAnnouncementInput>({
    title: '',
    content: '',
    priority: 'normal',
    is_pinned: false,
    created_by: 'admin',
    expires_at: '',
    link_url: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements?include_inactive=true');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setMessage('Title and content are required');
      return;
    }

    try {
      const payload = {
        ...form,
        expires_at: form.expires_at || null,
        ...(editingAnnouncement && { id: editingAnnouncement.id })
      };

      const response = await fetch(
        '/api/announcements',
        {
          method: editingAnnouncement ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        setMessage(editingAnnouncement ? 'Announcement updated!' : 'Announcement created!');
        setShowForm(false);
        setEditingAnnouncement(null);
        setForm({ title: '', content: '', priority: 'normal', is_pinned: false, created_by: 'admin', expires_at: '', link_url: '' });
        fetchAnnouncements();
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to save announcement');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      setMessage('Error saving announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;

    try {
      const response = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage('Announcement deleted');
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setForm({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      is_pinned: announcement.is_pinned,
      created_by: announcement.created_by,
      expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : '',
      link_url: announcement.link_url || ''
    });
    setShowForm(true);
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: announcement.id, is_active: !announcement.is_active })
      });

      if (response.ok) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error toggling announcement:', error);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorityOptions.find(p => p.value === priority) || priorityOptions[0];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading announcements...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Announcements
        </h2>
        <Button onClick={() => { setShowForm(true); setEditingAnnouncement(null); setForm({ title: '', content: '', priority: 'normal', is_pinned: false, created_by: 'admin', expires_at: '', link_url: '' }); }}>
          <Plus className="h-4 w-4 mr-1" /> New Announcement
        </Button>
      </div>

      {message && (
        <p className={`text-sm ${message.includes('Error') || message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setEditingAnnouncement(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Important NHS Update"
              />
            </div>
            <div>
              <Label>Content *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your announcement message..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <div className="flex gap-2 mt-1">
                  {priorityOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm({ ...form, priority: option.value as 'normal' | 'important' | 'urgent' })}
                      className={`px-3 py-1.5 text-sm rounded-full border ${
                        form.priority === option.value
                          ? option.color + ' border-current'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Expires (optional)</Label>
                <Input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Link URL (optional)</Label>
              <div className="relative mt-1">
                <Input
                  value={form.link_url || ''}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://example.com"
                  className="pl-9"
                />
                <Link className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Add a clickable link to the announcement</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinned"
                checked={form.is_pinned}
                onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="pinned" className="cursor-pointer flex items-center gap-1">
                <Pin className="h-4 w-4" /> Pin to top
              </Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>{editingAnnouncement ? 'Update' : 'Create'}</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingAnnouncement(null); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map(announcement => (
          <Card key={announcement.id} className={!announcement.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{announcement.title}</h3>
                    {announcement.is_pinned && <Pin className="h-4 w-4 text-amber-500" />}
                    {getPriorityBadge(announcement.priority)}
                    {!announcement.is_active && (
                      <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-500">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{announcement.content}</p>
                  {announcement.link_url && (
                    <a
                      href={announcement.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-2"
                    >
                      <Link className="h-3 w-3" />
                      {announcement.link_url}
                    </a>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Created: {new Date(announcement.created_at).toLocaleDateString()}</span>
                    {announcement.expires_at && (
                      <span>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleToggleActive(announcement)}>
                    {announcement.is_active ? 'Hide' : 'Show'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(announcement)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(announcement.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No announcements yet. Click &quot;New Announcement&quot; to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
