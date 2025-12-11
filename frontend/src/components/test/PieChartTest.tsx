"use client";

import { SubjectsPieChart } from "@/components/charts/SubjectsPieChart";

export function PieChartTest() {
  const testSubjects = [
    "Algebra II", "Biology", "Chemistry", "AP Calculus AB",
    "English/Language Arts", "World History", "Spanish",
    "Computer Science", "Statistics"
  ];

  const testHighlighted = ["Biology", "AP Calculus AB", "Computer Science"];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Pie Chart Test</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">With Subjects & Highlights</h2>
            <div className="flex justify-center">
              <SubjectsPieChart
                subjects={testSubjects}
                highlightedSubjects={testHighlighted}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Empty State</h2>
            <div className="flex justify-center">
              <SubjectsPieChart
                subjects={[]}
                highlightedSubjects={[]}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Math Heavy</h2>
            <div className="flex justify-center">
              <SubjectsPieChart
                subjects={["Algebra I", "Algebra II", "Geometry", "Pre-Calculus", "Calculus", "Statistics"]}
                highlightedSubjects={["Algebra II", "Calculus"]}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Balanced Distribution</h2>
            <div className="flex justify-center">
              <SubjectsPieChart
                subjects={["Biology", "Chemistry", "Algebra II", "English/Language Arts", "World History", "Spanish"]}
                highlightedSubjects={["Biology", "Algebra II", "Spanish"]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}