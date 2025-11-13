import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  BookOpen,
  Users,
  Heart,
  Mail
} from "lucide-react";

export function HomePage() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white py-4">
      <div className="max-w-5xl mx-auto px-4 flex-1 flex flex-col">

        {/* Compact Hero */}
        <section className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GVHS National Honor Society
          </h1>
          <p className="text-gray-600">
            Service • Leadership • Scholarship • Character
          </p>
        </section>

        {/* Main Content - Single Row */}
        <section className="flex-1 grid lg:grid-cols-3 gap-6">

          {/* Four Pillars */}
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <h2 className="font-bold text-royal-blue mb-4 text-center">Four Pillars</h2>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <BookOpen className="w-6 h-6 text-royal-blue mx-auto mb-1" />
                  <p className="text-sm font-semibold">Scholarship</p>
                  <p className="text-xs text-gray-600">3.75+ GPA</p>
                </div>
                <div>
                  <Heart className="w-6 h-6 text-royal-blue mx-auto mb-1" />
                  <p className="text-sm font-semibold">Service</p>
                  <p className="text-xs text-gray-600">Monthly projects</p>
                </div>
                <div>
                  <Users className="w-6 h-6 text-royal-blue mx-auto mb-1" />
                  <p className="text-sm font-semibold">Leadership</p>
                  <p className="text-xs text-gray-600">Inspire others</p>
                </div>
                <div>
                  <Award className="w-6 h-6 text-royal-blue mx-auto mb-1" />
                  <p className="text-sm font-semibold">Character</p>
                  <p className="text-xs text-gray-600">High standards</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Requirements */}
          <Card className="shadow-lg border-l-4 border-royal-blue">
            <CardContent className="p-4">
              <h2 className="font-bold text-royal-blue mb-4">Member Requirements</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold">Monthly Meetings</p>
                  <p className="text-xs text-gray-600">Attend 1 per month (AM or PM option)</p>
                </div>
                <div>
                  <p className="font-semibold">Service Projects</p>
                  <p className="text-xs text-gray-600">Chapter service + Individual project</p>
                </div>
                <div>
                  <p className="font-semibold">Academic Standing</p>
                  <p className="text-xs text-gray-600">Maintain 3.75+ GPA</p>
                </div>
                <div className="bg-blue-50 p-2 rounded text-center">
                  <p className="font-semibold text-royal-blue">Annual Dues: $20</p>
                  <p className="text-xs text-gray-600">Due by September 12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <h2 className="font-bold text-royal-blue mb-4">Faculty Advisor</h2>
              <div className="text-center space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Dr. Paige Morabito</h3>
                  <p className="text-sm text-gray-600">NHS Faculty Advisor</p>
                  <p className="text-xs text-gray-600">Room 130</p>
                </div>

                <div className="flex items-center justify-center text-sm">
                  <Mail className="w-4 h-4 text-royal-blue mr-2" />
                  <a href="mailto:pmorabito@gvsd.org" className="text-royal-blue hover:underline">
                    pmorabito@gvsd.org
                  </a>
                </div>

                <Button asChild className="w-full bg-royal-blue hover:bg-blue-700 text-sm">
                  <a href="mailto:pmorabito@gvsd.org">
                    Contact Dr. Morabito
                  </a>
                </Button>

                <div className="bg-blue-50 p-2 rounded">
                  <p className="text-xs font-medium">ISP Questions?</p>
                  <p className="text-xs text-gray-600">Contact before Sept 19, 2026</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </section>

        {/* Bottom Mission */}
        <section className="mt-6">
          <Card className="bg-royal-blue text-white text-center">
            <CardContent className="py-4 px-6">
              <p className="text-sm font-medium">
                "Membership in NHS is an honor and privilege - we uphold Service, Leadership, Scholarship, and Character"
              </p>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}