"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, UserX, Users, RefreshCw, Mail, Key } from "lucide-react";

export function CheckinPageSimple() {
  const [mode, setMode] = useState<"select" | "existing" | "account" | "new" | "registered">("select"); // select mode, existing user (ID), account login, new user, or just registered
  const [userId, setUserId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const response = await fetch(`/api/checkin/status/${id}`);
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
      const response = await fetch("/api/checkin/count");
      if (response.ok) {
        const data = await response.json();
        setCurrentCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  };

  const checkUserIdAvailability = async (id: string) => {
    if (!id.trim() || id.length !== 6 || !/^\d{6}$/.test(id)) {
      setUserIdAvailable(null);
      return;
    }

    setCheckingAvailability(true);
    try {
      const response = await fetch(`/api/checkin/status/${id}`);
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

  const handleExistingUserCheckin = async () => {
    if (!userId.trim()) {
      setMessage("Please enter your User ID.");
      return;
    }

    if (!/^\d{6}$/.test(userId)) {
      setMessage("User ID must be exactly 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/checkin/verify-and-checkin`, {
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

    if (!/^\d{6}$/.test(userId)) {
      setMessage("User ID must be exactly 6 digits.");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    if (!password.trim() || password.length < 6) {
      setMessage("Please enter a password (at least 6 characters).");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          customUserId: userId.trim(),
          email: email.trim().toLowerCase(),
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId);
        // Don't auto check-in, just show success and prompt to check in
        setMode("registered");
        setMessage("");
      } else {
        setMessage(data.message || "Error creating user. Please try again.");
      }
    } catch {
      setMessage("Error connecting to server");
    }
    setLoading(false);
  };

  const handleAccountLogin = async () => {
    if (!email.trim()) {
      setMessage("Please enter your User ID or email.");
      return;
    }

    if (!password.trim()) {
      setMessage("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkin/account-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIdOrEmail: email.trim().toLowerCase(),
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId);
        setIsCheckedIn(true);
        localStorage.setItem("checkin_userId", data.userId);
        setMessage(`Successfully checked in! Welcome back, ${data.username}.`);
        fetchCurrentCount();
      } else {
        setMessage(data.message || "Invalid User ID/email or password.");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
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

{mode === "registered" ? (
              <div className="space-y-4">
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                  <div className="text-green-600 text-4xl mb-3">✓</div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Registration Successful!</h3>
                  <p className="text-green-700 mb-4">Your account has been created.</p>
                  <div className="bg-white p-4 rounded-lg border border-green-300">
                    <p className="text-sm text-gray-600 mb-1">Your User ID:</p>
                    <p className="text-3xl font-mono font-bold text-royal-blue tracking-wider">{userId}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Remember this ID! You&apos;ll use it to check in each time you visit the library.
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setMode("existing");
                    setFirstName("");
                    setLastName("");
                    setEmail("");
                    setPassword("");
                    setMessage("");
                  }}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Check In Now
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setMode("select");
                    setUserId("");
                    setFirstName("");
                    setLastName("");
                    setEmail("");
                    setPassword("");
                    setMessage("");
                  }}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            ) : mode === "select" ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-gray-600">How would you like to check in?</p>
                </div>

                <Button
                  onClick={() => setMode("existing")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Login with 6-digit ID
                </Button>

                <Button
                  onClick={() => setMode("account")}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Login with Email & Password
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                <Button
                  onClick={() => setMode("new")}
                  variant="outline"
                  className="w-full"
                >
                  I&apos;m a new user (create account)
                </Button>
              </div>
            ) : mode === "account" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">User ID or Email</Label>
                  <Input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="123456 or your@email.com"
                    className="mt-1"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-1"
                  />
                </div>

                {isCheckedIn ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                      <p className="text-green-700 font-medium">✓ You are currently checked in</p>
                      <p className="text-sm text-green-600 mt-1">Click below to check out when you leave</p>
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
                ) : (
                  <Button
                    onClick={handleAccountLogin}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    {loading ? "Logging in..." : "Login & Check In"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    setMode("select");
                    setEmail("");
                    setPassword("");
                    setMessage("");
                    setIsCheckedIn(false);
                  }}
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            ) : mode === "existing" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userId">Enter your 6-digit User ID</Label>
                  <Input
                    id="userId"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={userId}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setUserId(val);
                    }}
                    placeholder="000000"
                    className="mt-2 text-center text-2xl tracking-[0.5em] font-mono"
                    autoFocus
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
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setUserId("000000");
                      setMessage("Demo ID entered. Click Check In to continue.");
                    }}
                    className="w-full text-gray-500"
                  >
                    Use Demo Account (000000)
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
                    <Label htmlFor="regEmail">Email</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="regPassword">Password</Label>
                    <Input
                      id="regPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customUserId">Choose Your 6-digit User ID</Label>
                    <div className="relative">
                      <Input
                        id="customUserId"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={userId}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setUserId(val);
                        }}
                        placeholder="000000"
                        className={`mt-2 text-center text-2xl tracking-[0.5em] font-mono ${
                          userIdAvailable === true ? 'border-green-500 bg-green-50' :
                          userIdAvailable === false ? 'border-red-500 bg-red-50' : ''
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-1">
                        {checkingAvailability ? (
                          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                        ) : userIdAvailable === true ? (
                          <UserCheck className="w-5 h-5 text-green-500" />
                        ) : userIdAvailable === false ? (
                          <UserX className="w-5 h-5 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      {userIdAvailable === true ? (
                        <span className="text-green-600">✓ This ID is available</span>
                      ) : userIdAvailable === false ? (
                        <span className="text-red-600">✗ This ID is already taken</span>
                      ) : userId.length === 0 ? (
                        "Enter exactly 6 digits for your unique ID"
                      ) : userId.length < 6 ? (
                        <span className="text-gray-500">Enter {6 - userId.length} more digit{6 - userId.length !== 1 ? 's' : ''}</span>
                      ) : !/^\d{6}$/.test(userId) ? (
                        <span className="text-red-600">ID must contain only numbers</span>
                      ) : (
                        "Choose a unique 6-digit ID you'll remember"
                      )}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleNewUserRegistration}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setMode("select");
                    setFirstName("");
                    setLastName("");
                    setEmail("");
                    setPassword("");
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