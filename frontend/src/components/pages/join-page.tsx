"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Award,
  BookOpen,
  Users,
  Heart,
  CheckCircle,
  Calendar,
  Clock,
  User,
  Target
} from "lucide-react";

interface Requirements {
  minimumGPA: number;
  minimumGrade: number;
  serviceHours: {
    sophomore: number;
    junior: number;
    senior: number;
  };
  requirements: {
    pillar: string;
    description: string;
    details: string[];
  }[];
  applicationProcess: {
    step: number;
    title: string;
    description: string;
  }[];
  importantDates: {
    date: string;
    event: string;
  }[];
}

interface ApplicationFormData {
  name: string;
  email: string;
  grade: string;
  gpa: string;
  phone: string;
  leadershipExperience: string;
  serviceHours: string;
  serviceDescription: string;
  characterReference: {
    teacherName: string;
    teacherEmail: string;
    relationship: string;
  };
  personalStatement: string;
  whyJoinNHS: string;
}

export function JoinPage() {
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    email: "",
    grade: "",
    gpa: "",
    phone: "",
    leadershipExperience: "",
    serviceHours: "",
    serviceDescription: "",
    characterReference: {
      teacherName: "",
      teacherEmail: "",
      relationship: ""
    },
    personalStatement: "",
    whyJoinNHS: ""
  });

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/join/requirements");
      if (response.ok) {
        const data = await response.json();
        setRequirements(data);
      }
    } catch (error) {
      console.error("Error fetching requirements:", error);
      // Use fallback data
      setRequirements({
        minimumGPA: 3.5,
        minimumGrade: 10,
        serviceHours: { sophomore: 20, junior: 30, senior: 40 },
        requirements: [
          {
            pillar: "Scholarship",
            description: "Maintain a cumulative GPA of 3.5 or higher",
            details: ["Academic excellence in all subjects", "Consistent performance across semesters"]
          },
          {
            pillar: "Leadership",
            description: "Demonstrate leadership qualities in school and community",
            details: ["Student government participation", "Club officer positions", "Team captain roles"]
          },
          {
            pillar: "Service",
            description: "Complete required community service hours",
            details: ["Sophomores: Minimum 20 hours", "Juniors: Minimum 30 hours", "Seniors: Minimum 40 hours"]
          },
          {
            pillar: "Character",
            description: "Exhibit exemplary character and citizenship",
            details: ["No major disciplinary actions", "Positive teacher recommendations"]
          }
        ],
        applicationProcess: [
          { step: 1, title: "Check Eligibility", description: "Ensure you meet all minimum requirements" },
          { step: 2, title: "Complete Application", description: "Fill out the comprehensive application form" },
          { step: 3, title: "Submit Documentation", description: "Provide service hour documentation" },
          { step: 4, title: "Application Review", description: "Faculty council reviews your application" },
          { step: 5, title: "Interview Process", description: "Selected candidates participate in an interview" },
          { step: 6, title: "Final Decision", description: "Receive notification of acceptance or rejection" }
        ],
        importantDates: [
          { date: "October 1", event: "Application Period Opens" },
          { date: "November 15", event: "Application Deadline" },
          { date: "December 1-15", event: "Interview Period" },
          { date: "January 15", event: "Final Decisions Announced" }
        ]
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3001/api/join/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          grade: parseInt(formData.grade),
          gpa: parseFloat(formData.gpa),
          serviceHours: parseInt(formData.serviceHours)
        }),
      });

      if (response.ok) {
        alert("Application submitted successfully! We'll review your application and contact you soon.");
        setFormData({
          name: "",
          email: "",
          grade: "",
          gpa: "",
          phone: "",
          leadershipExperience: "",
          serviceHours: "",
          serviceDescription: "",
          characterReference: {
            teacherName: "",
            teacherEmail: "",
            relationship: ""
          },
          personalStatement: "",
          whyJoinNHS: ""
        });
        setShowApplicationForm(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to submit application: ${errorData.error || "Please try again."}`);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pillarIcons = {
    "Scholarship": BookOpen,
    "Leadership": Users,
    "Service": Heart,
    "Character": Award
  };

  if (!requirements) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">Loading requirements...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 fade-in">
            Join the National Honor Society
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 fade-in">
            Become part of an organization that recognizes and promotes the four pillars of excellence:
            Scholarship, Leadership, Service, and Character.
          </p>
          <Button
            size="lg"
            onClick={() => setShowApplicationForm(true)}
            className="hover-glow"
          >
            Apply Now
          </Button>
        </div>
      </section>

      {/* Four Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">The Four Pillars of NHS</h2>
          <p className="text-lg text-gray-600">Excellence in every aspect of student life</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {requirements.requirements.map((req, index) => {
            const IconComponent = pillarIcons[req.pillar as keyof typeof pillarIcons];
            return (
              <Card key={req.pillar} className="hover-glow slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-royal-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-royal-blue">{req.pillar}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-center">{req.description}</p>
                  <ul className="space-y-2">
                    {req.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Requirements Summary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <Card className="shadow-lg border-l-4 border-royal-blue">
          <CardHeader>
            <CardTitle className="flex items-center text-royal-blue">
              <Target className="w-5 h-5 mr-2" />
              Minimum Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-royal-blue">{requirements.minimumGPA}</div>
                <div className="text-sm text-gray-600">Minimum GPA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-royal-blue">{requirements.minimumGrade}th+</div>
                <div className="text-sm text-gray-600">Grade Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-royal-blue">
                  {requirements.serviceHours.sophomore}+
                </div>
                <div className="text-sm text-gray-600">Service Hours</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Application Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Process</h2>
          <p className="text-lg text-gray-600">Your journey to NHS membership</p>
        </div>

        <div className="space-y-6">
          {requirements.applicationProcess.map((step, index) => (
            <Card key={step.step} className="slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-royal-blue rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  {index < requirements.applicationProcess.length - 1 && (
                    <div className="hidden md:block w-8 h-8 text-gray-300">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Important Dates */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-royal-blue">
                <Calendar className="w-5 h-5 mr-2" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requirements.importantDates.map((date, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-medium text-gray-900">{date.event}</span>
                    <span className="text-royal-blue font-semibold">{date.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-royal-blue">
                <Clock className="w-5 h-5 mr-2" />
                Service Hour Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Sophomores (10th Grade)</span>
                  <span className="font-semibold text-royal-blue">{requirements.serviceHours.sophomore} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Juniors (11th Grade)</span>
                  <span className="font-semibold text-royal-blue">{requirements.serviceHours.junior} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Seniors (12th Grade)</span>
                  <span className="font-semibold text-royal-blue">{requirements.serviceHours.senior} hours</span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Service hours must be completed before application submission and must benefit the community.
                  Documentation required for all service activities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-4xl my-8">
            <CardHeader>
              <CardTitle className="flex items-center text-royal-blue">
                <User className="w-5 h-5 mr-2" />
                NHS Membership Application
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
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">Current Grade *</Label>
                      <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10th Grade (Sophomore)</SelectItem>
                          <SelectItem value="11">11th Grade (Junior)</SelectItem>
                          <SelectItem value="12">12th Grade (Senior)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="gpa">Cumulative GPA *</Label>
                      <Input
                        id="gpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="4.0"
                        value={formData.gpa}
                        onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Leadership Experience */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Leadership Experience</h3>
                  <div>
                    <Label htmlFor="leadershipExperience">
                      Describe your leadership experience (student government, club positions, team captain, etc.) *
                    </Label>
                    <Textarea
                      id="leadershipExperience"
                      rows={4}
                      value={formData.leadershipExperience}
                      onChange={(e) => setFormData(prev => ({ ...prev, leadershipExperience: e.target.value }))}
                      placeholder="Include specific roles, responsibilities, and achievements..."
                      required
                    />
                  </div>
                </div>

                {/* Service Experience */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Service Experience</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="serviceHours">Total Community Service Hours *</Label>
                      <Input
                        id="serviceHours"
                        type="number"
                        min="0"
                        value={formData.serviceHours}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceHours: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="serviceDescription">
                        Describe your community service activities *
                      </Label>
                      <Textarea
                        id="serviceDescription"
                        rows={4}
                        value={formData.serviceDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceDescription: e.target.value }))}
                        placeholder="Include organizations served, activities performed, and impact made..."
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Character Reference */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Character Reference</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="teacherName">Teacher/Advisor Name *</Label>
                      <Input
                        id="teacherName"
                        value={formData.characterReference.teacherName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          characterReference: { ...prev.characterReference, teacherName: e.target.value }
                        }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherEmail">Teacher/Advisor Email *</Label>
                      <Input
                        id="teacherEmail"
                        type="email"
                        value={formData.characterReference.teacherEmail}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          characterReference: { ...prev.characterReference, teacherEmail: e.target.value }
                        }))}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="relationship">Relationship to you (e.g., &quot;AP History teacher and debate coach&quot;) *</Label>
                      <Input
                        id="relationship"
                        value={formData.characterReference.relationship}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          characterReference: { ...prev.characterReference, relationship: e.target.value }
                        }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Statements */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Statements</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="personalStatement">
                        Personal Statement: Describe how you embody the four pillars of NHS *
                      </Label>
                      <Textarea
                        id="personalStatement"
                        rows={6}
                        value={formData.personalStatement}
                        onChange={(e) => setFormData(prev => ({ ...prev, personalStatement: e.target.value }))}
                        placeholder="Discuss how you demonstrate scholarship, leadership, service, and character..."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="whyJoinNHS">
                        Why do you want to join the National Honor Society? *
                      </Label>
                      <Textarea
                        id="whyJoinNHS"
                        rows={4}
                        value={formData.whyJoinNHS}
                        onChange={(e) => setFormData(prev => ({ ...prev, whyJoinNHS: e.target.value }))}
                        placeholder="Explain your motivations and what you hope to contribute..."
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting Application..." : "Submit Application"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowApplicationForm(false)}
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