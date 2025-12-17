"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, AlertTriangle, Info, Pin, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
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
  const { user, isAuthenticated } = useAuth();

  // Track which announcements have been marked as read this session
  const markedAsReadRef = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());

  // Mark an announcement as read when it becomes visible
  const markAsRead = useCallback(async (announcementId: string) => {
    if (!isAuthenticated || !user || markedAsReadRef.current.has(announcementId)) {
      return;
    }

    // Mark as read immediately to prevent duplicate calls
    markedAsReadRef.current.add(announcementId);

    try {
      await fetch(`/api/announcements/${announcementId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.userId,
          user_name: `${user.firstName} ${user.lastName}`.trim() || user.username
        })
      });
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      // Remove from set so it can be retried
      markedAsReadRef.current.delete(announcementId);
    }
  }, [isAuthenticated, user]);

  // Set up IntersectionObserver
  useEffect(() => {
    if (!isAuthenticated) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const announcementId = entry.target.getAttribute('data-announcement-id');
            if (announcementId) {
              markAsRead(announcementId);
            }
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the card is visible
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isAuthenticated, markAsRead]);

  // Observe cards when they're added to the map
  useEffect(() => {
    if (!observerRef.current || !isAuthenticated) return;

    cardRefsMap.current.forEach((card) => {
      observerRef.current?.observe(card);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [announcements, isAuthenticated, isExpanded]);

  // Callback ref to register announcement cards for observation
  const setCardRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      cardRefsMap.current.set(id, el);
      observerRef.current?.observe(el);
    } else {
      const existingEl = cardRefsMap.current.get(id);
      if (existingEl) {
        observerRef.current?.unobserve(existingEl);
      }
      cardRefsMap.current.delete(id);
    }
  }, []);

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
              <div
                key={announcement.id}
                ref={setCardRef(announcement.id)}
                data-announcement-id={announcement.id}
              >
              <Card
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
                      {announcement.link_url && (
                        <a
                          href={announcement.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 text-sm mt-2 ${config.textColor} hover:underline font-medium`}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Learn more
                        </a>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            );
          })}

          {/* Regular announcements */}
          {regularAnnouncements.map(announcement => {
            const config = priorityConfig[announcement.priority];
            const Icon = config.icon;

            return (
              <div
                key={announcement.id}
                ref={setCardRef(announcement.id)}
                data-announcement-id={announcement.id}
              >
              <Card
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
                      {announcement.link_url && (
                        <a
                          href={announcement.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 text-sm mt-2 ${config.textColor} hover:underline font-medium`}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Learn more
                        </a>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
