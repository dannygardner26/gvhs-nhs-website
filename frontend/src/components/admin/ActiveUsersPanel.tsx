"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Clock } from "lucide-react";

interface CheckedInUser {
  user_id: string;
  checked_in_at: string;
  users: {
    first_name: string;
    last_name: string;
  };
}

interface ActiveUsersPanelProps {
  onForceCheckout?: (userId: string) => void;
}

export function ActiveUsersPanel({ onForceCheckout }: ActiveUsersPanelProps) {
  const [activeUsers, setActiveUsers] = useState<CheckedInUser[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState<string | null>(null);

  const fetchActiveUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkin/active");
      if (response.ok) {
        const usersData = await response.json();
        setActiveUsers(usersData);
      }
    } catch (error) {
      console.error("Error fetching active users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActiveUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update current time every second for duration calculation
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateDuration = (checkedInAt: string) => {
    const checkinTime = new Date(checkedInAt);
    const diffMs = currentTime.getTime() - checkinTime.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleForceCheckout = async (userId: string) => {
    setProcessingCheckout(userId);
    try {
      const response = await fetch('/api/checkin/admin/force-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Force checkout successful:', result);
        // Refresh the active users list
        await fetchActiveUsers();
        if (onForceCheckout) {
          onForceCheckout(userId);
        }
      } else {
        const error = await response.json();
        console.error('Force checkout failed:', error);
        alert(`Failed to checkout user: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during force checkout:', error);
      alert('Failed to checkout user due to network error');
    } finally {
      setProcessingCheckout(null);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users className="w-5 h-5" style={{ color: '#2563eb' }} />
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            Currently in Library ({activeUsers.length})
          </h2>
        </div>
        <Button
          onClick={fetchActiveUsers}
          disabled={loading}
          size="sm"
          variant="outline"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Active Users List */}
      {activeUsers.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activeUsers.map((user) => (
            <div
              key={user.user_id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.25rem'
                }}>
                  <span style={{
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    color: '#1f2937'
                  }}>
                    {user.users.first_name} {user.users.last_name}
                  </span>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#6b7280',
                    marginLeft: '0.5rem'
                  }}>
                    (ID: {user.user_id})
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#16a34a',
                      borderRadius: '50%'
                    }}></div>
                    Active
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  <span>
                    <strong>Checked in:</strong> {formatTime(user.checked_in_at)}
                  </span>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Clock className="w-4 h-4" />
                    <strong>Duration:</strong> {calculateDuration(user.checked_in_at)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleForceCheckout(user.user_id)}
                disabled={processingCheckout === user.user_id}
                size="sm"
                variant="destructive"
                style={{ marginLeft: '1rem' }}
              >
                <LogOut className="w-4 h-4 mr-1" />
                {processingCheckout === user.user_id ? 'Checking out...' : 'Force Checkout'}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          border: '2px dashed #d1d5db'
        }}>
          <Users className="w-12 h-12" style={{
            color: '#9ca3af',
            margin: '0 auto 0.75rem auto'
          }} />
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#6b7280',
            marginBottom: '0.5rem'
          }}>
            No students in library
          </h3>
          <p style={{
            color: '#9ca3af',
            fontSize: '0.875rem',
            margin: 0
          }}>
            Students will appear here when they check in.
          </p>
        </div>
      )}
    </div>
  );
}