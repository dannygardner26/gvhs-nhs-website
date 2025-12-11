"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { School, Calendar, Car, UserCheck, AlertCircle, CheckCircle, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

interface UserInfo {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
}

interface SchoolVisitEvent {
  id: string;
  date: string;
  school: string;
  time: string;
}

export function SchoolVisitsSignupPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Form fields
  const [selectedEvent, setSelectedEvent] = useState("");
  const [hasRide, setHasRide] = useState(false);
  const [canGiveRide, setCanGiveRide] = useState(false);
  const [rideCapacity, setRideCapacity] = useState("");
  const [teacherLastName, setTeacherLastName] = useState("");

  // Available events (would come from API in production)
  const availableEvents: SchoolVisitEvent[] = [
    { id: "1", date: "2024-12-12", school: "Charlestown Elementary", time: "9:00 AM - 10:30 AM" },
    { id: "2", date: "2025-01-15", school: "Sugartown Elementary", time: "9:00 AM - 10:30 AM" },
    { id: "3", date: "2025-01-22", school: "Charlestown Elementary", time: "9:00 AM - 10:30 AM" },
    { id: "4", date: "2025-02-05", school: "General Wayne Elementary", time: "9:00 AM - 10:30 AM" },
    { id: "5", date: "2025-02-12", school: "Sugartown Elementary", time: "9:00 AM - 10:30 AM" },
    { id: "6", date: "2025-02-26", school: "Charlestown Elementary", time: "9:00 AM - 10:30 AM" },
  ];

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUserId = localStorage.getItem("checkin_userId");
    if (savedUserId) {
      fetchUserInfo(savedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async (userId: string) => {
    try {
      const response = await fetch(`/api/checkin/status/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.username) {
          setIsLoggedIn(true);
          setUserInfo({
            userId: userId,
            username: data.username,
            firstName: data.firstName || data.username.split(" ")[0],
            lastName: data.lastName || data.username.split(" ")[1] || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInfo) {
      setMessage("You must be logged in to sign up.");
      return;
    }

    if (!selectedEvent) {
      setMessage("Please select an event date.");
      return;
    }

    if (!teacherLastName.trim()) {
      setMessage("Please enter your 7th period teacher's last name.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const selectedEventData = availableEvents.find((e) => e.id === selectedEvent);

    try {
      const response = await fetch("/api/school-visits/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userInfo.userId,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          eventId: selectedEvent,
          eventDate: selectedEventData?.date,
          school: selectedEventData?.school,
          hasRide,
          canGiveRide,
          rideCapacity: canGiveRide ? parseInt(rideCapacity) || 0 : 0,
          teacherLastName: teacherLastName.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage("Successfully signed up for the school visit!");
      } else {
        setMessage(data.message || "Error signing up. Please try again.");
      }
    } catch {
      setMessage("Error connecting to server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back button */}
        <Link href="/volunteering" className="inline-flex items-center text-royal-blue hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Volunteering
        </Link>

        {/* WARNING BANNER */}
        <div className="bg-red-600 text-white p-4 rounded-lg mb-6 shadow-lg">
          <div className="flex items-center justify-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <div className="text-center">
              <p className="text-lg font-bold">⚠️ NOT OFFICIAL SIGNUP ⚠️</p>
              <p className="text-sm mt-1">Fill out the form sent on Remind for official registration</p>
            </div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center border-b">
            <CardTitle className="flex items-center justify-center text-royal-blue text-2xl">
              <School className="w-6 h-6 mr-2" />
              NHS Elementary School Visits
            </CardTitle>
            <p className="text-gray-600 mt-2">
              <strong>Next visit: Friday, December 12th</strong> - Sign up to read with elementary students at local schools
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {!isLoggedIn ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Login Required
                </h3>
                <p className="text-gray-600 mb-6">
                  You must be logged in to sign up for school visits.
                </p>
                <Link href="/tutor/checkin">
                  <Button className="bg-royal-blue hover:bg-blue-700">
                    Go to Login
                  </Button>
                </Link>
              </div>
            ) : success ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Signup Confirmed!
                </h3>
                <p className="text-gray-600 mb-4">
                  You&apos;ve been signed up for the school visit. Check your email for more details.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">
                    <strong>Questions?</strong> Contact Dr. Morabito at{" "}
                    <a href="mailto:pmorabito@gvsd.org" className="text-royal-blue hover:underline">
                      pmorabito@gvsd.org
                    </a>
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSuccess(false);
                      setSelectedEvent("");
                      setHasRide(false);
                      setCanGiveRide(false);
                      setRideCapacity("");
                      setTeacherLastName("");
                    }}
                  >
                    Sign Up for Another Visit
                  </Button>
                  <Link href="/volunteering">
                    <Button className="bg-royal-blue hover:bg-blue-700">
                      Back to Volunteering
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logged in status */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <UserCheck className="w-5 h-5" />
                    <span className="font-medium">Signed in as: {userInfo?.username}</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    User ID: {userInfo?.userId}
                  </p>
                </div>

                {/* Event Selection */}
                <div className="space-y-2">
                  <Label htmlFor="event" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Select Event Date & School
                  </Label>
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEvents.map((event, index) => {
                        const isNext = index === 0;
                        return (
                          <SelectItem key={event.id} value={event.id}>
                            {isNext && "🔥 NEXT: "}
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            - {event.school} ({event.time})
                            {isNext && " - Friday 12/12"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Transportation Section */}
                <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Transportation
                  </h4>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="hasRide"
                      checked={hasRide}
                      onCheckedChange={(checked) => setHasRide(checked === true)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="hasRide" className="font-normal cursor-pointer">
                        I have my own ride to the school
                      </Label>
                      <p className="text-xs text-gray-500">
                        Check this if you can get to the elementary school yourself
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="canGiveRide"
                      checked={canGiveRide}
                      onCheckedChange={(checked) => setCanGiveRide(checked === true)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="canGiveRide" className="font-normal cursor-pointer">
                        I can give a ride to other students
                      </Label>
                      <p className="text-xs text-gray-500">
                        Check this if you can drive other NHS members
                      </p>
                    </div>
                  </div>

                  {canGiveRide && (
                    <div className="ml-6">
                      <Label htmlFor="rideCapacity">How many passengers can you take?</Label>
                      <Input
                        id="rideCapacity"
                        type="number"
                        min="1"
                        max="6"
                        value={rideCapacity}
                        onChange={(e) => setRideCapacity(e.target.value)}
                        placeholder="Number of passengers"
                        className="mt-1 w-32"
                      />
                    </div>
                  )}
                </div>

                {/* 7th Period Teacher */}
                <div className="space-y-2">
                  <Label htmlFor="teacherLastName">
                    7th Period Teacher&apos;s Last Name
                  </Label>
                  <Input
                    id="teacherLastName"
                    type="text"
                    value={teacherLastName}
                    onChange={(e) => setTeacherLastName(e.target.value)}
                    placeholder="e.g., Smith"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500">
                    This helps us organize permissions and notify your teacher
                  </p>
                </div>

                {/* Important Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> You will need to be excused from 7th period and may need a permission slip.
                    Contact Dr. Morabito at{" "}
                    <a href="mailto:pmorabito@gvsd.org" className="text-royal-blue hover:underline">
                      pmorabito@gvsd.org
                    </a>{" "}
                    with any questions.
                  </p>
                </div>

                {message && (
                  <div
                    className={`p-3 rounded-lg text-center ${
                      message.includes("Error") || message.includes("must")
                        ? "bg-red-50 text-red-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-royal-blue hover:bg-blue-700"
                >
                  {submitting ? "Signing Up..." : "Sign Up for This Visit"}
                </Button>
              </form>
            )}

            {/* Contact Info */}
            {!success && isLoggedIn && (
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Questions? Contact{" "}
                  <a
                    href="mailto:pmorabito@gvsd.org"
                    className="text-royal-blue hover:underline font-medium"
                  >
                    pmorabito@gvsd.org
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
