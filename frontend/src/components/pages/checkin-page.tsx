"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, UserX, Users, AlertCircle, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function CheckinPage() {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'missed_checkin' | 'forgot_checkout' | 'other'>('missed_checkin');
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    // Check if user already has stored credentials using consistent key
    const storedUserId = localStorage.getItem("checkin_userId");
    const storedUsername = localStorage.getItem("checkin_username");

    let statusInterval: NodeJS.Timeout | null = null;

    if (storedUserId && storedUsername) {
      setUserId(storedUserId);
      setUsername(storedUsername);
      setIsRegistered(true);
      checkUserStatus(storedUserId, true); // Show message on initial load

      // Set up real-time polling for check-in status (every 5 seconds)
      statusInterval = setInterval(() => {
        checkUserStatus(storedUserId); // Silent polling - no message
        fetchCurrentCount();
      }, 5000);

      // Also re-fetch when window gains focus (e.g., user navigates back)
      const handleFocus = () => {
        checkUserStatus(storedUserId);
        fetchCurrentCount();
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        if (statusInterval) clearInterval(statusInterval);
        window.removeEventListener('focus', handleFocus);
      };
    }

    fetchCurrentCount();

    // Auto logout at specific times (period changes)
    checkAutoLogout();
    const autoLogoutInterval = setInterval(checkAutoLogout, 60000); // Check every minute

    return () => {
      if (statusInterval) clearInterval(statusInterval);
      clearInterval(autoLogoutInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAutoLogout = () => {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    // Period change times (converted to HHMM format)
    const logoutTimes = [839, 931, 1025, 1115, 1245, 1337, 1430]; // 8:39 AM, 9:31 AM, etc.

    const shouldLogout = logoutTimes.some(time => {
      // Check if current time is within 1 minute of logout time
      return Math.abs(currentTime - time) <= 1;
    });

    if (shouldLogout && isCheckedIn) {
      handleAutoLogout();
    }
  };

  const handleAutoLogout = async () => {
    if (userId) {
      try {
        await fetch("/api/checkin/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });
        setIsCheckedIn(false);
        setMessage("Automatically checked out for period change.");
        fetchCurrentCount();
      } catch (error) {
        console.error("Auto logout error:", error);
      }
    }
  };

  const generateUserId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleRegister = () => {
    if (!username.trim()) {
      setMessage("Please enter a username.");
      return;
    }

    const newUserId = generateUserId();
    setUserId(newUserId);
    setIsRegistered(true);

    // Store in localStorage with consistent keys
    localStorage.setItem("checkin_userId", newUserId);
    localStorage.setItem("checkin_username", username);

    console.log("User registered and saved:", username, "with ID:", newUserId);
    setMessage(`Registered! Your User ID is ${newUserId}. You'll be automatically logged in next time.`);
  };

  const checkUserStatus = async (id: string, showMessage = false) => {
    try {
      const response = await fetch(`/api/checkin/status/${id}`);
      if (response.ok) {
        const data = await response.json();
        setIsCheckedIn(data.isCheckedIn);
        if (showMessage && data.isCheckedIn) {
          setMessage("You are currently checked in.");
        }
      }
    } catch (error) {
      console.error("Error checking user status:", error);
    }
  };

  const fetchCurrentCount = async () => {
    try {
      const response = await fetch("/api/checkin/count");
      if (response.ok) {
        const data = await response.json();
        setCurrentCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  };

  const handleCheckin = async () => {
    if (!userId || !username) return;

    setLoading(true);
    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, username }),
      });

      if (response.ok) {
        setIsCheckedIn(true);
        setMessage("Successfully checked in!");
        fetchCurrentCount();
      } else {
        const data = await response.json();
        setMessage(data.message || "Error checking in");
      }
    } catch {
      setMessage("Error connecting to server");
    }
    setLoading(false);
  };

  const handleCheckout = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch("/api/checkin/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setIsCheckedIn(false);
        setMessage("Successfully checked out!");
        fetchCurrentCount();
      } else {
        const data = await response.json();
        setMessage(data.message || "Error checking out");
      }
    } catch {
      setMessage("Error connecting to server");
    }
    setLoading(false);
  };

  const handleClearLogin = () => {
    // Clear stored login data
    localStorage.removeItem("checkin_userId");
    localStorage.removeItem("checkin_username");

    // Reset component state
    setUserId("");
    setUsername("");
    setIsRegistered(false);
    setIsCheckedIn(false);
    setMessage("Login cleared. You can now register a new user.");

    console.log("User login data cleared");
  };

  const handleReportIssue = async () => {
    if (!reportDetails.trim()) {
      setMessage("Please provide some details about the issue.");
      return;
    }

    setReportSubmitting(true);
    try {
      const response = await fetch("/api/checkin/report-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          username,
          issueType: reportType,
          details: reportDetails,
        }),
      });

      if (response.ok) {
        setMessage("Issue reported! An admin will review it and adjust your hours if needed.");
        setShowReportModal(false);
        setReportDetails("");
        setReportType('missed_checkin');
      } else {
        const data = await response.json();
        setMessage(data.error || "Error submitting report");
      }
    } catch {
      setMessage("Error connecting to server");
    }
    setReportSubmitting(false);
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-royal-blue text-2xl">
              <Users className="w-6 h-6 mr-2" />
              Library Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Count Display */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-royal-blue">{currentCount}</div>
              <div className="text-gray-600">Students currently in library</div>
            </div>

            {!isRegistered ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Enter your name</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your full name"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleRegister} className="w-full">
                  Generate My User ID
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-600">Welcome back, {username}!</p>
                  <p className="text-sm text-gray-500">Your ID: {userId}</p>
                  <p className="text-xs text-blue-600 mt-1">✓ Automatically logged in</p>
                </div>

                {/* Status Badge */}
                {isCheckedIn && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-green-700 font-medium">✓ You are currently checked in</p>
                    <p className="text-sm text-green-600 mt-1">Click below to check out when you leave</p>
                  </div>
                )}

                {!isCheckedIn ? (
                  <Button
                    onClick={handleCheckin}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    {loading ? "Checking in..." : "Check In"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleCheckout}
                    disabled={loading}
                    variant="destructive"
                    className="w-full"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    {loading ? "Checking out..." : "Check Out"}
                  </Button>
                )}

                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearLogin}
                  >
                    Use Different Account
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReportModal(true)}
                    className="text-amber-600 border-amber-300 hover:bg-amber-50"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Report Issue
                  </Button>
                </div>
              </div>
            )}

            {message && (
              <div className={`p-3 rounded-lg text-center ${
                message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
              }`}>
                {message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReportModal(false)}>
          <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  Report Check-in Issue
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowReportModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Use this form to notify admins if you had an issue with your check-in.
              </p>

              <div>
                <Label>What happened?</Label>
                <div className="space-y-2 mt-2">
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="issueType"
                      checked={reportType === 'missed_checkin'}
                      onChange={() => setReportType('missed_checkin')}
                      className="text-amber-600"
                    />
                    <div>
                      <div className="font-medium text-sm">Missed Check-in</div>
                      <div className="text-xs text-gray-500">I was in the library but forgot to check in</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="issueType"
                      checked={reportType === 'forgot_checkout'}
                      onChange={() => setReportType('forgot_checkout')}
                      className="text-amber-600"
                    />
                    <div>
                      <div className="font-medium text-sm">Forgot to Check Out</div>
                      <div className="text-xs text-gray-500">I left but forgot to check out (time is incorrect)</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="issueType"
                      checked={reportType === 'other'}
                      onChange={() => setReportType('other')}
                      className="text-amber-600"
                    />
                    <div>
                      <div className="font-medium text-sm">Other Issue</div>
                      <div className="text-xs text-gray-500">Something else went wrong</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="reportDetails">
                  Details <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reportDetails"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder={
                    reportType === 'missed_checkin'
                      ? "When were you in the library? (e.g., Period 3, about 45 minutes)"
                      : reportType === 'forgot_checkout'
                      ? "When did you actually leave? (e.g., Left at 2:30 PM but forgot to check out)"
                      : "Please describe the issue..."
                  }
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleReportIssue}
                  disabled={reportSubmitting || !reportDetails.trim()}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {reportSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                An admin will review your report and adjust your hours if needed.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}