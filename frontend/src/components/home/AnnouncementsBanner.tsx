"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, AlertTriangle, Info, Pin, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Announcement } from '@/lib/types';

const priorityConfig = {
  normal: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500'
  },
  important: {
    icon: Bell,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    iconColor: 'text-amber-500'
  },
  urgent: {
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500'
  }
};

export function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements');
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

  if (isLoading) {
    return null;
  }

  if (announcements.length === 0) {
    return null;
  }

  // Separate pinned and regular announcements
  const pinnedAnnouncements = announcements.filter(a => a.is_pinned);
  const regularAnnouncements = announcements.filter(a => !a.is_pinned);

  return (
    <div className="space-y-3 mb-6">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-royal-blue" />
          Announcements
          {announcements.length > 0 && (
            <span className="text-sm font-normal text-gray-500">
              ({announcements.length})
            </span>
          )}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-2">
          {/* Pinned announcements first */}
          {pinnedAnnouncements.map(announcement => {
            const config = priorityConfig[announcement.priority];
            const Icon = config.icon;

            return (
              <Card
                key={announcement.id}
                className={`${config.bgColor} ${config.borderColor} border`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${config.textColor}`}>
                          {announcement.title}
                        </h3>
                        <Pin className={`h-3 w-3 ${config.iconColor}`} />
                      </div>
                      <p className={`text-sm mt-1 ${config.textColor} opacity-90`}>
                        {announcement.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Regular announcements */}
          {regularAnnouncements.map(announcement => {
            const config = priorityConfig[announcement.priority];
            const Icon = config.icon;

            return (
              <Card
                key={announcement.id}
                className={`${config.bgColor} ${config.borderColor} border`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${config.textColor}`}>
                        {announcement.title}
                      </h3>
                      <p className={`text-sm mt-1 ${config.textColor} opacity-90`}>
                        {announcement.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
