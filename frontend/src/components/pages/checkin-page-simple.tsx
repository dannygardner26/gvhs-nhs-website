"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, UserX, Users, RefreshCw } from "lucide-react";

export function CheckinPageSimple() {
  const [mode, setMode] = useState<"select" | "existing" | "new">("select"); // select mode, existing user, or new user
  const [userId, setUserId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userIdAvailable, setUserIdAvailable] = useState<boolean | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    // Check if user is remembered in localStorage
    const savedUserId = localStorage.getItem("checkin_userId");
    if (savedUserId) {
      setUserId(savedUserId);
      setMode("existing");
      checkUserStatus(savedUserId);
    }

    fetchCurrentCount();

    // Auto logout at specific times (period changes)
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();

      // Period change times (converted to HHMM format)
      const logoutTimes = [756, 847, 938, 1029, 1116, 1146, 1216, 1250, 1341]; // 7:56 AM, 8:47 AM, 9:38 AM, 10:29 AM, 11:16 AM, 11:46 AM, 12:16 PM, 12:50 PM, 1:41 PM

      const shouldLogout = logoutTimes.some(time => {
        // Check if current time is within 1 minute of logout time
        return Math.abs(currentTime - time) <= 1;
      });

      if (shouldLogout && isCheckedIn) {
        handleAutoLogout();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isCheckedIn]);

  // Debounced user ID availability check for new users
  useEffect(() => {
    if (mode === "new" && userId) {
      const timeoutId = setTimeout(() => {
        checkUserIdAvailability(userId);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setUserIdAvailable(null);
    }
  }, [userId, mode]);


  const checkUserStatus = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/checkin/status/${id}`);
      if (response.ok) {
        const data = await response.json();
        setIsCheckedIn(data.isCheckedIn);
        if (data.isCheckedIn) {
          setMessage("You are currently checked in.");
        }
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

  const checkUserIdAvailability = async (id: string) => {
    if (!id.trim() || id.length < 3) {
      setUserIdAvailable(null);
      return;
    }

    setCheckingAvailability(true);
    try {
      const response = await fetch(`http://localhost:3001/api/checkin/status/${id}`);
      if (response.ok) {
        const data = await response.json();
        // If the user exists, the ID is taken; if no user found, it's available
        setUserIdAvailable(!data.isCheckedIn && !data.checkedInAt ? true : false);
      } else {
        // If 404 or user not found, the ID is likely available
        setUserIdAvailable(true);
      }
    } catch (error) {
      console.error("Error checking user ID availability:", error);
      setUserIdAvailable(null);
    } finally {
      setCheckingAvailability(false);
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

  const handleExistingUserCheckin = async () => {
    if (!userId.trim()) {
      setMessage("Please enter your User ID.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/checkin/verify-and-checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsCheckedIn(true);
        localStorage.setItem("checkin_userId", userId);
        setMessage(`Successfully checked in! Welcome back, ${data.username}.`);
        fetchCurrentCount();
      } else if (data.message && data.message.includes("already checked in")) {
        // User is already checked in, update state to reflect this
        setIsCheckedIn(true);
        localStorage.setItem("checkin_userId", userId);
        setMessage("You are already checked in. Use the button below to check out when you leave.");
      } else {
        setMessage(data.message || "User ID not found. Please check your ID or register as a new user.");
      }
    } catch {
      setMessage("Error connecting to server");
    }
    setLoading(false);
  };

  const handleNewUserRegistration = async () => {
    if (!firstName.trim() || !lastName.trim() || !userId.trim()) {
      setMessage("Please enter first name, last name, and your chosen user ID.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/checkin/register-and-checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          customUserId: userId.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId);
        setIsCheckedIn(true);
        localStorage.setItem("checkin_userId", data.userId);
        setMessage(`Registration successful! Your User ID is ${data.userId}. We'll remember you for next time!`);
        fetchCurrentCount();
      } else {
        setMessage(data.message || "Error creating user. Please try again.");
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
    } catch {
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

{mode === "select" ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-gray-600">How would you like to check in?</p>
                </div>

                <Button
                  onClick={() => setMode("existing")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  I have an existing User ID
                </Button>

                <Button
                  onClick={() => setMode("new")}
                  variant="outline"
                  className="w-full"
                >
                  I&apos;m a new user (create User ID)
                </Button>
              </div>
            ) : mode === "existing" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userId">Enter your User ID</Label>
                  <Input
                    id="userId"
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. 123456"
                    className="mt-1"
                  />
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
                    onClick={handleExistingUserCheckin}
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

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMode("select");
                      setUserId("");
                      setMessage("");
                      setIsCheckedIn(false);
                    }}
                    className="w-full"
                  >
                    Back
                  </Button>
                  {localStorage.getItem("checkin_userId") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        localStorage.removeItem("checkin_userId");
                        setMessage("Your device will no longer remember you.");
                      }}
                      className="w-full text-xs text-gray-500"
                    >
                      Forget Me on This Device
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customUserId">Choose Your User ID</Label>
                    <div className="relative">
                      <Input
                        id="customUserId"
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="e.g. 123456"
                        className={`mt-1 ${
                          userIdAvailable === true ? 'border-green-500' :
                          userIdAvailable === false ? 'border-red-500' : ''
                        }`}
                      />
                      {userId && userId.length >= 3 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {checkingAvailability ? (
                            <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                          ) : userIdAvailable === true ? (
                            <div className="flex items-center">
                              <UserCheck className="w-4 h-4 text-green-500" />
                            </div>
                          ) : userIdAvailable === false ? (
                            <div className="flex items-center">
                              <UserX className="w-4 h-4 text-red-500" />
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {userIdAvailable === true ? (
                        <span className="text-green-600">✓ This ID is available</span>
                      ) : userIdAvailable === false ? (
                        <span className="text-red-600">✗ This ID is already taken</span>
                      ) : (
                        "Choose a unique ID you'll remember for future check-ins"
                      )}
                    </p>
                  </div>
                </div>

                {!isCheckedIn ? (
                  <Button
                    onClick={handleNewUserRegistration}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    {loading ? "Creating account and checking in..." : "Register & Check In"}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-green-700 font-medium">Successfully checked in!</p>
                      <p className="text-sm text-green-600 mt-1">Your User ID: {userId}</p>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      disabled={loading}
                      variant="destructive"
                      className="w-full"
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      {loading ? "Checking out..." : "Check Out"}
                    </Button>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    setMode("select");
                    setFirstName("");
                    setLastName("");
                    setUserId("");
                    setMessage("");
                  }}
                  className="w-full"
                >
                  Back
                </Button>
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