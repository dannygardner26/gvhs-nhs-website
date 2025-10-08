"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, BookOpen, Award, ArrowRight } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

interface Event {
  id: string;
  title: string;
  start: string;
  description?: string;
  location?: string;
  type?: string;
}

export function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        // Filter upcoming events (next 3 events)
        const upcoming = data
          .filter((event: Event) => new Date(event.start) >= new Date())
          .slice(0, 3);
        setUpcomingEvents(upcoming);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      // Use sample data as fallback
      const sampleEvents = [
        {
          id: "1",
          title: "NHS Monthly Meeting",
          start: "2024-11-15T15:30:00",
          description: "Regular monthly meeting for all NHS members",
          location: "Room 201",
          type: "meeting"
        },
        {
          id: "2",
          title: "Community Food Drive",
          start: "2024-11-22T09:00:00",
          description: "Help collect food donations for local families",
          location: "School Entrance",
          type: "service"
        }
      ];
      setEvents(sampleEvents);
      setUpcomingEvents(sampleEvents);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = (info: { event: { title: string; extendedProps: { location?: string; description?: string; }; }; }) => {
    alert(`Event: ${info.event.title}\nLocation: ${info.event.extendedProps.location}\nDescription: ${info.event.extendedProps.description}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative nhs-gradient text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Grand Valley High School
              <br />
              <span className="text-blue-200">National Honor Society</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Recognizing Scholarship, Leadership, Service, and Character
            </p>
            <p className="text-lg mb-12 max-w-2xl mx-auto text-blue-50">
              Join our community of outstanding students dedicated to academic excellence,
              meaningful service, and positive leadership in our school and community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-royal-blue hover:bg-blue-50 hover-glow text-lg px-8 py-3"
                asChild
              >
                <Link href="/tutoring">
                  Get Tutoring <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-royal-blue text-lg px-8 py-3"
                asChild
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Cards Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover-glow cursor-pointer slide-up">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-royal-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-royal-blue">NHS Membership</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Learn about NHS membership through your school counselor and invitation process.
                </p>
                <Button asChild className="w-full">
                  <Link href="/about">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-glow cursor-pointer slide-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-royal-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-royal-blue">Get Tutoring</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Connect with our NHS tutors for academic support in various subjects.
                </p>
                <Button asChild className="w-full">
                  <Link href="/tutoring">Find a Tutor</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-glow cursor-pointer slide-up" style={{ animationDelay: "0.4s" }}>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-royal-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-royal-blue">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Learn about our commitment to scholarship, leadership, service, and character.
                </p>
                <Button asChild className="w-full">
                  <Link href="/about">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Calendar and Events Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay connected with NHS activities, meetings, and service opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-royal-blue">
                    <Calendar className="w-5 h-5 mr-2" />
                    NHS Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isLoading && (
                    <div className="calendar-container">
                      <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={events}
                        eventClick={handleEventClick}
                        height="auto"
                        headerToolbar={{
                          left: "prev,next today",
                          center: "title",
                          right: "dayGridMonth"
                        }}
                        eventDisplay="block"
                        eventColor="#4169E1"
                        eventTextColor="#ffffff"
                      />
                    </div>
                  )}
                  {isLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-gray-500">Loading calendar...</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Events Sidebar */}
            <div>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-royal-blue">Next Events</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="border-l-4 border-royal-blue pl-4 py-2">
                          <h4 className="font-semibold text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(event.start).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit"
                            })}
                          </p>
                          {event.location && (
                            <p className="text-sm text-gray-500">{event.location}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No upcoming events scheduled.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* NHS Stats */}
              <Card className="shadow-lg mt-6">
                <CardHeader>
                  <CardTitle className="text-royal-blue">NHS at a Glance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Members</span>
                      <span className="font-semibold text-royal-blue">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Hours (This Year)</span>
                      <span className="font-semibold text-royal-blue">1,240</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tutoring Sessions</span>
                      <span className="font-semibold text-royal-blue">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Community Projects</span>
                      <span className="font-semibold text-royal-blue">12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}