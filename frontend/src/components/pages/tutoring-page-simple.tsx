"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Users, RefreshCw, UserPlus, Key } from "lucide-react";

interface TutorRegistrationData {
  name: string;
  email: string;
  phone: string;
  grade: string;
  subjects: string[];
  experience: string;
  hasExistingId: boolean;
  existingId: string;
  customPasscode: string;
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
  };
  additionalNotes: string;
}

export function TutoringPageSimple() {

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="text-center pb-6">
            <CardTitle className="flex items-center justify-center text-royal-blue text-3xl font-bold">
              <BookOpen className="w-8 h-8 mr-3" />
              NHS Peer Tutoring
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="p-8 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Coming Soon</h3>
              <p className="text-gray-600">
                The NHS Peer Tutoring registration system is currently being developed.
                Check back soon for more information on how to sign up as a tutor.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              For questions, contact Dr. Paige Morabito at <a href="mailto:pmorabito@gvsd.org" className="text-royal-blue hover:underline">pmorabito@gvsd.org</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}