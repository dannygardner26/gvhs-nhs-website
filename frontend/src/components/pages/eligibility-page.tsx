"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, BookOpen, Users, Heart, Award, Calendar, Mail } from "lucide-react";
import Link from "next/link";

export function EligibilityPage() {
  const pillars = [
    {
      name: "Scholarship",
      icon: <BookOpen className="w-8 h-8" />,
      description: "Cumulative GPA of 3.75 or higher",
      details: [
        { text: "GPA of 3.75 verified by the school", bold: true },
        { text: "This is the first requirement to become a candidate", bold: false },
        { text: "Honor roll alone is not sufficient - you need to demonstrate the other pillars as well", bold: false }
      ],
      color: "bg-blue-500"
    },
    {
      name: "Leadership",
      icon: <Award className="w-8 h-8" />,
      description: "Active leadership in school or community",
      details: [
        { text: "At least 1 example of leadership in school AND 1 example in community", bold: true },
        { text: "Active and effective participation in positions of responsibility", bold: false },
        { text: "Not just an elected position - show WHY you were chosen to lead", bold: false },
        { text: "Provide specific examples of HOW you supported others with your leadership", bold: false }
      ],
      color: "bg-yellow-500"
    },
    {
      name: "Service",
      icon: <Heart className="w-8 h-8" />,
      description: "Consistent volunteer service to school AND community",
      details: [
        { text: "At least 1 example of service in school AND 1 example in community", bold: true },
        { text: "Unpaid work helping others outside your family", bold: false },
        { text: "Consistent, sustained service is valued over one-time events", bold: false },
        { text: "Quality over quantity - detailed examples matter more than number of activities", bold: false }
      ],
      color: "bg-green-500"
    },
    {
      name: "Character",
      icon: <Users className="w-8 h-8" />,
      description: "Integrity, ethics, and cooperation",
      details: [
        { text: "Verified by your faculty reference", bold: true },
        { text: "You'll need a teacher who can speak to your character - ask them first!", bold: false },
        { text: "Discipline referrals may affect your candidacy", bold: false },
        { text: "Character is evaluated through faculty comments and recommendations", bold: false }
      ],
      color: "bg-purple-500"
    }
  ];

  const timeline = [
    {
      date: "September 16, 2025",
      time: "8:00 AM",
      event: "Candidate Information Form Deadline",
      description: "Form closes at 8:00 AM sharp - do NOT wait until the night before!"
    },
    {
      date: "September - October",
      time: "",
      event: "Review Process",
      description: "Faculty Council reviews forms and gathers faculty input on candidates"
    },
    {
      date: "On or before October 28, 2025",
      time: "",
      event: "Selection Notification",
      description: "Selection and non-selection notices sent to candidates' GVSD email"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-royal-blue mb-4">
            GVHS National Honor Society
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Selection Process & Eligibility Requirements
          </p>
        </div>

        {/* Purpose Statement */}
        <Card className="mb-8 border-royal-blue border-2">
          <CardContent className="p-6">
            <p className="text-lg text-gray-700 text-center italic">
              &quot;The purpose of this chapter shall be to create an enthusiasm for scholarship,
              to stimulate a desire to render service, to promote worthy leadership, and to
              encourage the development of character in students of Great Valley High School.&quot;
            </p>
          </CardContent>
        </Card>

        {/* Key Points */}
        <Card className="mb-8 bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800">Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-amber-900">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span><strong>Membership is a privilege, not a right</strong> - It&apos;s an invitation to be a candidate for selection, not an application or election</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span><strong>All Four Pillars are required</strong> - GVHS NHS requires demonstration of Scholarship, Leadership, Service, AND Character</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span><strong>Quality over quantity</strong> - Consistent, sustained involvement in fewer activities is better than minimal activity in many</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* The Four Pillars */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          The Four Pillars of NHS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {pillars.map((pillar) => (
            <Card key={pillar.name} className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${pillar.color} text-white`}>
                    {pillar.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{pillar.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{pillar.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  {pillar.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 ${detail.bold ? 'bg-royal-blue' : 'bg-gray-400'} rounded-full mt-2 flex-shrink-0`}></span>
                      <span className={detail.bold ? 'font-bold text-gray-900' : ''}>{detail.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Timeline */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          2025 Selection Timeline
        </h2>
        <Card className="mb-10">
          <CardContent className="p-6">
            <div className="space-y-6">
              {timeline.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-royal-blue text-white flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    {idx < timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  <div className="pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-royal-blue" />
                      <span className="font-bold text-royal-blue">{item.date}</span>
                      {item.time && (
                        <span className="text-red-600 font-bold">@ {item.time}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{item.event}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Candidate Information Form Tips */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tips for the Candidate Information Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What You'll Need:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-royal-blue">1.</span>
                    <span>Teacher who will speak to your character (ask them first)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-royal-blue">2.</span>
                    <span>Any discipline referrals (if applicable)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-royal-blue">3.</span>
                    <span>Examples of service in school & local community</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-royal-blue">4.</span>
                    <span>Examples of leadership in school & local community</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Pro Tips:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Write responses in Word first, then paste into the form</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Be specific and detailed, but concise (100 word limit for some sections)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>All examples must be verifiable by a contact person</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>You don&apos;t need 4 examples - quality beats quantity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Don&apos;t rush - submit before the deadline, not at 7:59 AM</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Contact */}
        <div className="text-center mt-8 text-gray-600">
          <p>Questions about NHS eligibility or the selection process?</p>
          <p>
            Contact <strong>Dr. Morabito</strong> at{" "}
            <a href="mailto:pmorabito@gvsd.org" className="text-royal-blue hover:underline">
              pmorabito@gvsd.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
