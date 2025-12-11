"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Users, Camera, Clock, MapPin, Calendar, Gamepad2, HandHeart, Laptop, Mail, ExternalLink } from "lucide-react";
import Link from "next/link";
import { VolunteerInterestForm } from "@/components/forms/VolunteerInterestForm";

interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  date: string;
  icon: React.ReactNode;
  category: "community" | "social-media" | "tutoring";
  spots?: number;
  requirements?: string[];
  contactType: "link" | "email" | "signup";
  contactInfo?: string;
  contactLabel?: string;
  signupLink?: string;
}

const opportunities: VolunteerOpportunity[] = [
  {
    id: "nhs-elementary",
    title: "NHS Elementary School Visits",
    description: "Visit local elementary schools to read to students, help with activities, and inspire the next generation of learners. Next visit: Friday, December 12th.",
    location: "Various Elementary Schools",
    duration: "2-3 hours",
    date: "Next visit: December 12 (Friday)",
    icon: <Users className="w-6 h-6" />,
    category: "community",
    spots: 8,
    requirements: ["Background check required", "Training session attendance", "Reliable transportation"],
    contactType: "email",
    contactInfo: "pmorabito@gvsd.org",
    contactLabel: "Contact Mrs. Morabito"
  },
  {
    id: "kids-in-motion",
    title: "Kids in Motion",
    description: "Support youth sports programs by helping with events, coaching assistance, and promoting physical activity for children in our community.",
    location: "Local Sports Facilities",
    duration: "3-4 hours",
    date: "Weekends",
    icon: <Gamepad2 className="w-6 h-6" />,
    category: "community",
    spots: 12,
    requirements: ["Physical activity comfort", "Good with children", "Weekend availability"],
    contactType: "link",
    contactInfo: "https://kidsinmotionpa.org/events",
    contactLabel: "View Events"
  },
  {
    id: "interact-club",
    title: "Interact Club",
    description: "Participate in general community service drives and volunteering initiatives organized by the Interact Club.",
    location: "Various Community Locations",
    duration: "2-6 hours",
    date: "Monthly events",
    icon: <HandHeart className="w-6 h-6" />,
    category: "community",
    spots: 20,
    requirements: ["Flexible schedule", "Team player attitude", "Commitment to service"],
    contactType: "email",
    contactInfo: "abillman26@student.gvsd.org",
    contactLabel: "Contact Anna Billman"
  },
  {
    id: "gvco-tech-seniors",
    title: "GVCO Tech Seniors Program",
    description: "Help senior citizens learn and navigate technology, from smartphones to computers, improving their digital literacy and connection to family.",
    location: "Community Centers",
    duration: "2-3 hours",
    date: "Weekly sessions",
    icon: <Laptop className="w-6 h-6" />,
    category: "community",
    spots: 10,
    requirements: ["Technology proficiency", "Patience with seniors", "Clear communication skills"],
    contactType: "email",
    contactInfo: "pmorabito@gvsd.org",
    contactLabel: "Contact NHS Advisor"
  },
  {
    id: "social-media",
    title: "Social Media Content Creation",
    description: "Create engaging posts, graphics, and videos to showcase NHS activities and promote community service opportunities.",
    location: "Remote/School",
    duration: "Flexible",
    date: "Ongoing",
    icon: <Camera className="w-6 h-6" />,
    category: "social-media",
    requirements: ["Creative skills", "Social media experience preferred", "Photo/video editing knowledge helpful"],
    contactType: "email",
    contactInfo: "pmorabito@gvsd.org",
    contactLabel: "Contact NHS Advisor"
  },
  {
    id: "peer-tutoring",
    title: "Peer Tutoring Program",
    description: "Help fellow students succeed academically by providing tutoring in your strongest subjects during study periods.",
    location: "Library/Study Rooms",
    duration: "1-2 hours",
    date: "Weekly",
    icon: <Heart className="w-6 h-6" />,
    category: "tutoring",
    spots: 15,
    requirements: ["GPA 3.5 or higher", "Subject area expertise", "Patient teaching attitude"],
    contactType: "email",
    contactInfo: "pmorabito@gvsd.org",
    contactLabel: "Contact NHS Advisor"
  }
];

export function VolunteeringPage() {
  const { user, isAuthenticated } = useAuth();
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [dynamicOpportunities, setDynamicOpportunities] = useState<VolunteerOpportunity[]>(opportunities);
  const [suggestionForm, setSuggestionForm] = useState({
    opportunityTitle: "",
    description: "",
    organizationName: "",
    contactInfo: "",
    estimatedHours: "",
    preferredLocation: ""
  });
  const [submittingForm, setSubmittingForm] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<VolunteerOpportunity | null>(null);
  const [showInterestForm, setShowInterestForm] = useState(false);

  // Icon mapping for converting admin opportunities
  const iconMap: Record<string, React.ReactNode> = {
    "Users": <Users className="w-6 h-6" />,
    "Gamepad2": <Gamepad2 className="w-6 h-6" />,
    "HandHeart": <HandHeart className="w-6 h-6" />,
    "Laptop": <Laptop className="w-6 h-6" />,
    "Camera": <Camera className="w-6 h-6" />,
    "Heart": <Heart className="w-6 h-6" />
  };

  // Load dynamic opportunities from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('volunteer_opportunities');
    if (saved) {
      try {
        const adminOpportunities = JSON.parse(saved);
        // Convert admin format to display format
        const convertedOpportunities: VolunteerOpportunity[] = adminOpportunities.map((opp: any) => ({
          ...opp,
          icon: iconMap[opp.iconName] || <Users className="w-6 h-6" />
        }));
        setDynamicOpportunities(convertedOpportunities);
      } catch (e) {
        console.error('Error loading saved opportunities:', e);
        setDynamicOpportunities(opportunities);
      }
    }
  }, []);

  const handleSuggestionSubmit = async () => {
    if (!isAuthenticated) {
      setFormMessage("You must be logged in to suggest opportunities.");
      return;
    }

    if (!suggestionForm.opportunityTitle || !suggestionForm.description) {
      setFormMessage("Please fill in the required fields (opportunity title and description).");
      return;
    }

    setSubmittingForm(true);
    try {
      const response = await fetch("/api/opportunity-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...suggestionForm,
          nhsUserId: user?.userId,
          submittedBy: user?.username || `${user?.firstName} ${user?.lastName}`.trim()
        }),
      });

      if (response.ok) {
        setFormMessage("Thank you! Your suggestion has been submitted and will be reviewed by the NHS leadership.");
        setSuggestionForm({
          opportunityTitle: "",
          description: "",
          organizationName: "",
          contactInfo: "",
          estimatedHours: "",
          preferredLocation: ""
        });
        setTimeout(() => {
          setShowSuggestionForm(false);
          setFormMessage("");
        }, 3000);
      } else {
        setFormMessage("Error submitting suggestion. Please try again.");
      }
    } catch {
      setFormMessage("Error connecting to server. Please try again.");
    } finally {
      setSubmittingForm(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "community":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "social-media":
        return "bg-purple-50 border-purple-200 text-purple-800";
      case "tutoring":
        return "bg-green-50 border-green-200 text-green-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const renderActionButton = (opportunity: VolunteerOpportunity) => {
    switch (opportunity.contactType) {
      case "link":
        return (
          <a
            href={opportunity.contactInfo}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <ExternalLink className="w-4 h-4 mr-2" />
              {opportunity.contactLabel}
            </Button>
          </a>
        );
      case "email":
        return (
          <div className="space-y-2">
            {/* Warning Banner for NHS Elementary Visits - right above Express Interest */}
            {opportunity.id === 'nhs-elementary' && (
              <div className="w-full bg-amber-50 border border-amber-300 text-amber-800 px-3 py-2 rounded-md text-xs font-medium text-center mb-2">
                ⚠️ Not official signup - use Remind form
              </div>
            )}
            {/* Express Interest Button for morabito opportunities and Interact Club */}
            {(opportunity.contactInfo?.includes('morabito') || opportunity.id === 'interact-club') && (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 mb-2"
                onClick={() => {
                  setSelectedOpportunity(opportunity);
                  setShowInterestForm(true);
                }}
              >
                <Heart className="w-4 h-4 mr-2" />
                Express Interest
              </Button>
            )}
            <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-4 h-4 text-gray-500" />
              <a
                href={`mailto:${opportunity.contactInfo}`}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                {opportunity.contactInfo}
              </a>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {(opportunity.contactInfo?.includes('morabito') || opportunity.id === 'interact-club')
                ? "Use 'Express Interest' above for easier contact, or email directly"
                : opportunity.contactLabel
              }
            </p>
          </div>
        );
      case "signup":
        return (
          <div className="space-y-2">
            {opportunity.signupLink && (
              <Link href={opportunity.signupLink} className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Sign Up
                </Button>
              </Link>
            )}
            {opportunity.contactInfo && (
              <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Mail className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600">Questions?</span>
                <a
                  href={`mailto:${opportunity.contactInfo}`}
                  className="text-blue-600 hover:underline text-xs"
                >
                  {opportunity.contactInfo}
                </a>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-royal-blue mb-4">
            Volunteer Opportunities
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Make a difference in your community through National Honor Society volunteer opportunities.
            Choose from various ways to give back and earn service hours.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-gray-600">Hours Served This Year</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">45</div>
              <div className="text-gray-600">Active Volunteers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">8</div>
              <div className="text-gray-600">Community Partners</div>
            </CardContent>
          </Card>
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dynamicOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {opportunity.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(opportunity.category)}`}>
                    {opportunity.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <p className="text-gray-600 mb-4 flex-1">
                  {opportunity.description}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    {opportunity.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    {opportunity.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {opportunity.date}
                  </div>
                  {opportunity.spots && (
                    <div className="flex items-center text-sm text-green-600">
                      <Users className="w-4 h-4 mr-2" />
                      {opportunity.spots} spots available
                    </div>
                  )}
                </div>

                {/* Requirements */}
                {opportunity.requirements && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Requirements:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {opportunity.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button/Contact Info */}
                {renderActionButton(opportunity)}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action / Suggestion Form */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-8">
            {!showSuggestionForm ? (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-blue-800 mb-4">
                  Have an Idea for a New Opportunity?
                </h3>
                <p className="text-blue-600 mb-6 max-w-2xl mx-auto">
                  We&apos;re always looking for new ways to serve our community. If you have an idea for a volunteer opportunity
                  or know of an organization that could use our help, let us know!
                </p>
                {isAuthenticated ? (
                  <Button
                    onClick={() => setShowSuggestionForm(true)}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Suggest New Opportunity
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-amber-700 font-medium">
                      Please log in to suggest new volunteer opportunities
                    </p>
                    <p className="text-xs text-gray-600">
                      Use the Login button in the top navigation to access this feature
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-blue-800 mb-6 text-center">
                  Suggest a New Volunteer Opportunity
                </h3>
                <div className="max-w-2xl mx-auto space-y-4">
                  {/* User Info Display */}
                  {isAuthenticated && user ? (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Submitting as:</h4>
                      <div className="text-sm text-blue-800">
                        <p><strong>Name:</strong> {user.username || `${user.firstName} ${user.lastName}`.trim()}</p>
                        <p><strong>NHS ID:</strong> {user.userId}</p>
                        {user.email && <p><strong>Email:</strong> {user.email}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <p className="text-amber-800 font-medium">Please log in to suggest volunteer opportunities.</p>
                      <p className="text-amber-700 text-sm mt-1">You need to be authenticated to submit suggestions.</p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="opportunityTitle">Opportunity Title *</Label>
                    <Input
                      id="opportunityTitle"
                      value={suggestionForm.opportunityTitle}
                      onChange={(e) => setSuggestionForm(prev => ({ ...prev, opportunityTitle: e.target.value }))}
                      placeholder="e.g., Local Food Bank Volunteering"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <textarea
                      id="description"
                      value={suggestionForm.description}
                      onChange={(e) => setSuggestionForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the volunteer opportunity, what volunteers would do, and why it would benefit the community..."
                      rows={4}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="organizationName">Organization Name</Label>
                      <Input
                        id="organizationName"
                        value={suggestionForm.organizationName}
                        onChange={(e) => setSuggestionForm(prev => ({ ...prev, organizationName: e.target.value }))}
                        placeholder="e.g., Chester County Food Bank"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimatedHours">Estimated Hours</Label>
                      <Input
                        id="estimatedHours"
                        value={suggestionForm.estimatedHours}
                        onChange={(e) => setSuggestionForm(prev => ({ ...prev, estimatedHours: e.target.value }))}
                        placeholder="e.g., 2-3 hours per session"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contactInfo">Contact Information</Label>
                    <Input
                      id="contactInfo"
                      value={suggestionForm.contactInfo}
                      onChange={(e) => setSuggestionForm(prev => ({ ...prev, contactInfo: e.target.value }))}
                      placeholder="Email or phone number for the organization"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredLocation">Preferred Location</Label>
                    <Input
                      id="preferredLocation"
                      value={suggestionForm.preferredLocation}
                      onChange={(e) => setSuggestionForm(prev => ({ ...prev, preferredLocation: e.target.value }))}
                      placeholder="e.g., Malvern, West Chester, or Remote"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSuggestionSubmit}
                      disabled={submittingForm}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {submittingForm ? "Submitting..." : "Submit Suggestion"}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowSuggestionForm(false);
                        setFormMessage("");
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>

                  {formMessage && (
                    <div className={`p-3 rounded-lg text-center text-sm ${
                      formMessage.includes("Error")
                        ? "bg-red-50 text-red-700"
                        : "bg-green-50 text-green-700"
                    }`}>
                      {formMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Volunteer Interest Form Modal */}
        {showInterestForm && selectedOpportunity && (
          <VolunteerInterestForm
            opportunity={selectedOpportunity}
            onClose={() => {
              setShowInterestForm(false);
              setSelectedOpportunity(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
