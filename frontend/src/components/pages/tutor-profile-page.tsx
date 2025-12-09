"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, BookOpen, Star, Clock, LogIn, UserPlus, Check } from "lucide-react";

// Days and periods for availability grid
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const PERIODS = ["Before School", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "After School"];

// Available subjects for tutoring
const AVAILABLE_SUBJECTS = {
  "Math": [
    "Pre-Algebra",
    "Algebra 1",
    "Geometry",
    "Algebra 2",
    "Pre-Calculus",
    "AP Calculus AB",
    "AP Calculus BC",
    "AP Statistics",
    "Multivariable Calculus",
  ],
  "Science": [
    "Biology",
    "Chemistry",
    "Physics",
    "AP Biology",
    "AP Chemistry",
    "AP Physics 1",
    "AP Physics 2",
    "AP Physics C: Mechanics",
    "AP Physics C: E&M",
    "AP Environmental Science",
  ],
  "English": [
    "English 9",
    "English 10",
    "English 11",
    "AP English Language",
    "AP English Literature",
  ],
  "History & Social Studies": [
    "World History",
    "US History",
    "AP World History",
    "AP US History",
    "AP Government",
    "AP Economics (Micro)",
    "AP Economics (Macro)",
    "AP Psychology",
    "AP Human Geography",
  ],
  "Languages": [
    "Spanish",
    "French",
    "Chinese",
    "AP Spanish",
    "AP French",
    "AP Chinese",
  ],
  "Computer Science": [
    "AP Computer Science A",
    "AP Computer Science Principles",
  ],
};

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
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availabilityGrid, setAvailabilityGrid] = useState<Record<string, Record<string, boolean>>>({});
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const toggleAvailability = (day: string, period: string) => {
    setAvailabilityGrid(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: !prev[day]?.[period]
      }
    }));
  };

  const isAvailable = (day: string, period: string) => {
    return availabilityGrid[day]?.[period] || false;
  };

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
      setSelectedSubjects(mockProfile.subjects);
      // Mock availability grid
      setAvailabilityGrid({
        "Mon": { "P3": true, "P4": true, "After School": true },
        "Tue": { "P3": true, "After School": true },
        "Wed": { "P3": true, "P4": true },
        "Thu": { "After School": true },
        "Fri": { "P3": true, "P4": true, "After School": true },
      });
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
                          onClick={() => window.open("/tutor/checkin", "_blank")}
                        >
                          Don't have one? Create it here.
                        </span>
                      </p>
                      <Input
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
                        className="text-center text-xl tracking-[0.5em] font-mono"
                      />
                    </div>
                  </>
                )}

                {mode === "login" ? (
                  <>
                    <Button
                      onClick={handleLogin}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setUsername("Demo User");
                        setPassword("demo123");
                        setMessage("Demo credentials entered. Click Sign In to continue.");
                      }}
                      className="w-full text-gray-500"
                    >
                      Use Demo Account
                    </Button>
                  </>
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
                <Label>Subjects You Tutor</Label>
                {selectedSubjects.length > 0 && (
                  <div className="mt-2 mb-3 flex flex-wrap gap-2">
                    {selectedSubjects.map(subject => (
                      <span
                        key={subject}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {subject}
                        <button
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-2 border rounded-lg p-3 max-h-64 overflow-y-auto bg-gray-50">
                  {Object.entries(AVAILABLE_SUBJECTS).map(([category, subjects]) => (
                    <div key={category} className="mb-4 last:mb-0">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">{category}</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {subjects.map(subject => (
                          <label
                            key={subject}
                            className={`flex items-center p-2 rounded cursor-pointer text-sm transition-colors ${
                              selectedSubjects.includes(subject)
                                ? 'bg-blue-100 text-blue-800'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedSubjects.includes(subject)}
                              onChange={() => toggleSubject(subject)}
                              className="sr-only"
                            />
                            <span className={`w-4 h-4 mr-2 rounded border flex items-center justify-center ${
                              selectedSubjects.includes(subject)
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300'
                            }`}>
                              {selectedSubjects.includes(subject) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </span>
                            {subject}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">{selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected</p>
              </div>

              <div>
                <Label>Availability</Label>
                <p className="text-xs text-gray-500 mb-2">Click cells to mark when you're available for tutoring</p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="p-2 border bg-gray-100 font-medium text-gray-700 sticky left-0"></th>
                        {PERIODS.map(period => (
                          <th key={period} className="p-2 border bg-gray-100 font-medium text-gray-700 text-center min-w-[60px]">
                            {period}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map(day => (
                        <tr key={day}>
                          <td className="p-2 border bg-gray-50 font-medium text-gray-700 sticky left-0">{day}</td>
                          {PERIODS.map(period => (
                            <td
                              key={`${day}-${period}`}
                              onClick={() => toggleAvailability(day, period)}
                              className={`p-2 border text-center cursor-pointer transition-colors ${
                                isAvailable(day, period)
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-white hover:bg-gray-100'
                              }`}
                            >
                              {isAvailable(day, period) && (
                                <Check className="w-4 h-4 mx-auto text-white" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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