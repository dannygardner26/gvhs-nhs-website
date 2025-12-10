"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Users, Clock, LogOut, Key, ChevronDown, ChevronUp, Lightbulb, Trash2, AlertTriangle } from "lucide-react";
import { UserCard } from "@/components/admin/UserCard";

// Admin PIN - change this to your desired admin PIN
const ADMIN_PIN = "123456";

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  isCheckedIn: boolean;
  checkedInAt: string | null;
  createdAt: string;
}

interface Session {
  userId: string;
  username: string;
  checkedInAt: string;
  checkedOutAt: string;
  duration: number;
  forcedByAdmin?: boolean;
}

interface TotalHours {
  userId: string;
  totalSessions: number;
  totalMilliseconds: number;
  totalHours: string;
}

export function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [nhsUserId, setNhsUserId] = useState("");
  const [authError, setAuthError] = useState("");
  const [opportunitySuggestions, setOpportunitySuggestions] = useState([]);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userSessions, setUserSessions] = useState<Record<string, Session[]>>({});
  const [userHours, setUserHours] = useState<Record<string, TotalHours>>({});

  const [changingPinUserId, setChangingPinUserId] = useState<string | null>(null);
  const [newUserId, setNewUserId] = useState("");

  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const handleAuth = () => {
    if (!nhsUserId) {
      setAuthError("Please enter the admin PIN");
      return;
    }

    if (nhsUserId !== ADMIN_PIN) {
      setAuthError("Invalid admin PIN");
      return;
    }

    setIsAuthenticated(true);
    setAuthError("");
    fetchUsers();
    fetchOpportunitySuggestions();
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkin/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setMessage("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("Error connecting to server");
    }
    setLoading(false);
  };

  const fetchOpportunitySuggestions = async () => {
    try {
      const response = await fetch("/api/opportunity-suggestions");
      if (response.ok) {
        const data = await response.json();
        setOpportunitySuggestions(data.suggestions);
      } else {
        console.error("Failed to fetch opportunity suggestions");
      }
    } catch (error) {
      console.error("Error fetching opportunity suggestions:", error);
    }
  };

  const fetchUserSessions = async (userId: string) => {
    try {
      const response = await fetch(`/api/checkin/admin/session-history/${userId}`);
      if (response.ok) {
        const sessions = await response.json();
        setUserSessions(prev => ({ ...prev, [userId]: sessions }));
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchUserHours = async (userId: string) => {
    try {
      const response = await fetch(`/api/checkin/admin/total-hours/${userId}`);
      if (response.ok) {
        const hours = await response.json();
        setUserHours(prev => ({ ...prev, [userId]: hours }));
      }
    } catch (error) {
      console.error("Error fetching hours:", error);
    }
  };

  const toggleUserExpand = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
      if (!userSessions[userId]) {
        await fetchUserSessions(userId);
      }
      if (!userHours[userId]) {
        await fetchUserHours(userId);
      }
    }
  };

  const handleForceCheckout = async (userId: string, username: string) => {
    if (!confirm(`Force checkout ${username}?`)) return;

    try {
      const response = await fetch("/api/checkin/admin/force-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setMessage(`Successfully checked out ${username}`);
        fetchUsers();
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to checkout user");
      }
    } catch (error) {
      console.error("Error checking out user:", error);
      setMessage("Error connecting to server");
    }
  };

  const handleChangePin = async (oldUserId: string, username: string) => {
    if (!newUserId.trim()) {
      setMessage("Please enter a new User ID");
      return;
    }

    try {
      const response = await fetch("/api/checkin/admin/change-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: oldUserId, newUserId: newUserId.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully changed User ID for ${username}`);
        setChangingPinUserId(null);
        setNewUserId("");
        fetchUsers();
      } else {
        setMessage(data.error || "Failed to change User ID");
      }
    } catch (error) {
      console.error("Error changing PIN:", error);
      setMessage("Error connecting to server");
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    setDeletingUserId(userId);
    try {
      const response = await fetch("/api/checkin/admin/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully deleted user ${username} (${userId}) from all systems`);
        setDeleteConfirmUserId(null);
        // Remove user from local state immediately
        setUsers(prev => prev.filter(user => user.userId !== userId));
        // Clear any expanded data for this user
        if (expandedUserId === userId) {
          setExpandedUserId(null);
        }
        setUserSessions(prev => {
          const newSessions = { ...prev };
          delete newSessions[userId];
          return newSessions;
        });
        setUserHours(prev => {
          const newHours = { ...prev };
          delete newHours[userId];
          return newHours;
        });
      } else {
        setMessage(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setMessage("Error connecting to server");
    }
    setDeletingUserId(null);
  };

  const formatDuration = (milliseconds: number) => {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen overflow-hidden flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center text-royal-blue text-2xl">
                <Shield className="w-6 h-6 mr-2" />
                Admin Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nhsUserId">Enter Admin PIN</Label>
                <Input
                  id="nhsUserId"
                  type="password"
                  value={nhsUserId}
                  onChange={(e) => setNhsUserId(e.target.value)}
                  placeholder="Enter admin PIN"
                  className="mt-2 text-center"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                />
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Enter the admin PIN to access admin features
                </p>
              </div>

              <Button onClick={handleAuth} className="w-full bg-blue-600 hover:bg-blue-700">
                Access Admin Panel
              </Button>

              {authError && (
                <div className="p-3 rounded-lg text-center bg-red-50 text-red-700">
                  {authError}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-royal-blue flex items-center">
            <Shield className="w-8 h-8 mr-2" />
            NHS Admin Panel
          </h1>
          <Button onClick={() => setIsAuthenticated(false)} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.includes("Error") || message.includes("Failed")
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}>
            {message}
          </div>
        )}

        {/* Opportunity Suggestions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Volunteer Opportunity Suggestions ({opportunitySuggestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {opportunitySuggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No suggestions submitted yet</div>
            ) : (
              <div className="space-y-4">
                {opportunitySuggestions.map((suggestion: any) => (
                  <div key={suggestion.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{suggestion.opportunity_title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        suggestion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        suggestion.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {suggestion.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{suggestion.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Submitted by:</span> {suggestion.nhs_user_id}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Submitted:</span> {formatDateTime(suggestion.created_at)}
                      </div>
                      {suggestion.organization_name && (
                        <div>
                          <span className="font-medium text-gray-700">Organization:</span> {suggestion.organization_name}
                        </div>
                      )}
                      {suggestion.estimated_hours && (
                        <div>
                          <span className="font-medium text-gray-700">Estimated Hours:</span> {suggestion.estimated_hours}
                        </div>
                      )}
                      {suggestion.contact_info && (
                        <div>
                          <span className="font-medium text-gray-700">Contact:</span> {suggestion.contact_info}
                        </div>
                      )}
                      {suggestion.preferred_location && (
                        <div>
                          <span className="font-medium text-gray-700">Location:</span> {suggestion.preferred_location}
                        </div>
                      )}
                    </div>
                    {suggestion.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              All Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No users registered yet</div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => {
                  const userId = user.user_id || user.userId; // Use database field name
                  return (
                    <UserCard
                      key={userId}
                      user={user}
                      onForceCheckout={handleForceCheckout}
                      onChangePin={handleChangePin}
                      onDeleteUser={handleDeleteUser}
                      onToggleExpand={toggleUserExpand}
                      isExpanded={expandedUserId === userId}
                      userSessions={userSessions[userId] || []}
                      userHours={userHours[userId]}
                      formatDateTime={formatDateTime}
                      formatDuration={formatDuration}
                      isDeleting={deletingUserId === userId}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
