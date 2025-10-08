"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, GraduationCap, Mail, Filter, Search, Users, MapPin, Calendar } from "lucide-react";

interface Tutor {
  _id: string;
  name: string;
  grade: number;
  subjects: string[];
  availability: {
    [period: string]: number[]; // period -> available days
  };
  bio?: string;
  isCurrentlyAvailable?: boolean;
}

interface TutoringFormData {
  studentName: string;
  studentEmail: string;
  studentGrade: string;
  subject: string;
  preferredPeriods: string[];
  preferredDays: number[];
  specificTopic: string;
  urgency: string;
  message: string;
}

const PERIODS = [
  { value: "before-school", label: "Before School (7:30-8:00 AM)" },
  { value: "period-1", label: "Period 1" },
  { value: "period-2", label: "Period 2" },
  { value: "period-3", label: "Period 3" },
  { value: "period-4", label: "Period 4" },
  { value: "period-5", label: "Period 5" },
  { value: "period-6", label: "Period 6" },
  { value: "period-7", label: "Period 7" },
  { value: "after-school", label: "After School (3:00-4:00 PM)" }
];

const CYCLE_DAYS = [1, 2, 3, 4, 5, 6];

export function TutoringPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showAvailableNow, setShowAvailableNow] = useState(false);
  const [formData, setFormData] = useState<TutoringFormData>({
    studentName: "",
    studentEmail: "",
    studentGrade: "",
    subject: "",
    preferredPeriods: [],
    preferredDays: [],
    specificTopic: "",
    urgency: "medium",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTutors();
    fetchSubjects();
  }, []);

  useEffect(() => {
    filterTutors();
  }, [tutors, searchTerm, selectedSubject, selectedPeriod, selectedDay, showAvailableNow]);

  const fetchTutors = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/tutoring/tutors");
      if (response.ok) {
        const data = await response.json();
        setTutors(data);
      }
    } catch (error) {
      console.error("Error fetching tutors:", error);
      // Use sample data as fallback
      const sampleTutors = [
        {
          _id: "1",
          name: "Sarah Johnson",
          grade: 12,
          subjects: ["Mathematics", "Algebra II", "Pre-Calculus"],
          availability: {
            "period-3": [1, 3, 5],
            "period-7": [2, 4, 6],
            "after-school": [1, 2, 3, 4, 5]
          },
          bio: "I love helping students understand math concepts and have been tutoring for 2 years.",
          isCurrentlyAvailable: true
        },
        {
          _id: "2",
          name: "Michael Chen",
          grade: 11,
          subjects: ["Chemistry", "Biology", "Physics"],
          availability: {
            "period-2": [1, 3, 5],
            "period-6": [2, 4, 6],
            "before-school": [1, 2, 3, 4, 5, 6]
          },
          bio: "Science enthusiast with a passion for making complex topics easy to understand.",
          isCurrentlyAvailable: false
        },
        {
          _id: "3",
          name: "Emily Rodriguez",
          grade: 12,
          subjects: ["English Literature", "Writing", "History"],
          availability: {
            "period-4": [1, 2, 3, 4, 5, 6],
            "period-5": [1, 3, 5],
            "after-school": [2, 4, 6]
          },
          bio: "Experienced in essay writing and literary analysis. Happy to help with any English needs!",
          isCurrentlyAvailable: true
        }
      ];
      setTutors(sampleTutors);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/tutoring/subjects");
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects(["Mathematics", "Chemistry", "Biology", "Physics", "English", "History"]);
    }
  };

  const filterTutors = () => {
    let filtered = tutors;

    if (showAvailableNow) {
      filtered = filtered.filter(tutor => tutor.isCurrentlyAvailable);
    }

    if (searchTerm) {
      filtered = filtered.filter(tutor =>
        tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedSubject && selectedSubject !== "all") {
      filtered = filtered.filter(tutor =>
        tutor.subjects.some(subject => subject.toLowerCase().includes(selectedSubject.toLowerCase()))
      );
    }

    if (selectedPeriod && selectedPeriod !== "all") {
      filtered = filtered.filter(tutor =>
        tutor.availability[selectedPeriod] && tutor.availability[selectedPeriod].length > 0
      );
    }

    if (selectedDay && selectedDay !== "all") {
      const dayNum = parseInt(selectedDay);
      filtered = filtered.filter(tutor =>
        Object.values(tutor.availability).some(days => days.includes(dayNum))
      );
    }

    setFilteredTutors(filtered);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3001/api/tutoring/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          studentGrade: parseInt(formData.studentGrade)
        }),
      });

      if (response.ok) {
        alert("Tutoring request submitted successfully! We'll contact you soon.");
        setFormData({
          studentName: "",
          studentEmail: "",
          studentGrade: "",
          subject: "",
          preferredPeriods: [],
          preferredDays: [],
          specificTopic: "",
          urgency: "medium",
          message: ""
        });
        setShowRequestForm(false);
      } else {
        alert("Failed to submit request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailabilityString = (tutor: Tutor) => {
    const availabilityText: string[] = [];

    Object.entries(tutor.availability).forEach(([period, days]) => {
      if (days.length > 0) {
        const periodLabel = PERIODS.find(p => p.value === period)?.label || period;
        const daysList = days.map(d => `Day ${d}`).join(", ");
        availabilityText.push(`${periodLabel}: ${daysList}`);
      }
    });

    return availabilityText.length > 0 ? availabilityText : ["Contact for availability"];
  };

  return (
    <div className="min-h-screen py-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 fade-in">
            NHS Tutoring Services
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 fade-in">
            Get academic support from our dedicated NHS members. Our tutors volunteer during their study halls
            to help you succeed in your studies with personalized, one-on-one assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setShowRequestForm(true)}
              className="hover-glow"
            >
              Request a Tutor
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowAvailableNow(!showAvailableNow)}
              className={showAvailableNow ? "bg-green-50 border-green-500 text-green-700" : ""}
            >
              <Users className="w-4 h-4 mr-2" />
              {showAvailableNow ? "Showing Available Now" : "Show Available Now"}
            </Button>
          </div>
        </div>
      </div>

      {/* Available Now Banner */}
      {showAvailableNow && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  Showing tutors currently available in the library
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-royal-blue">
              <Filter className="w-5 h-5 mr-2" />
              Find Your Perfect Tutor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by name or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cycle day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  {CYCLE_DAYS.map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      Day {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSubject("all");
                  setSelectedPeriod("all");
                  setSelectedDay("all");
                  setShowAvailableNow(false);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutors Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading tutors...</div>
          </div>
        ) : filteredTutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor, index) => (
              <Card key={tutor._id} className="hover-glow slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      tutor.isCurrentlyAvailable ? 'bg-green-500' : 'bg-royal-blue'
                    }`}>
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center">
                        {tutor.name}
                        {tutor.isCurrentlyAvailable && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Available Now
                          </span>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-500">Grade {tutor.grade}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <BookOpen className="w-4 h-4 text-royal-blue mr-2" />
                        <span className="font-medium text-sm">Subjects</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects.map((subject) => (
                          <span
                            key={subject}
                            className="px-2 py-1 bg-blue-100 text-royal-blue text-xs rounded-full"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 text-royal-blue mr-2" />
                        <span className="font-medium text-sm">Availability</span>
                      </div>
                      <div className="space-y-1">
                        {getAvailabilityString(tutor).map((availability, idx) => (
                          <p key={idx} className="text-xs text-gray-600">{availability}</p>
                        ))}
                      </div>
                    </div>

                    {tutor.bio && (
                      <div>
                        <p className="text-sm text-gray-600 italic">&quot;{tutor.bio}&quot;</p>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          subject: tutor.subjects[0] || ""
                        }));
                        setShowRequestForm(true);
                      }}
                    >
                      Request {tutor.name}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or request a tutor for your specific needs.</p>
          </div>
        )}
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center text-royal-blue">
                <Mail className="w-5 h-5 mr-2" />
                Request a Tutor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentName">Your Name *</Label>
                    <Input
                      id="studentName"
                      value={formData.studentName}
                      onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentEmail">Your Email *</Label>
                    <Input
                      id="studentEmail"
                      type="email"
                      value={formData.studentEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, studentEmail: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentGrade">Your Grade *</Label>
                    <Select value={formData.studentGrade} onValueChange={(value) => setFormData(prev => ({ ...prev, studentGrade: value }))}>
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
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="specificTopic">Specific Topic (Optional)</Label>
                  <Input
                    id="specificTopic"
                    placeholder="e.g., Quadratic equations, Photosynthesis, etc."
                    value={formData.specificTopic}
                    onChange={(e) => setFormData(prev => ({ ...prev, specificTopic: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Preferred Periods *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {PERIODS.map((period) => (
                      <label key={period.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferredPeriods.includes(period.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                preferredPeriods: [...prev.preferredPeriods, period.value]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                preferredPeriods: prev.preferredPeriods.filter(p => p !== period.value)
                              }));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{period.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Preferred Cycle Days *</Label>
                  <div className="flex gap-2 mt-2">
                    {CYCLE_DAYS.map((day) => (
                      <label key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferredDays.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                preferredDays: [...prev.preferredDays, day]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                preferredDays: prev.preferredDays.filter(d => d !== day)
                              }));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Day {day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General help</SelectItem>
                      <SelectItem value="medium">Medium - Upcoming test</SelectItem>
                      <SelectItem value="high">High - Urgent assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Additional Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about what you need help with..."
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRequestForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}