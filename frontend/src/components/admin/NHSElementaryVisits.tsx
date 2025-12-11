"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Download, Eye, EyeOff, Shield, ChevronUp, ChevronDown } from "lucide-react";

const capitalizeSchoolName = (schoolValue: string) => {
  if (!schoolValue || schoolValue === 'no-preference') return 'No preference';
  return schoolValue
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ') + ' Elementary';
};

interface StudentVisitData {
  id: string;
  submissionId: string;
  nhsUserId: string;
  name: string;
  email: string;
  school: string;
  teacherLastName: string;
  emergencyContact: string;
  emergencyPhone: string;
  rideStatus: 'available-to-drive' | 'has-own-ride' | 'needs-ride';
  createdAt: string;
}

interface VisitsData {
  students: StudentVisitData[];
  summary: {
    totalStudents: number;
    bySchool: Record<string, number>;
    byRideStatus: Record<string, number>;
  };
}

type SortField = 'name' | 'email' | 'school' | 'teacherLastName' | 'emergencyContact' | 'rideStatus' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function NHSElementaryVisits() {
  const [visitsData, setVisitsData] = useState<VisitsData | null>(null);
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [rideStatusFilter, setRideStatusFilter] = useState('all');
  const [showAddresses, setShowAddresses] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    loadVisitsData();
  }, [schoolFilter, rideStatusFilter]);

  const loadVisitsData = async () => {
    try {
      const params = new URLSearchParams();
      if (schoolFilter !== 'all') params.append('school', schoolFilter);
      if (rideStatusFilter !== 'all') params.append('rideStatus', rideStatusFilter);

      const response = await fetch(`/api/admin/nhs-elementary-visits?${params}`);
      if (response.ok) {
        const data = await response.json();
        setVisitsData(data);
      } else {
        console.error('Failed to load NHS elementary visits data');
      }
    } catch (error) {
      console.error('Error loading NHS elementary visits data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyToggle = () => {
    if (!showAddresses) {
      const confirmed = confirm(
        "⚠️ PRIVACY WARNING ⚠️\\n\\nYou are about to view student addresses and emergency contact information. This information is highly sensitive and should only be accessed for coordination purposes.\\n\\n• Only use this information to facilitate NHS elementary visits\\n• Never share personal information with unauthorized parties\\n• Keep this information confidential\\n• Close this view when not needed\\n\\nDo you need to view private information for coordination purposes?"
      );
      if (confirmed) {
        setShowAddresses(true);
        setMessage("⚠️ Private information view enabled. Remember to keep student information confidential.");
        setTimeout(() => setMessage(""), 5000);
      }
    } else {
      setShowAddresses(false);
      setMessage("Private information view disabled for privacy protection.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedStudents = () => {
    if (!visitsData?.students) return [];

    return [...visitsData.students].sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      // Handle special cases
      if (sortField === 'rideStatus') {
        aVal = getRideStatusDisplay(a.rideStatus);
        bVal = getRideStatusDisplay(b.rideStatus);
      } else if (sortField === 'createdAt') {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  };

  const getRideStatusDisplay = (status: string) => {
    switch (status) {
      case 'available-to-drive': return 'Available to Give Rides';
      case 'has-own-ride': return 'Has Own Ride';
      case 'needs-ride': return 'Needs a Ride';
      default: return status;
    }
  };

  const getRideStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'available-to-drive':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'has-own-ride':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'needs-ride':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        ) : (
          <div className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-royal-blue" />
            NHS Elementary Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading student visits data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-royal-blue" />
            NHS Elementary School Visits - Student Information
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrivacyToggle}
              className={`${showAddresses ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              {showAddresses ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showAddresses ? 'Hide Private Info' : 'Show Private Info'}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Privacy Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 mb-2">🔒 Administrator Privacy Guidelines</h4>
              <div className="text-sm text-red-800 space-y-1">
                <p>• Student personal information is <strong>highly confidential</strong> - only view when necessary</p>
                <p>• Use this data solely for coordinating NHS elementary school visits</p>
                <p>• Never share personal information with unauthorized parties</p>
                <p>• All coordination should prioritize student safety and privacy</p>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-center text-sm ${
            message.includes("WARNING") || message.includes("enabled")
              ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}>
            {message}
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by School</label>
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent"
            >
              <option value="all">All Schools</option>
              <option value="charlestown">Charlestown Elementary</option>
              <option value="sugartown">Sugartown Elementary</option>
              <option value="general-wayne">General Wayne Elementary</option>
              <option value="kd-markley">KD Markley Elementary</option>
              <option value="no-preference">No Preference</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Ride Status</label>
            <select
              value={rideStatusFilter}
              onChange={(e) => setRideStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent"
            >
              <option value="all">All Ride Statuses</option>
              <option value="available-to-drive">Available to Give Rides</option>
              <option value="has-own-ride">Has Own Ride</option>
              <option value="needs-ride">Needs a Ride</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        {visitsData?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{visitsData.summary.totalStudents}</div>
              <div className="text-sm text-blue-800">Total Students</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{visitsData.summary.byRideStatus['available-to-drive'] || 0}</div>
              <div className="text-sm text-green-800">Can Drive</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{visitsData.summary.byRideStatus['needs-ride'] || 0}</div>
              <div className="text-sm text-orange-800">Need Rides</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{visitsData.summary.byRideStatus['has-own-ride'] || 0}</div>
              <div className="text-sm text-purple-800">Own Ride</div>
            </div>
          </div>
        )}

        {/* Students Table */}
        {visitsData?.students && visitsData.students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader field="name">Name</SortableHeader>
                  <SortableHeader field="email">Email</SortableHeader>
                  <SortableHeader field="school">School</SortableHeader>
                  <SortableHeader field="teacherLastName">Teacher</SortableHeader>
                  <SortableHeader field="rideStatus">Ride Status</SortableHeader>
                  {showAddresses && <SortableHeader field="emergencyContact">Emergency Contact</SortableHeader>}
                  <SortableHeader field="createdAt">Registered</SortableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getSortedStudents().map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">ID: {student.nhsUserId}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {capitalizeSchoolName(student.school)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.teacherLastName || 'Not specified'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={getRideStatusBadge(student.rideStatus)}>
                        {getRideStatusDisplay(student.rideStatus)}
                      </span>
                    </td>
                    {showAddresses && (
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="bg-red-100 border border-red-300 rounded p-2">
                          <div className="text-red-800 font-medium text-xs mb-1">⚠️ CONFIDENTIAL</div>
                          <div className="text-sm text-red-700">{student.emergencyContact}</div>
                          <div className="text-xs text-red-600">{student.emergencyPhone}</div>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-lg font-medium">No student registrations found</p>
            <p className="text-sm">Students haven't registered for NHS elementary visits yet, or they don't match your filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}