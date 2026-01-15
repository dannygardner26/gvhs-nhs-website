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
import { School, Calendar, Car, UserCheck, AlertCircle, CheckCircle, ArrowLeft, Mail, MapPin, BookOpen } from "lucide-react";
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

  // Available events (now fetched dynamically)
  const [availableEvents, setAvailableEvents] = useState<SchoolVisitEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // organization_id for 'nhs-elementary'
      const orgId = "35aeb7d0-899c-4924-a29f-7fbe7279f2a8";
      const response = await fetch(`/api/events?organization_id=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        const mappedEvents = data.map((event: any) => ({
          id: event.id,
          date: event.event_date,
          school: event.location, // Using location as school name
          time: `${event.start_time.slice(0, 5)} - ${event.end_time.slice(0, 5)}`
        }));
        setAvailableEvents(mappedEvents);
      }
    } catch (error) {
      console.error("Error fetching available events:", error);
    } finally {
      setEventsLoading(false);
    }
  };

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

  if (loading || eventsLoading) {
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
              <strong>Next visit: {availableEvents.length > 0 ? new Date(availableEvents[0].date + "T00:00:00").toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' }) : 'To Be Announced'}</strong> - Sign up to read with elementary students at local schools
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
              <div className="space-y-6">
                {/* RSVP INSTRUCTIONS */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center justify-center gap-2">
                    <MapPin className="w-6 h-6" />
                    RSVP Required on Canvas/Remind
                  </h3>
                  <p className="text-gray-700 mb-6">
                    Enrollment for NHS Elementary Visits is <strong>NOT</strong> handled on this website.
                    Please use the official registration channels:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                      <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="w-5 h-5 text-blue-700" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">Canvas</h4>
                      <p className="text-sm text-gray-600">Check the NHS Course for the latest signup module.</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                      <div className="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mail className="w-5 h-5 text-amber-700" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">Remind</h4>
                      <p className="text-sm text-gray-600">The Google Form link is sent out via Remind alerts.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    <strong>Note:</strong> You will use this website <strong>AFTER</strong> the visit
                    to log your service hours and verify your check-in.
                  </div>
                </div>

                {/* Event Schedule Display Only */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Upcoming Visit Schedule
                  </h4>
                  <div className="grid gap-3">
                    {availableEvents.length > 0 ? availableEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                          <div className="font-bold text-gray-900">
                            {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
                          </div>
                          <div className="text-sm text-gray-500">{event.school}</div>
                        </div>
                        <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {event.time}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-gray-500 italic">
                        No upcoming visits scheduled.
                      </div>
                    )}
                  </div>
                </div>

                <Link href="/volunteering" className="block">
                  <Button className="w-full bg-royal-blue hover:bg-blue-700">
                    Back to Volunteering
                  </Button>
                </Link>
              </div>
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
