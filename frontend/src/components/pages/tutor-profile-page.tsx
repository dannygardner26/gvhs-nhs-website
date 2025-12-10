"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, BookOpen, Clock, Settings, Award, BarChart3, Edit, Save, X, CheckCircle, GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface TutorStats {
  totalHours: number;
  totalSessions: number;
  rating: number;
  subjects: string[];
}

const SUBJECT_CATEGORIES = {
  "Math": [
    "Algebra I", "Algebra II", "Geometry", "Pre-Calculus", "Calculus",
    "Statistics", "AP Calculus AB", "AP Calculus BC", "Math Fundamentals"
  ],
  "Science": [
    "Biology", "Chemistry", "Physics", "Earth Science", "Environmental Science",
    "AP Biology", "AP Chemistry", "AP Physics", "Science Fundamentals"
  ],
  "English": [
    "English/Language Arts", "Reading Comprehension", "Writing", "Literature",
    "AP English Language", "AP English Literature", "Grammar", "Creative Writing"
  ],
  "History": [
    "World History", "US History", "Government", "Economics", "Geography",
    "AP World History", "AP US History", "AP Government", "Civics"
  ],
  "Computer Science": [
    "Computer Science", "Programming", "Web Development", "Python", "Java",
    "JavaScript", "AP Computer Science", "Data Structures"
  ],
  "Languages": [
    "Spanish", "French", "German", "Italian", "Latin", "Chinese", "Japanese",
    "AP Spanish", "AP French", "ESL/English as Second Language"
  ],
  "Other": [
    "Psychology", "Sociology", "Philosophy", "AP Psychology", "Art", "Music Theory",
    "Health", "Physical Education", "Study Skills", "Test Preparation", "SAT Prep", "ACT Prep"
  ]
};

// Flatten for backward compatibility
const _AVAILABLE_SUBJECTS = Object.values(SUBJECT_CATEGORIES).flat();

export function TutorProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [tutoringSubjects, setTutoringSubjects] = useState<string[]>([]);
  const [isEditingSubjects, setIsEditingSubjects] = useState(false);
  const [tutorStats, setTutorStats] = useState<TutorStats>({
    totalHours: 0,
    totalSessions: 0,
    rating: 5.0,
    subjects: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Initialize edited info when user data loads
  useEffect(() => {
    if (user) {
      setEditedInfo({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Load tutor statistics
  useEffect(() => {
    if (user?.userId) {
      loadTutorStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const loadTutorStats = async () => {
    try {
      // This would connect to your tutoring API endpoints
      const response = await fetch(`/api/checkin/admin/total-hours/${user?.userId}`);
      if (response.ok) {
        const data = await response.json();
        setTutorStats(prev => ({
          ...prev,
          totalHours: Math.round((data.totalDurationMs || 0) / (1000 * 60 * 60) * 10) / 10, // Convert to hours
          totalSessions: data.totalSessions || 0,
        }));
      }
    } catch (error) {
      console.error("Error loading tutor stats:", error);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Here you would make API call to update user info
      // For now, just update the local context
      updateUser({
        firstName: editedInfo.firstName,
        lastName: editedInfo.lastName,
        email: editedInfo.email,
      });

      setMessage("Profile updated successfully!");
      setIsEditing(false);

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error updating profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedInfo({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setIsEditing(false);
    setMessage("");
  };

  const handleSubjectToggle = (subject: string) => {
    setTutoringSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSaveSubjects = async () => {
    try {
      // Here you would save to an API endpoint
      // For now, just show success message
      setMessage("Tutoring subjects updated successfully!");
      setIsEditingSubjects(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error updating tutoring subjects. Please try again.");
      console.error("Error updating subjects:", error);
    }
  };

  return (
    <ProtectedRoute fallbackMessage="Please log in to view your NHS profile.">
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">NHS Member Profile</h1>
            <p className="text-gray-600">Manage your National Honor Society profile and view your activity</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-royal-blue" />
                      Personal Information
                    </CardTitle>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-royal-blue border-royal-blue hover:bg-royal-blue hover:text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveChanges}
                          disabled={loading}
                          className="bg-royal-blue hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {loading ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Success Message */}
                  {message && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${
                      message.includes("Error")
                        ? "bg-red-50 border border-red-200 text-red-700"
                        : "bg-green-50 border border-green-200 text-green-700"
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                      {message}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="firstName"
                          value={editedInfo.firstName}
                          onChange={(e) => setEditedInfo(prev => ({ ...prev, firstName: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-gray-50 rounded border text-gray-900">
                          {user?.firstName || "Not set"}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="lastName"
                          value={editedInfo.lastName}
                          onChange={(e) => setEditedInfo(prev => ({ ...prev, lastName: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-gray-50 rounded border text-gray-900">
                          {user?.lastName || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="userId">NHS User ID</Label>
                    <p className="mt-1 p-2 bg-gray-100 rounded border text-gray-600 font-mono text-center tracking-widest">
                      {user?.userId}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Need to change your ID? Contact us at{" "}
                      <a href="mailto:pmorabito@gvsd.org" className="text-royal-blue hover:underline">
                        pmorabito@gvsd.org
                      </a>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedInfo.email}
                        onChange={(e) => setEditedInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1"
                        placeholder="your.email@student.gvsd.org"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-gray-50 rounded border text-gray-900">
                        {user?.email || "Not set"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* NHS Activity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-royal-blue" />
                    NHS Activity Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{tutorStats.totalHours}</div>
                      <div className="text-sm text-blue-800">Tutoring Hours</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{tutorStats.totalSessions}</div>
                      <div className="text-sm text-green-800">Total Sessions</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{tutorStats.rating}</div>
                      <div className="text-sm text-yellow-800">Avg Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tutoring Subjects */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-royal-blue" />
                      Tutoring Subjects
                    </CardTitle>
                    {!isEditingSubjects ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingSubjects(true)}
                        className="text-royal-blue border-royal-blue hover:bg-royal-blue hover:text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingSubjects(false)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveSubjects}
                          className="bg-royal-blue hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingSubjects ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Select all subjects you are comfortable tutoring:
                      </p>
                      <div className="max-h-80 overflow-y-auto space-y-4">
                        {Object.entries(SUBJECT_CATEGORIES).map(([category, subjects]) => (
                          <div key={category} className="space-y-2">
                            <h4 className="font-semibold text-sm text-gray-900 border-b border-gray-200 pb-1">
                              {category}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {subjects.map((subject) => (
                                <label
                                  key={subject}
                                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={tutoringSubjects.includes(subject)}
                                    onChange={() => handleSubjectToggle(subject)}
                                    className="w-4 h-4 text-royal-blue border-gray-300 rounded focus:ring-royal-blue"
                                  />
                                  <span className="text-sm text-gray-700">{subject}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Selected {tutoringSubjects.length} subject(s)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tutoringSubjects.length > 0 ? (
                        <>
                          {Object.entries(SUBJECT_CATEGORIES).map(([category, subjects]) => {
                            const userSubjectsInCategory = subjects.filter(subject =>
                              tutoringSubjects.includes(subject)
                            );

                            if (userSubjectsInCategory.length === 0) return null;

                            return (
                              <div key={category} className="space-y-2">
                                <h4 className="font-semibold text-sm text-gray-900">
                                  {category}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {userSubjectsInCategory.map((subject) => (
                                    <span
                                      key={subject}
                                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                    >
                                      {subject}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                          <p className="text-sm text-gray-600 pt-2 border-t border-gray-200">
                            You can tutor {tutoringSubjects.length} subject{tutoringSubjects.length > 1 ? 's' : ''} across {Object.entries(SUBJECT_CATEGORIES).filter(([, subjects]) =>
                              subjects.some(subject => tutoringSubjects.includes(subject))
                            ).length} categor{Object.entries(SUBJECT_CATEGORIES).filter(([, subjects]) =>
                              subjects.some(subject => tutoringSubjects.includes(subject))
                            ).length > 1 ? 'ies' : 'y'}
                          </p>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 mb-2">No subjects selected yet</p>
                          <p className="text-sm text-gray-400">Click &quot;Edit&quot; to add subjects you can tutor</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-royal-blue" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {user?.username || `${user?.firstName} ${user?.lastName}`.trim()}
                    </div>
                    <div className="text-sm text-gray-600">NHS Member</div>
                    <div className="text-xs text-gray-500 mt-1">ID: {user?.userId}</div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📚 Tutoring: {tutorStats.totalSessions} sessions</p>
                      <p>⏱️ Hours: {tutorStats.totalHours} total</p>
                      <p>⭐ Rating: {tutorStats.rating}/5.0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-royal-blue" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline" asChild>
                    <a href="/tutor/checkin">
                      <Clock className="w-4 h-4 mr-2" />
                      Tutor Check-in
                    </a>
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <a href="/volunteering">
                      <BookOpen className="w-4 h-4 mr-2" />
                      View Opportunities
                    </a>
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <a href="/eligibility">
                      <Award className="w-4 h-4 mr-2" />
                      NHS Requirements
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}