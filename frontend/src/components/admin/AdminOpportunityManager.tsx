"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Gamepad2, HandHeart, Laptop, Camera, Heart, Edit, Trash2, Plus, Save, X } from "lucide-react";

interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  date: string;
  iconName: string;
  category: "community" | "social-media" | "tutoring";
  spots?: number;
  requirements: string[];
  contactType: "link" | "email" | "signup";
  contactInfo?: string;
  contactLabel?: string;
  signupLink?: string;
}

const iconMap = {
  "Users": <Users className="w-6 h-6" />,
  "Gamepad2": <Gamepad2 className="w-6 h-6" />,
  "HandHeart": <HandHeart className="w-6 h-6" />,
  "Laptop": <Laptop className="w-6 h-6" />,
  "Camera": <Camera className="w-6 h-6" />,
  "Heart": <Heart className="w-6 h-6" />
};

// Default hardcoded opportunities
const defaultOpportunities: VolunteerOpportunity[] = [
  {
    id: "nhs-elementary",
    title: "NHS Elementary School Visits",
    description: "Visit local elementary schools to read to students, help with activities, and inspire the next generation of learners.",
    location: "Various Elementary Schools",
    duration: "2-3 hours",
    date: "Twice monthly",
    iconName: "Users",
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
    iconName: "Gamepad2",
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
    iconName: "HandHeart",
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
    iconName: "Laptop",
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
    iconName: "Camera",
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
    iconName: "Heart",
    category: "tutoring",
    spots: 15,
    requirements: ["GPA 3.5 or higher", "Subject area expertise", "Patient teaching attitude"],
    contactType: "email",
    contactInfo: "pmorabito@gvsd.org",
    contactLabel: "Contact NHS Advisor"
  }
];

interface EditForm {
  title: string;
  description: string;
  location: string;
  duration: string;
  date: string;
  iconName: string;
  category: string;
  spots: string;
  requirements: string;
  contactType: string;
  contactInfo: string;
  contactLabel: string;
}

export function AdminOpportunityManager() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>(defaultOpportunities);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    title: "",
    description: "",
    location: "",
    duration: "",
    date: "",
    iconName: "Users",
    category: "community",
    spots: "",
    requirements: "",
    contactType: "email",
    contactInfo: "",
    contactLabel: ""
  });
  const [message, setMessage] = useState("");

  // Load opportunities from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('volunteer_opportunities');
    if (saved) {
      try {
        setOpportunities(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved opportunities:', e);
      }
    }
  }, []);

  // Save opportunities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('volunteer_opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  const handleEdit = (opportunity: VolunteerOpportunity) => {
    setEditingId(opportunity.id);
    setEditForm({
      title: opportunity.title,
      description: opportunity.description,
      location: opportunity.location,
      duration: opportunity.duration,
      date: opportunity.date,
      iconName: opportunity.iconName,
      category: opportunity.category,
      spots: opportunity.spots?.toString() || "",
      requirements: opportunity.requirements.join('\n'),
      contactType: opportunity.contactType,
      contactInfo: opportunity.contactInfo || "",
      contactLabel: opportunity.contactLabel || ""
    });
  };

  const handleSave = () => {
    if (!editForm.title.trim() || !editForm.description.trim()) {
      setMessage("Title and description are required");
      return;
    }

    const updatedOpportunity: VolunteerOpportunity = {
      id: editingId!,
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      location: editForm.location.trim(),
      duration: editForm.duration.trim(),
      date: editForm.date.trim(),
      iconName: editForm.iconName,
      category: editForm.category as any,
      spots: editForm.spots ? parseInt(editForm.spots) : undefined,
      requirements: editForm.requirements.split('\n').filter(req => req.trim()),
      contactType: editForm.contactType as any,
      contactInfo: editForm.contactInfo.trim() || undefined,
      contactLabel: editForm.contactLabel.trim() || undefined
    };

    setOpportunities(prev => prev.map(opp =>
      opp.id === editingId ? updatedOpportunity : opp
    ));

    setEditingId(null);
    setMessage("Opportunity updated successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleCancel = () => {
    setEditingId(null);
    setMessage("");
  };

  const handleResetToDefaults = () => {
    if (confirm("Are you sure you want to reset all opportunities to default values? This will overwrite any changes you've made.")) {
      setOpportunities(defaultOpportunities);
      setEditingId(null);
      setShowAddForm(false);
      setMessage("All opportunities reset to defaults!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditForm({
      title: "",
      description: "",
      location: "",
      duration: "",
      date: "",
      iconName: "Users",
      category: "community",
      spots: "",
      requirements: "",
      contactType: "email",
      contactInfo: "",
      contactLabel: ""
    });
  };

  const handleSaveNew = () => {
    if (!editForm.title.trim() || !editForm.description.trim()) {
      setMessage("Title and description are required");
      return;
    }

    const newOpportunity: VolunteerOpportunity = {
      id: `custom-${Date.now()}`,
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      location: editForm.location.trim(),
      duration: editForm.duration.trim(),
      date: editForm.date.trim(),
      iconName: editForm.iconName,
      category: editForm.category as any,
      spots: editForm.spots ? parseInt(editForm.spots) : undefined,
      requirements: editForm.requirements.split('\n').filter(req => req.trim()),
      contactType: editForm.contactType as any,
      contactInfo: editForm.contactInfo.trim() || undefined,
      contactLabel: editForm.contactLabel.trim() || undefined
    };

    setOpportunities(prev => [...prev, newOpportunity]);
    setShowAddForm(false);
    setMessage("New opportunity created successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = (opportunityId: string) => {
    // Only allow deletion of custom opportunities (not default ones)
    const isDefault = defaultOpportunities.some(opp => opp.id === opportunityId);
    if (isDefault) {
      setMessage("Cannot delete default opportunities. Use 'Edit' to modify them or 'Reset to Defaults' to restore.");
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    if (confirm("Are you sure you want to delete this opportunity? This action cannot be undone.")) {
      setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
      setMessage("Opportunity deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setMessage("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-royal-blue" />
            Volunteer Opportunity Management ({opportunities.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={handleAddNew}
              disabled={showAddForm || editingId !== null}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.includes("Error") || message.includes("Cannot") || message.includes("required")
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}>
            {message}
          </div>
        )}

        {/* Add New Opportunity Form */}
        {showAddForm && (
          <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">Add New Volunteer Opportunity</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-title">Title *</Label>
                  <Input
                    id="new-title"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                    placeholder="Opportunity title"
                  />
                </div>
                <div>
                  <Label htmlFor="new-category">Category</Label>
                  <select
                    id="new-category"
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent"
                  >
                    <option value="community">Community</option>
                    <option value="social-media">Social Media</option>
                    <option value="tutoring">Tutoring</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="new-description">Description *</Label>
                <Textarea
                  id="new-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={3}
                  placeholder="Describe the volunteer opportunity..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="new-location">Location</Label>
                  <Input
                    id="new-location"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1"
                    placeholder="Event location"
                  />
                </div>
                <div>
                  <Label htmlFor="new-duration">Duration</Label>
                  <Input
                    id="new-duration"
                    value={editForm.duration}
                    onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="mt-1"
                    placeholder="e.g., 2-3 hours"
                  />
                </div>
                <div>
                  <Label htmlFor="new-date">Schedule</Label>
                  <Input
                    id="new-date"
                    value={editForm.date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1"
                    placeholder="e.g., Weekly, Monthly"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-icon">Icon</Label>
                  <select
                    id="new-icon"
                    value={editForm.iconName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, iconName: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent"
                  >
                    <option value="Users">Users</option>
                    <option value="Gamepad2">Gamepad2</option>
                    <option value="HandHeart">HandHeart</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Camera">Camera</option>
                    <option value="Heart">Heart</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="new-spots">Available Spots</Label>
                  <Input
                    id="new-spots"
                    type="number"
                    value={editForm.spots}
                    onChange={(e) => setEditForm(prev => ({ ...prev, spots: e.target.value }))}
                    className="mt-1"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="new-requirements">Requirements (one per line)</Label>
                <Textarea
                  id="new-requirements"
                  value={editForm.requirements}
                  onChange={(e) => setEditForm(prev => ({ ...prev, requirements: e.target.value }))}
                  className="mt-1"
                  rows={3}
                  placeholder="Background check required&#10;Training session attendance&#10;Reliable transportation"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="new-contactType">Contact Type</Label>
                  <select
                    id="new-contactType"
                    value={editForm.contactType}
                    onChange={(e) => setEditForm(prev => ({ ...prev, contactType: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent"
                  >
                    <option value="email">Email</option>
                    <option value="link">External Link</option>
                    <option value="signup">Signup Form</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="new-contactInfo">Contact Info</Label>
                  <Input
                    id="new-contactInfo"
                    value={editForm.contactInfo}
                    onChange={(e) => setEditForm(prev => ({ ...prev, contactInfo: e.target.value }))}
                    className="mt-1"
                    placeholder="email@domain.com or https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="new-contactLabel">Contact Label</Label>
                  <Input
                    id="new-contactLabel"
                    value={editForm.contactLabel}
                    onChange={(e) => setEditForm(prev => ({ ...prev, contactLabel: e.target.value }))}
                    className="mt-1"
                    placeholder="Contact Mrs. Smith"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveNew} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Create Opportunity
                </Button>
                <Button variant="outline" onClick={handleCancelAdd}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <div key={opportunity.id} className="border rounded-lg p-4">
              {editingId === opportunity.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={editForm.category}
                        onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent"
                      >
                        <option value="community">Community</option>
                        <option value="social-media">Social Media</option>
                        <option value="tutoring">Tutoring</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={editForm.duration}
                        onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Schedule</Label>
                      <Input
                        id="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="iconName">Icon</Label>
                      <select
                        id="iconName"
                        value={editForm.iconName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, iconName: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent"
                      >
                        <option value="Users">Users</option>
                        <option value="Gamepad2">Gamepad2</option>
                        <option value="HandHeart">HandHeart</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Camera">Camera</option>
                        <option value="Heart">Heart</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="spots">Available Spots</Label>
                      <Input
                        id="spots"
                        type="number"
                        value={editForm.spots}
                        onChange={(e) => setEditForm(prev => ({ ...prev, spots: e.target.value }))}
                        className="mt-1"
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requirements">Requirements (one per line)</Label>
                    <Textarea
                      id="requirements"
                      value={editForm.requirements}
                      onChange={(e) => setEditForm(prev => ({ ...prev, requirements: e.target.value }))}
                      className="mt-1"
                      rows={3}
                      placeholder="Background check required&#10;Training session attendance&#10;Reliable transportation"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="contactType">Contact Type</Label>
                      <select
                        id="contactType"
                        value={editForm.contactType}
                        onChange={(e) => setEditForm(prev => ({ ...prev, contactType: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent"
                      >
                        <option value="email">Email</option>
                        <option value="link">External Link</option>
                        <option value="signup">Signup Form</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="contactInfo">Contact Info</Label>
                      <Input
                        id="contactInfo"
                        value={editForm.contactInfo}
                        onChange={(e) => setEditForm(prev => ({ ...prev, contactInfo: e.target.value }))}
                        className="mt-1"
                        placeholder="email@domain.com or https://..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactLabel">Contact Label</Label>
                      <Input
                        id="contactLabel"
                        value={editForm.contactLabel}
                        onChange={(e) => setEditForm(prev => ({ ...prev, contactLabel: e.target.value }))}
                        className="mt-1"
                        placeholder="Contact Mrs. Smith"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        {iconMap[opportunity.iconName as keyof typeof iconMap]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{opportunity.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          opportunity.category === 'community' ? 'bg-green-100 text-green-800 border-green-300' :
                          opportunity.category === 'social-media' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                          'bg-blue-100 text-blue-800 border-blue-300'
                        }`}>
                          {opportunity.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(opportunity)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      {!defaultOpportunities.some(def => def.id === opportunity.id) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(opportunity.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3">{opportunity.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div><strong>Location:</strong> {opportunity.location}</div>
                    <div><strong>Duration:</strong> {opportunity.duration}</div>
                    <div><strong>Schedule:</strong> {opportunity.date}</div>
                    {opportunity.spots && <div><strong>Spots:</strong> {opportunity.spots}</div>}
                  </div>

                  {opportunity.requirements.length > 0 && (
                    <div className="mb-3">
                      <strong className="text-sm">Requirements:</strong>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        {opportunity.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <strong className="text-sm">Contact:</strong>
                    <span className="text-sm text-gray-600 ml-2">
                      {opportunity.contactType === 'email' && opportunity.contactInfo}
                      {opportunity.contactType === 'link' && opportunity.contactInfo}
                      {opportunity.contactLabel && ` (${opportunity.contactLabel})`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}