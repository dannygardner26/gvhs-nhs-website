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
import Link from "next/link";

export function AboutPage() {
  const advisorInfo = {
    name: "Dr. Paige Morabito",
    title: "NHS Faculty Advisor",
    email: "pmorabito@gvsd.org",
    office: "Room 215, Academic Building",
    officeHours: "Monday-Friday, 2:30-3:30 PM"
  };

  return (
    <div className="min-h-screen py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 fade-in">
            About Our NHS Chapter
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 fade-in">
            Learn about our mission, the four pillars of NHS, and the dedicated students who make up the
            Grand Valley High School National Honor Society chapter.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <Card className="shadow-lg border-l-4 border-royal-blue">
          <CardHeader>
            <CardTitle className="flex items-center text-royal-blue text-2xl">
              <Target className="w-6 h-6 mr-3" />
              Our Chapter Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                The Grand Valley High School chapter of the National Honor Society serves to recognize
                those students who have demonstrated excellence in the areas of <span className="font-semibold text-royal-blue">Scholarship</span>,
                <span className="font-semibold text-royal-blue"> Leadership</span>,
                <span className="font-semibold text-royal-blue"> Service</span>, and
                <span className="font-semibold text-royal-blue"> Character</span>.
              </p>
              <p className="text-gray-600">
                Our chapter is committed to creating enthusiastic learners, responsible citizens,
                and ethical leaders who will contribute positively to their communities and society as a whole.
                We believe in fostering academic excellence while developing character and encouraging
                meaningful service to others.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BookOpen className="w-8 h-8 text-royal-blue mx-auto mb-2" />
                  <h3 className="font-semibold text-royal-blue">Scholarship</h3>
                  <p className="text-sm text-gray-600">Academic excellence and love of learning</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="w-8 h-8 text-royal-blue mx-auto mb-2" />
                  <h3 className="font-semibold text-royal-blue">Leadership</h3>
                  <p className="text-sm text-gray-600">Inspiring and guiding others</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Heart className="w-8 h-8 text-royal-blue mx-auto mb-2" />
                  <h3 className="font-semibold text-royal-blue">Service</h3>
                  <p className="text-sm text-gray-600">Commitment to community betterment</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Award className="w-8 h-8 text-royal-blue mx-auto mb-2" />
                  <h3 className="font-semibold text-royal-blue">Character</h3>
                  <p className="text-sm text-gray-600">Integrity and ethical behavior</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* National NHS Information and Faculty Advisor */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Faculty Advisor */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-royal-blue">
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

          {/* National NHS Info */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-royal-blue">
                <Globe className="w-5 h-5 mr-2" />
                National Honor Society
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  The National Honor Society was established in 1921 by the National Association
                  of Secondary School Principals (NASSP). Today, it is the nation&apos;s premier
                  organization established to recognize outstanding high school students.
                </p>
                <p className="text-gray-600">
                  More than just an honor roll, NHS serves to honor those students who have
                  demonstrated excellence in the areas of scholarship, leadership, service,
                  and character.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Did you know?</strong> NHS has more than 1 million students in over
                    24,000 chapters worldwide, making it one of the oldest and most prestigious
                    academic honor societies.
                  </p>
                </div>
                <div className="pt-2">
                  <Button variant="outline" asChild className="w-full">
                    <a href="https://www.nhs.us" target="_blank" rel="noopener noreferrer">
                      Learn More About NHS
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How to Join NHS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Join NHS</h2>
          <p className="text-lg text-gray-600">Understanding the selection process and requirements</p>
        </div>

        {/* Key Principles */}
        <div className="mb-12">
          <Card className="shadow-lg border-l-4 border-royal-blue">
            <CardHeader>
              <CardTitle className="flex items-center text-royal-blue text-xl">
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

        {/* Selection Process */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-royal-blue">
                <BookOpen className="w-5 h-5 mr-2" />
                Selection Process Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-royal-blue">
                <Users className="w-5 h-5 mr-2" />
                What You Need to Know
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold text-royal-blue mb-2">Candidate Information Form</p>
                  <p className="text-sm text-gray-700">
                    This is your opportunity to share specific examples of how you demonstrate Leadership,
                    Service, and Character. Be thorough and provide concrete examples with details.
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-semibold text-green-700 mb-2">Faculty Input Matters</p>
                  <p className="text-sm text-gray-700">
                    Teachers across all departments provide feedback about your character, leadership,
                    and service. Your daily interactions and behavior in all classes are important.
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="font-semibold text-yellow-700 mb-2">All Pillars Are Equal</p>
                  <p className="text-sm text-gray-700">
                    While a 3.75 GPA gets you considered, Leadership, Service, and Character are
                    weighted equally with Scholarship in the final decision.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="font-semibold text-purple-700 mb-2">It&apos;s Competitive</p>
                  <p className="text-sm text-gray-700">
                    Meeting minimum requirements doesn&apos;t guarantee selection. The Faculty Council
                    looks for students who excel in all four pillars.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* The Four Pillars Detailed */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What the Faculty Council Evaluates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-lg border-t-4 border-red-500">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-red-600">Scholarship</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Cumulative GPA 3.75+</li>
                  <li>• Consistent academic performance</li>
                  <li>• Intellectual curiosity</li>
                  <li>• Love of learning</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-t-4 border-orange-500">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-orange-600">Leadership</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Initiative and responsibility</li>
                  <li>• Positive influence on peers</li>
                  <li>• Officer positions in clubs/sports</li>
                  <li>• Problem-solving abilities</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-t-4 border-green-500">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-green-600">Service</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Volunteer work in community</li>
                  <li>• Helping others without recognition</li>
                  <li>• School service activities</li>
                  <li>• Commitment to making a difference</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-t-4 border-blue-500">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-blue-600">Character</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Honesty and integrity</li>
                  <li>• Respectful behavior</li>
                  <li>• Positive discipline record</li>
                  <li>• Reliable and trustworthy</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Important Information */}
        <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-royal-blue">
          <CardHeader>
            <CardTitle className="flex items-center text-royal-blue text-xl">
              <Award className="w-5 h-5 mr-2" />
              Important Information for Prospective Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                <strong>NHS membership is by invitation only.</strong> Students who meet the academic threshold
                will be invited to complete the Candidate Information Form. This is not an application process -
                it&apos;s a selection process where the Faculty Council evaluates your demonstration of all four pillars.
              </p>
              <p className="text-gray-600">
                The Faculty Council consists of five faculty members who review each candidate&apos;s information,
                faculty input, and discipline records. They look for students who not only excel academically
                but also demonstrate consistent leadership, meaningful service, and strong character.
              </p>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  <strong>Questions about the selection process?</strong> Contact your school counselor or
                  reach out to Dr. Morabito at <a href="mailto:pmorabito@gvsd.org" className="text-royal-blue hover:underline">pmorabito@gvsd.org</a>
                  for more information about NHS at Grand Valley High School.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg nhs-gradient text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Get Involved with NHS</h2>
            <p className="text-lg mb-6 text-blue-100">
              Whether you&apos;re seeking tutoring support or interested in learning more about NHS,
              we&apos;re here to help you succeed academically and grow as a leader.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-royal-blue hover:bg-blue-50"
                asChild
              >
                <Link href="/tutoring">Get Tutoring</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-royal-blue"
                asChild
              >
                <a href={`mailto:${advisorInfo.email}`}>Contact Advisor</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}