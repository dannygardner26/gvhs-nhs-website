"use client";

import React, { useState, useEffect } from "react";

interface CheckedInUser {
  user_id: string;
  checked_in_at: string;
  users: {
    first_name: string;
    last_name: string;
  };
}

export function TutorQueuePage() {
  const [currentCount, setCurrentCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState<CheckedInUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [countResponse, usersResponse] = await Promise.all([
        fetch("/api/checkin/count"),
        fetch("/api/checkin/active")
      ]);

      if (countResponse.ok) {
        const countData = await countResponse.json();
        setCurrentCount(countData.count);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setActiveUsers(usersData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', padding: '2rem', backgroundColor: '#f8fafc' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '2rem'
        }}>
          <h1 style={{
            textAlign: 'center',
            color: '#2563eb',
            fontSize: '2rem',
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            Library Status
          </h1>

          {/* Current Count */}
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: '#2563eb',
            borderRadius: '8px',
            color: 'white',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{currentCount}</div>
            <div style={{ fontSize: '1.2rem' }}>Students in Library</div>
          </div>

          {/* Refresh Button */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <button
              onClick={fetchData}
              disabled={loading}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Names List */}
          {activeUsers.length > 0 && (
            <div style={{
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: '#f9fafb'
            }}>
              <h3 style={{
                color: '#374151',
                fontSize: '1.2rem',
                marginBottom: '1rem',
                fontWeight: 'bold'
              }}>
                Current Students:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeUsers.map((user, index) => (
                  <div
                    key={user.user_id}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      border: '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: '#111827' }}>
                      {index + 1}. {user.users.first_name} {user.users.last_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {currentCount === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#6b7280',
                marginBottom: '0.5rem'
              }}>
                No students in library
              </h3>
              <p style={{ color: '#9ca3af' }}>
                Students will appear here when they check in.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}