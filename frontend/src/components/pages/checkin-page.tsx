"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, UserX, Users } from "lucide-react";

export function CheckinPage() {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check if user already has stored credentials
    const storedUserId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("username");

    if (storedUserId && storedUsername) {
      setUserId(storedUserId);
      setUsername(storedUsername);
      setIsRegistered(true);
      checkUserStatus(storedUserId);
    }

    fetchCurrentCount();

    // Auto logout at specific times (period changes)
    checkAutoLogout();
    const interval = setInterval(checkAutoLogout, 60000); // Check every minute

    return () => clearInterval(interval);
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
        await fetch("http://localhost:3001/api/checkin/checkout", {
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

    // Store in localStorage
    localStorage.setItem("userId", newUserId);
    localStorage.setItem("username", username);

    setMessage(`Your User ID is ${newUserId}. Please save this ID for future use.`);
  };

  const checkUserStatus = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/checkin/status/${id}`);
      if (response.ok) {
        const data = await response.json();
        setIsCheckedIn(data.isCheckedIn);
      }
    } catch (error) {
      console.error("Error checking user status:", error);
    }
  };

  const fetchCurrentCount = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/checkin/count");
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
      const response = await fetch("http://localhost:3001/api/checkin", {
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
    } catch (error) {
      setMessage("Error connecting to server");
    }
    setLoading(false);
  };

  const handleCheckout = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/checkin/checkout", {
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
    } catch (error) {
      setMessage("Error connecting to server");
    }
    setLoading(false);
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
                  <p className="text-gray-600">Welcome, {username}!</p>
                  <p className="text-sm text-gray-500">Your ID: {userId}</p>
                </div>

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

                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem("userId");
                      localStorage.removeItem("username");
                      setIsRegistered(false);
                      setUserId("");
                      setUsername("");
                      setIsCheckedIn(false);
                      setMessage("");
                    }}
                  >
                    Use Different Account
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
    </div>
  );
}