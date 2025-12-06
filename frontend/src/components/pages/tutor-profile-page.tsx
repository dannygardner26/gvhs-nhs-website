"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CodeInput } from "@/components/ui/code-input";
import { User, BookOpen, Star, Clock, LogIn, UserPlus, Link } from "lucide-react";

interface TutorProfile {
  id: string;
  username: string;
  userId: string;
  subjects: string[];
  availability: string;
  experience: string;
  description: string;
  rating: number;
  totalSessions: number;
}

export function TutorProfilePage() {
  const [mode, setMode] = useState<"login" | "register" | "profile" | "edit">("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Profile data
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [subjects, setSubjects] = useState("");
  const [availability, setAvailability] = useState("");
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const savedUsername = localStorage.getItem("tutor_username");
    if (savedUsername) {
      setUsername(savedUsername);
      setIsLoggedIn(true);
      setMode("profile");
      loadProfile(savedUsername);
    }
  }, []);

  const loadProfile = async (tutorUsername: string) => {
    try {
      // TODO: Implement API call to load tutor profile
      setLoading(true);
      // Mock profile data for now
      const mockProfile: TutorProfile = {
        id: "1",
        username: tutorUsername,
        userId: "123456",
        subjects: ["Mathematics", "Physics", "Chemistry"],
        availability: "Mon-Fri 3:30-5:00 PM",
        experience: "2 years",
        description: "Passionate about helping students understand complex concepts in STEM subjects.",
        rating: 4.8,
        totalSessions: 45
      };
      setProfile(mockProfile);
      setSubjects(mockProfile.subjects.join(", "));
      setAvailability(mockProfile.availability);
      setExperience(mockProfile.experience);
      setDescription(mockProfile.description);
    } catch (error) {
      setMessage("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage("Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement login API call
      // Mock login for now
      localStorage.setItem("tutor_username", username);
      setIsLoggedIn(true);
      setMode("profile");
      await loadProfile(username);
      setMessage("");
    } catch (error) {
      setMessage("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword || !userId) {
      setMessage("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords don't match");
      return;
    }

    if (!/^\d{6}$/.test(userId)) {
      setMessage("User ID must be exactly 6 digits");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement registration API call
      // Mock registration for now
      localStorage.setItem("tutor_username", username);
      setIsLoggedIn(true);
      setMode("edit");
      setMessage("Account created successfully! Please complete your profile.");
    } catch (error) {
      setMessage("Error creating account");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!subjects || !availability || !experience || !description) {
      setMessage("Please fill in all profile fields");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement save profile API call
      setMode("profile");
      setMessage("Profile updated successfully!");
      // Reload profile data
      await loadProfile(username);
    } catch (error) {
      setMessage("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tutor_username");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setUserId("");
    setProfile(null);
    setMode("login");
    setMessage("");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {mode === "register" ? "Create Tutor Account" : "Tutor Login"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {mode === "register"
                ? "Join our tutoring community"
                : "Access your tutor profile and manage your availability"
              }
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="mt-1"
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

                {mode === "register" && (
                  <>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Your NHS User ID</Label>
                      <p className="text-xs text-gray-600 mt-1 mb-2">
                        Enter your 6-digit NHS check-in ID. {" "}
                        <span
                          className="text-blue-600 underline cursor-pointer"
                          onClick={() => window.open("/checkin", "_blank")}
                        >
                          Don't have one? Create it here.
                        </span>
                      </p>
                      <div className="flex justify-center">
                        <CodeInput
                          value={userId}
                          onChange={setUserId}
                          length={6}
                        />
                      </div>
                    </div>
                  </>
                )}

                {mode === "login" ? (
                  <Button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                )}

                <div className="text-center">
                  <button
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    {mode === "login"
                      ? "Don't have an account? Register here"
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>

                {message && (
                  <div className={`p-3 rounded-lg text-center text-sm ${
                    message.includes("Error") || message.includes("Invalid") || message.includes("don't match")
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700"
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Tutor Profile</h1>
            <p className="text-gray-600 mt-2">Update your tutoring information and availability</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="subjects">Subjects You Tutor</Label>
                <Input
                  id="subjects"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="e.g. Mathematics, Physics, Chemistry"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple subjects with commas</p>
              </div>

              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Mon-Fri 3:30-5:00 PM"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Input
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 2 years, Beginner, Advanced"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">About You</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell students about your tutoring style, strengths, and what you enjoy about helping others learn..."
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
                <Button
                  onClick={() => setMode("profile")}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-center text-sm ${
                  message.includes("Error")
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tutor Dashboard</h1>
            <p className="text-gray-600">Welcome back, {username}!</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setMode("edit")}
              variant="outline"
              className="flex items-center"
            >
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Your Tutor Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Subjects</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700">Availability</h3>
                    <p className="text-gray-600">{profile.availability}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700">Experience</h3>
                    <p className="text-gray-600">{profile.experience}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700">About</h3>
                    <p className="text-gray-600">{profile.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Card */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Star className="w-5 h-5 mr-2" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{profile.rating}</div>
                    <div className="text-gray-600 text-sm">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile.totalSessions}</div>
                    <div className="text-gray-600 text-sm">Total Sessions</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="w-5 h-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Student Requests
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    Update Availability
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}