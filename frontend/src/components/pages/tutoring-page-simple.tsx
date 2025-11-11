"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Users, RefreshCw, UserPlus, Key } from "lucide-react";

interface TutorRegistrationData {
  name: string;
  email: string;
  phone: string;
  grade: string;
  subjects: string[];
  experience: string;
  hasExistingId: boolean;
  existingId: string;
  customPasscode: string;
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
  };
  additionalNotes: string;
}

export function TutoringPageSimple() {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [registrationData, setRegistrationData] = useState<TutorRegistrationData>({
    name: "",
    email: "",
    phone: "",
    grade: "",
    subjects: [],
    experience: "",
    hasExistingId: false,
    existingId: "",
    customPasscode: "",
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false
    },
    additionalNotes: ""
  });

  const subjectOptions = [
    "Mathematics", "English", "Science", "History", "Foreign Language",
    "Computer Science", "Art", "Music", "Physical Education", "Other"
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3001/api/tutoring/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        setMessage("Registration submitted successfully! We'll contact you soon with next steps.");
        setShowRegistrationForm(false);
        setRegistrationData({
          name: "",
          email: "",
          phone: "",
          grade: "",
          subjects: [],
          experience: "",
          hasExistingId: false,
          existingId: "",
          customPasscode: "",
          availability: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false
          },
          additionalNotes: ""
        });
      } else {
        const errorData = await response.json();
        setMessage(`Failed to submit registration: ${errorData.error || "Please try again."}`);
      }
    } catch (error) {
      console.error("Error submitting registration:", error);
      setMessage("Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSubject = (subject: string) => {
    setRegistrationData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4">
        {!showRegistrationForm ? (
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center text-royal-blue text-3xl md:text-4xl font-bold">
                <BookOpen className="w-10 h-10 mr-4" />
                NHS Peer Tutoring Program
              </CardTitle>
              <p className="text-gray-600 text-lg mt-2">
                Join our academic support network at Great Valley High School
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-blue-50 rounded-lg">
                  <Users className="w-8 h-8 text-royal-blue mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">Help Your Peers</h3>
                  <p className="text-sm text-gray-600">Share your knowledge and help fellow students succeed academically</p>
                </div>
                <div className="p-6 bg-green-50 rounded-lg">
                  <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">Build Skills</h3>
                  <p className="text-sm text-gray-600">Develop teaching, communication, and leadership abilities</p>
                </div>
                <div className="p-6 bg-purple-50 rounded-lg">
                  <Key className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">Service Hours</h3>
                  <p className="text-sm text-gray-600">Earn community service hours for NHS and college applications</p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => setShowRegistrationForm(true)}
                className="bg-royal-blue hover:bg-blue-700 text-white px-8 py-3"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Register as a Tutor
              </Button>

              {message && (
                <div className={`p-4 rounded-lg ${
                  message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {message}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-2xl border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-royal-blue text-2xl">
                <UserPlus className="w-6 h-6 mr-2" />
                Tutor Registration Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={registrationData.name}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={registrationData.email}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={registrationData.phone}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">Current Grade *</Label>
                      <Select value={registrationData.grade} onValueChange={(value) => setRegistrationData(prev => ({ ...prev, grade: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9">9th Grade</SelectItem>
                          <SelectItem value="10">10th Grade</SelectItem>
                          <SelectItem value="11">11th Grade</SelectItem>
                          <SelectItem value="12">12th Grade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* ID and Passcode Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Account Setup</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="hasExistingId"
                        checked={registrationData.hasExistingId}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, hasExistingId: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="hasExistingId">I already have a tutor ID</Label>
                    </div>

                    {registrationData.hasExistingId ? (
                      <div>
                        <Label htmlFor="existingId">Existing Tutor ID *</Label>
                        <Input
                          id="existingId"
                          value={registrationData.existingId}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, existingId: e.target.value }))}
                          placeholder="Enter your existing tutor ID"
                          required
                        />
                      </div>
                    ) : null}

                    <div>
                      <Label htmlFor="customPasscode">Create Your Passcode *</Label>
                      <Input
                        id="customPasscode"
                        type="password"
                        value={registrationData.customPasscode}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, customPasscode: e.target.value }))}
                        placeholder="Choose a secure passcode (min 6 characters)"
                        minLength={6}
                        required
                      />
                      <p className="text-sm text-gray-600 mt-1">You'll use this passcode to access the tutoring system</p>
                    </div>
                  </div>
                </div>

                {/* Subjects and Experience */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Teaching Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Subjects you can tutor (select all that apply) *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {subjectOptions.map((subject) => (
                          <div key={subject} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={subject}
                              checked={registrationData.subjects.includes(subject)}
                              onChange={() => toggleSubject(subject)}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={subject} className="text-sm">{subject}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="experience">Teaching/Tutoring Experience *</Label>
                      <Textarea
                        id="experience"
                        rows={4}
                        value={registrationData.experience}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, experience: e.target.value }))}
                        placeholder="Describe any previous teaching, tutoring, or mentoring experience..."
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Availability</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {Object.keys(registrationData.availability).map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={day}
                          checked={registrationData.availability[day as keyof typeof registrationData.availability]}
                          onChange={(e) => setRegistrationData(prev => ({
                            ...prev,
                            availability: { ...prev.availability, [day]: e.target.checked }
                          }))}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={day} className="text-sm capitalize">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="additionalNotes"
                    rows={3}
                    value={registrationData.additionalNotes}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRegistrationForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}