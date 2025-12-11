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

interface VolunteerInterestFormProps {
  opportunity: VolunteerOpportunity;
  onClose: () => void;
}

export function VolunteerInterestForm({ opportunity, onClose }: VolunteerInterestFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '',
    message: '',
    preferredContact: 'email',
    // NHS Elementary specific fields
    preferredSchool: '',
    teacherLastName: '',
    teacherEmail: '',
    emergencyContact: '',
    emergencyPhone: '',
    // Transportation system
    hasOwnRide: '',
    // Driver fields
    drivingMinutes: 5,
    driverAddress: '',
    passengerCapacity: 1,
    // Rider fields
    riderAddress: '',
    rideNeeds: 'both'
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
            // Transportation data
            hasOwnRide: formData.hasOwnRide,
            ...(formData.hasOwnRide === 'yes' && {
              drivingMinutes: formData.drivingMinutes,
              driverAddress: formData.driverAddress,
              passengerCapacity: formData.passengerCapacity
            }),
            ...(formData.hasOwnRide === 'no' && {
              riderAddress: formData.riderAddress,
              rideNeeds: formData.rideNeeds
            })
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
                  <Label htmlFor="preferredSchool">Preferred School (Optional)</Label>
                  <select
                    id="preferredSchool"
                    value={formData.preferredSchool}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredSchool: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">No preference</option>
                    <option value="charlestown">Charlestown Elementary</option>
                    <option value="sugartown">Sugartown Elementary</option>
                    <option value="general-wayne">General Wayne Elementary</option>
                    <option value="kd-markley">KD Markley Elementary</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teacherLastName">Period 7 Teacher LAST NAME ONLY</Label>
                    <Input
                      id="teacherLastName"
                      value={formData.teacherLastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, teacherLastName: e.target.value }))}
                      placeholder="Smith"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teacherEmail">Teacher Email (if known)</Label>
                    <Input
                      id="teacherEmail"
                      type="email"
                      value={formData.teacherEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, teacherEmail: e.target.value }))}
                      placeholder="teacher@gvsd.org"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Transportation System */}
                <div className="space-y-4">
                  <h5 className="font-medium text-blue-800">🚗 Transportation</h5>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs">🔒</span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 mb-1">Transportation Coordination & Privacy</p>
                        <p className="text-gray-700">
                          This system helps coordinate safe rides between NHS students. Your personal information and address are protected and only used for matching purposes. NHS coordinators facilitate all contact sharing to ensure student safety.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="hasOwnRide"
                        value="yes"
                        checked={formData.hasOwnRide === 'yes'}
                        onChange={(e) => setFormData(prev => ({ ...prev, hasOwnRide: e.target.value }))}
                        className="border-gray-300 text-blue-600 focus:ring-blue-500"
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
                      <span className="text-sm font-medium">I don't have my own ride</span>
                    </label>
                  </div>

                  {/* Driver Form */}
                  {formData.hasOwnRide === 'yes' && (
                    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h6 className="font-medium text-blue-800 mb-3">🚗 Optional: Help Other Students</h6>

                      <div>
                        <Label htmlFor="drivingMinutes">How many minutes out of your way are you willing to drive?</Label>
                        <div className="mt-2">
                          <input
                            type="range"
                            id="drivingMinutes"
                            min="1"
                            max="15"
                            value={formData.drivingMinutes}
                            onChange={(e) => setFormData(prev => ({ ...prev, drivingMinutes: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1 min</span>
                            <span className="font-medium text-green-600">{formData.drivingMinutes} minutes</span>
                            <span>15+ min</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="driverAddress">Your Address (for matching nearby students)</Label>
                        <Input
                          id="driverAddress"
                          value={formData.driverAddress}
                          onChange={(e) => setFormData(prev => ({ ...prev, driverAddress: e.target.value }))}
                          placeholder="123 Main St, City, PA 12345"
                          className="mt-1"
                        />
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                          <p className="text-xs text-yellow-800">
                            🔒 <strong>Privacy Protected:</strong> Your address will never be shared with other students. It's only used to calculate distances and suggest potential matches. Only NHS administrators can see addresses for coordination purposes.
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="passengerCapacity">How many students can you take TO the school?</Label>
                        <select
                          id="passengerCapacity"
                          value={formData.passengerCapacity}
                          onChange={(e) => setFormData(prev => ({ ...prev, passengerCapacity: parseInt(e.target.value) }))}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value={1}>1 student</option>
                          <option value={2}>2 students</option>
                          <option value={3}>3 students</option>
                          <option value={4}>4 students</option>
                          <option value={5}>5+ students</option>
                        </select>
                      </div>

                      {/* Mock nearby students list */}
                      <div className="bg-white p-3 border border-green-300 rounded-md">
                        <h6 className="text-sm font-medium text-green-800 mb-2">Students near you who need rides:</h6>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">Sarah M.</span>
                              <span className="text-gray-600 ml-2">• Needs ride TO school</span>
                            </div>
                            <span className="text-green-600 text-xs">2.1 miles away</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">Alex K.</span>
                              <span className="text-gray-600 ml-2">• Needs ride TO and FROM school</span>
                            </div>
                            <span className="text-green-600 text-xs">3.5 miles away</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">Jamie L.</span>
                              <span className="text-gray-600 ml-2">• Needs ride FROM school</span>
                            </div>
                            <span className="text-green-600 text-xs">1.8 miles away</span>
                          </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-300 rounded p-2 mt-3">
                          <p className="text-xs text-blue-800">
                            🔒 <strong>Privacy Notice:</strong> These students' addresses are protected - you only see distances. After you submit this form, NHS coordinators will share contact information for students you can help, and students will receive your contact info to arrange rides safely.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rider Form */}
                  {formData.hasOwnRide === 'no' && (
                    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h6 className="font-medium text-blue-800 mb-3">🏠 Ride Request Information</h6>

                      <div>
                        <Label htmlFor="riderAddress">Your Address</Label>
                        <Input
                          id="riderAddress"
                          value={formData.riderAddress}
                          onChange={(e) => setFormData(prev => ({ ...prev, riderAddress: e.target.value }))}
                          placeholder="123 Main St, City, PA 12345"
                          className="mt-1"
                        />
                        <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                          <p className="text-xs text-blue-800">
                            🔒 <strong>Privacy Protected:</strong> Your address will never be shown to other students. Only NHS administrators can see your address to help coordinate safe transportation matches. Drivers will only receive your general location (like "2.1 miles away") until you both agree to share contact information.
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="rideNeeds">Do you need a ride TO school, FROM school, or BOTH?</Label>
                        <select
                          id="rideNeeds"
                          value={formData.rideNeeds}
                          onChange={(e) => setFormData(prev => ({ ...prev, rideNeeds: e.target.value }))}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="to">TO school only</option>
                          <option value="from">FROM school only</option>
                          <option value="both">BOTH directions</option>
                        </select>
                      </div>

                      <div className="bg-blue-50 p-3 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>What happens next:</strong> Nearby students with cars will see that you need a ride and can contact you directly to offer transportation. You'll hear from potential drivers after they submit their forms.
                        </p>
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