import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  BookOpen,
  Users,
  Heart,
  Mail,
  MapPin,
  Globe,
  Target
} from "lucide-react";

export function HomePage() {
  const advisorInfo = {
    name: "Dr. Paige Morabito",
    title: "NHS Faculty Advisor",
    email: "pmorabito@gvsd.org",
    office: "Room 215, Academic Building",
    officeHours: "Monday-Friday, 2:30-3:30 PM"
  };

  return (
    <div className="h-screen overflow-hidden py-1">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 fade-in">
            Great Valley High School NHS
          </h1>
          <p className="text-sm text-gray-600 max-w-3xl mx-auto mb-2 fade-in">
            Learn about our mission, the four pillars of NHS, and how to join our chapter.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2">
        <Card className="shadow-lg border-l-4 border-royal-blue">
          <CardHeader>
            <CardTitle className="flex items-center text-royal-blue text-lg">
              <Target className="w-5 h-5 mr-2" />
              Our Chapter Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-base text-gray-700 leading-relaxed">
                The Great Valley High School chapter of the National Honor Society serves to recognize
                those students who have demonstrated excellence in the areas of <span className="font-semibold text-royal-blue">Scholarship</span>,
                <span className="font-semibold text-royal-blue"> Leadership</span>,
                <span className="font-semibold text-royal-blue"> Service</span>, and
                <span className="font-semibold text-royal-blue"> Character</span>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-1">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-royal-blue mx-auto mb-1" />
                  <h3 className="font-semibold text-royal-blue text-sm">Scholarship</h3>
                  <p className="text-xs text-gray-600">Academic excellence and love of learning</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-royal-blue mx-auto mb-1" />
                  <h3 className="font-semibold text-royal-blue text-sm">Leadership</h3>
                  <p className="text-xs text-gray-600">Inspiring and guiding others</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <Heart className="w-6 h-6 text-royal-blue mx-auto mb-1" />
                  <h3 className="font-semibold text-royal-blue text-sm">Service</h3>
                  <p className="text-xs text-gray-600">Commitment to community betterment</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <Award className="w-6 h-6 text-royal-blue mx-auto mb-1" />
                  <h3 className="font-semibold text-royal-blue text-sm">Character</h3>
                  <p className="text-xs text-gray-600">Integrity and ethical behavior</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* How to Join NHS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-1">
        <div className="text-center mb-2">
          <h2 className="text-lg font-bold text-gray-900 mb-1">How to Join NHS</h2>
          <p className="text-sm text-gray-600">Understanding the selection process and requirements</p>
        </div>

        {/* Key Principles */}
        <div className="mb-2">
          <Card className="shadow-lg border-l-4 border-royal-blue">
            <CardHeader>
              <CardTitle className="flex items-center text-royal-blue text-lg">
                <Award className="w-5 h-5 mr-2" />
                NHS Selection Principles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-royal-blue rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">High Academic Honor</p>
                      <p className="text-gray-600">Cumulative GPA of 3.75 or higher</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-royal-blue rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Four Pillars Required</p>
                      <p className="text-gray-600">Service, Leadership, and Character are equally important as Scholarship</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-royal-blue rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Membership is a Privilege</p>
                      <p className="text-gray-600">Not a right - invitation to be a candidate for selection</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-royal-blue rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Selection Process</p>
                      <p className="text-gray-600">Not an application or election - candidates are evaluated</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selection Process and Faculty Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-royal-blue text-lg">
                <BookOpen className="w-5 h-5 mr-2" />
                Selection Process Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-royal-blue text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-semibold">Academic Eligibility</p>
                    <p className="text-sm text-gray-600">Students with 3.75+ cumulative GPA are identified</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-royal-blue text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-semibold">Candidate Information Form</p>
                    <p className="text-sm text-gray-600">Eligible students complete detailed form sharing Leadership, Service, and Character examples</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-royal-blue text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-semibold">Faculty Input & Records Review</p>
                    <p className="text-sm text-gray-600">Teachers provide input on character and discipline records are reviewed</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-royal-blue text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-semibold">Faculty Council Deliberation</p>
                    <p className="text-sm text-gray-600">Five-member council evaluates all four pillars equally</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-royal-blue text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                  <div>
                    <p className="font-semibold">Selection Decision</p>
                    <p className="text-sm text-gray-600">Students are notified of selection results</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Faculty Advisor */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-royal-blue text-lg">
                <Users className="w-5 h-5 mr-2" />
                Faculty Advisor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{advisorInfo.name}</h3>
                  <p className="text-gray-600">{advisorInfo.title}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-royal-blue mr-3" />
                    <a href={`mailto:${advisorInfo.email}`} className="text-royal-blue hover:underline">
                      {advisorInfo.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-royal-blue mr-3" />
                    <span className="text-gray-700">{advisorInfo.office}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 text-royal-blue mr-3" />
                    <span className="text-gray-700">{advisorInfo.officeHours}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button asChild className="w-full">
                    <a href={`mailto:${advisorInfo.email}`}>
                      Contact Dr. Morabito
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}