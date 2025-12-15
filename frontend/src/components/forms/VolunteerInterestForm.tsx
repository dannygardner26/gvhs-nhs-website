"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  date: string;
}

interface ExistingSubmission {
  event_id: string;
  name: string;
  email: string;
  message: string;
  preferred_contact: string;
  preferred_school?: string;
  teacher_last_name?: string;
  teacher_email?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  has_own_ride?: string;
  willing_to_take_others?: string;
  created_at: string;
}

interface VolunteerInterestFormProps {
  opportunity: VolunteerOpportunity;
  existingSubmission?: ExistingSubmission;
  onClose: () => void;
}

export function VolunteerInterestForm({ opportunity, existingSubmission, onClose }: VolunteerInterestFormProps) {
  const { user, isAuthenticated } = useAuth();
  const isViewMode = !!existingSubmission;

  const [formData, setFormData] = useState({
    name: existingSubmission?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: existingSubmission?.email || user?.email || '',
    message: existingSubmission?.message || '',
    preferredContact: existingSubmission?.preferred_contact || 'email',
    // NHS Elementary specific fields
    preferredSchool: existingSubmission?.preferred_school || '',
    teacherLastName: existingSubmission?.teacher_last_name || '',
    teacherEmail: existingSubmission?.teacher_email || '',
    emergencyContact: existingSubmission?.emergency_contact || '',
    emergencyPhone: existingSubmission?.emergency_phone || '',
    hasOwnRide: existingSubmission?.has_own_ride || '',
    willingToTakeOthers: existingSubmission?.willing_to_take_others || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Prevent background scrolling when modal is open and handle escape key
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setMessage("You must be logged in to express interest.");
      return;
    }

    if (!formData.name || !formData.email) {
      setMessage("Please fill in your name and email.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/volunteer-interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: opportunity.id,
          nhsUserId: user?.userId,
          name: formData.name,
          email: formData.email,
          message: formData.message,
          preferredContact: formData.preferredContact,
          // NHS Elementary specific fields
          ...(opportunity.id === 'nhs-elementary' && {
            preferredSchool: formData.preferredSchool,
            teacherLastName: formData.teacherLastName,
            teacherEmail: formData.teacherEmail,
            emergencyContact: formData.emergencyContact,
            emergencyPhone: formData.emergencyPhone,
            hasOwnRide: formData.hasOwnRide,
            willingToTakeOthers: formData.willingToTakeOthers
          })
        }),
      });

      if (response.ok) {
        setMessage("Thank you! Your interest has been submitted. The organizer will contact you soon.");
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Error submitting interest. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting interest:", error);
      setMessage("Error connecting to server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <Card
          className="max-w-md w-full shadow-xl border-0"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-royal-blue" />
                Login Required
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Please log in to express interest in volunteer opportunities.
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border-0"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-royal-blue" />
              Express Interest
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* View Mode Banner */}
          {isViewMode && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 text-green-800 font-medium">
                <Heart className="w-5 h-5 fill-green-600 text-green-600" />
                Interest Already Submitted
              </div>
              <p className="text-sm text-green-700 mt-1">
                Submitted on {new Date(existingSubmission!.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">{opportunity.title}</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Location:</strong> {opportunity.location}</p>
              <p><strong>Duration:</strong> {opportunity.duration}</p>
              <p><strong>Schedule:</strong> {opportunity.date}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                  className="mt-1"
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
                  placeholder="your.email@student.gvsd.org"
                  className="mt-1"
                  required
                />
              </div>
            </div>


            <div>
              <Label htmlFor="preferredContact">Preferred Contact Method</Label>
              <select
                id="preferredContact"
                value={formData.preferredContact}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredContact: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="either">Either Email or Phone</option>
              </select>
            </div>

            {/* NHS Elementary School Visits - Custom Form */}
            {opportunity.id === 'nhs-elementary' && (
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">🏫 Elementary School Visit Details</h4>

                <div>
                  <Label htmlFor="preferredSchool">Preferred School *</Label>
                  <select
                    id="preferredSchool"
                    value={formData.preferredSchool}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredSchool: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a school...</option>
                    <option value="charlestown">Charlestown Elementary</option>
                    <option value="sugartown">Sugartown Elementary</option>
                    <option value="general-wayne">General Wayne Elementary</option>
                    <option value="kd-markley">KD Markley Elementary</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teacherLastName">Period 7 Teacher LAST NAME ONLY *</Label>
                    <Input
                      id="teacherLastName"
                      value={formData.teacherLastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, teacherLastName: e.target.value }))}
                      placeholder="Smith"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="teacherEmail">Teacher Email *</Label>
                    <Input
                      id="teacherEmail"
                      type="email"
                      value={formData.teacherEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, teacherEmail: e.target.value }))}
                      placeholder="teacher@gvsd.org"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                {/* Transportation */}
                <div className="space-y-4">
                  <h5 className="font-medium text-blue-800">🚗 Transportation *</h5>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="hasOwnRide"
                        value="yes"
                        checked={formData.hasOwnRide === 'yes'}
                        onChange={(e) => setFormData(prev => ({ ...prev, hasOwnRide: e.target.value }))}
                        className="border-gray-300 text-blue-600 focus:ring-blue-500"
                        required
                      />
                      <span className="text-sm font-medium">I have my own ride</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="hasOwnRide"
                        value="no"
                        checked={formData.hasOwnRide === 'no'}
                        onChange={(e) => setFormData(prev => ({ ...prev, hasOwnRide: e.target.value }))}
                        className="border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">I need a ride (we will coordinate)</span>
                    </label>
                  </div>

                  {/* Follow-up question for drivers */}
                  {formData.hasOwnRide === 'yes' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-2">Would you be willing to take another student who needs a ride?</p>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="willingToTakeOthers"
                            value="yes"
                            checked={formData.willingToTakeOthers === 'yes'}
                            onChange={(e) => setFormData(prev => ({ ...prev, willingToTakeOthers: e.target.value }))}
                            className="border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm">Yes, I can take another student</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="willingToTakeOthers"
                            value="no"
                            checked={formData.willingToTakeOthers === 'no'}
                            onChange={(e) => setFormData(prev => ({ ...prev, willingToTakeOthers: e.target.value }))}
                            className="border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm">No, I cannot take others</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      placeholder="Parent/Guardian Name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                      placeholder="(555) 123-4567"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="message">
                {opportunity.id === 'nhs-elementary' ? 'Additional Information (Optional)' : 'Message (Optional)'}
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder={
                  opportunity.id === 'nhs-elementary'
                    ? "Any specific skills, experience with children, or special requests..."
                    : "Tell us about your interest, any questions you have, or relevant experience..."
                }
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3">
              {isViewMode ? (
                <Button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Close
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? "Submitting..." : "Express Interest"}
                  </Button>
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-center text-sm ${
                message.includes("Error") || message.includes("must be")
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}>
                {message}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}