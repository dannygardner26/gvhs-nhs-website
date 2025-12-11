"use client";

import React from "react";

interface SubjectsPieChartProps {
  subjects: string[];
  highlightedSubjects: string[];
}

const SUBJECT_CATEGORIES = {
  "Math": [
    "Algebra I", "Algebra II", "Geometry", "Pre-Calculus", "Calculus",
    "Statistics", "AP Calculus AB", "AP Calculus BC", "Math Fundamentals"
  ],
  "Science": [
    "Biology", "Chemistry", "Physics", "Earth Science", "Environmental Science",
    "AP Biology", "AP Chemistry", "AP Physics", "Science Fundamentals"
  ],
  "English": [
    "English/Language Arts", "Reading Comprehension", "Writing", "Literature",
    "AP English Language", "AP English Literature", "Grammar", "Creative Writing"
  ],
  "History": [
    "World History", "US History", "Government", "Economics", "Geography",
    "AP World History", "AP US History", "AP Government", "Civics"
  ],
  "Computer Science": [
    "Computer Science", "Programming", "Web Development", "Python", "Java",
    "JavaScript", "AP Computer Science", "Data Structures"
  ],
  "Languages": [
    "Spanish", "French", "German", "Italian", "Latin", "Chinese", "Japanese",
    "AP Spanish", "AP French", "ESL/English as Second Language"
  ],
  "Other": [
    "Psychology", "Sociology", "Philosophy", "AP Psychology", "Art", "Music Theory",
    "Health", "Physical Education", "Study Skills", "Test Preparation", "SAT Prep", "ACT Prep"
  ]
};

const CATEGORY_COLORS = {
  "Math": "#3B82F6", // Blue
  "Science": "#10B981", // Green
  "English": "#F59E0B", // Orange
  "History": "#EF4444", // Red
  "Computer Science": "#8B5CF6", // Purple
  "Languages": "#EC4899", // Pink
  "Other": "#6B7280", // Gray
};

export function SubjectsPieChart({ subjects, highlightedSubjects }: SubjectsPieChartProps) {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="flex items-center justify-center w-48 h-48 bg-gray-100 rounded-lg">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-1">📊</div>
          <div className="text-sm">No subjects yet</div>
        </div>
      </div>
    );
  }

  // Calculate category counts
  const categoryData = Object.entries(SUBJECT_CATEGORIES).map(([category, categorySubjects]) => {
    const count = subjects.filter(subject => categorySubjects.includes(subject)).length;
    const highlightedCount = subjects.filter(subject =>
      categorySubjects.includes(subject) && highlightedSubjects.includes(subject)
    ).length;
    return {
      category,
      count,
      highlightedCount,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
    };
  }).filter(item => item.count > 0);

  const total = categoryData.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center w-48 h-48 bg-gray-100 rounded-lg">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-1">📊</div>
          <div className="text-sm">No subjects yet</div>
        </div>
      </div>
    );
  }

  // Calculate angles for each category
  let currentAngle = 0;
  const chartData = categoryData.map(item => {
    const percentage = item.count / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    return {
      ...item,
      percentage,
      angle,
      startAngle,
      endAngle
    };
  });

  // SVG path helper functions
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    // Handle special case where we have a full circle (360 degrees)
    if (Math.abs(endAngle - startAngle) >= 359.99) {
      return `M ${x - radius} ${y} A ${radius} ${radius} 0 1 1 ${x + radius} ${y} A ${radius} ${radius} 0 1 1 ${x - radius} ${y}`;
    }

    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", x, y,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const center = 96; // Center of 192x192 SVG
  const radius = 80;

  return (
    <div className="w-48">
      <div className="relative">
        <svg width="192" height="192" className="transform">
          {chartData.map((item, index) => (
            <g key={item.category}>
              {/* Main slice */}
              <path
                d={describeArc(center, center, radius, item.startAngle, item.endAngle)}
                fill={item.color}
                opacity={0.8}
                stroke="white"
                strokeWidth="2"
              />
              {/* Highlighted subjects indicator */}
              {item.highlightedCount > 0 && (
                <path
                  d={describeArc(
                    center,
                    center,
                    radius - 10,
                    item.startAngle,
                    Math.min(
                      item.endAngle,
                      item.startAngle + Math.max(1, (item.angle * item.highlightedCount / item.count))
                    )
                  )}
                  fill="#FCD34D"
                  opacity={0.9}
                  stroke="white"
                  strokeWidth="1"
                />
              )}
            </g>
          ))}
          {/* Center circle */}
          <circle
            cx={center}
            cy={center}
            r="25"
            fill="white"
            stroke="#E5E7EB"
            strokeWidth="2"
          />
          <text
            x={center}
            y={center - 5}
            textAnchor="middle"
            className="text-sm font-semibold fill-gray-700"
          >
            {total}
          </text>
          <text
            x={center}
            y={center + 8}
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            subjects
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {chartData.map((item) => (
          <div key={item.category} className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.category}</span>
              {item.highlightedCount > 0 && (
                <span className="ml-1 text-yellow-600">⭐</span>
              )}
            </div>
            <div className="text-gray-600">
              {item.count} ({Math.round(item.percentage * 100)}%)
            </div>
          </div>
        ))}
        {highlightedSubjects.length > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-yellow-700 font-medium">
              ⭐ {highlightedSubjects.length} highlighted subject{highlightedSubjects.length > 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}