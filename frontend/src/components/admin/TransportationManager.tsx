"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Users, MapPin, Clock, Shield, Eye, EyeOff, Mail, Phone, CheckCircle, Circle, AlertTriangle } from "lucide-react";

interface TransportationData {
  drivers: any[];
  riders: any[];
  matches: any[];
  summary: any;
  note?: string;
}

export function TransportationManagement() {
  const [transportationData, setTransportationData] = useState<TransportationData | null>(null);
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddresses, setShowAddresses] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTransportationData();
  }, [schoolFilter, typeFilter]);

  const loadTransportationData = async () => {
    try {
      const params = new URLSearchParams();
      if (schoolFilter !== 'all') params.append('school', schoolFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(`/api/admin/transportation?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransportationData(data);
      } else {
        console.error('Failed to load transportation data');
      }
    } catch (error) {
      console.error('Error loading transportation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyToggle = () => {
    if (!showAddresses) {
      // Show warning when enabling address view
      const confirmed = confirm(
        "⚠️ PRIVACY WARNING ⚠️\n\nYou are about to view student addresses. This information is sensitive and should only be accessed for coordination purposes.\n\n• Only use addresses to facilitate transportation matches\n• Never share addresses with other students\n• Keep this information confidential\n• Close this view when not needed\n\nDo you need to view addresses for coordination purposes?"
      );
      if (confirmed) {
        setShowAddresses(true);
        setMessage("⚠️ Address view enabled. Remember to keep student information confidential.");
        setTimeout(() => setMessage(""), 5000);
      }
    } else {
      setShowAddresses(false);
      setMessage("Address view disabled for privacy protection.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const capitalizeSchoolName = (schoolValue: string) => {
    if (!schoolValue || schoolValue === 'no-preference') return 'No preference';
    return schoolValue
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') + ' Elementary';
  };

  const updateMatchStatus = async (matchId: string, newStatus: string) => {
    try {
      // In a real implementation, this would update the database
      // For now, we'll update the local state
      if (transportationData) {
        const updatedMatches = transportationData.matches.map((match: any) => {
          if (match.id === matchId) {
            return { ...match, coordinationStatus: newStatus };
          }
          return match;
        });

        setTransportationData({
          ...transportationData,
          matches: updatedMatches
        });

        const statusText = newStatus === 'contacted' ? 'Students contacted' :
                          newStatus === 'confirmed' ? 'Ride confirmed' : 'Status cleared';
        setMessage(`✅ ${statusText} for match successfully updated`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error('Error updating match status:', error);
      setMessage("❌ Error updating match status");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'contacted':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'contacted':
        return 'Contacted';
      case 'confirmed':
        return 'Confirmed';
      default:
        return 'Not Contacted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contacted':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-royal-blue" />
            Transportation Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading transportation data...</p>
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
            <Car className="w-5 h-5 text-royal-blue" />
            NHS Elementary Transportation Management
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrivacyToggle}
            className={`${showAddresses ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            {showAddresses ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showAddresses ? 'Hide Addresses' : 'View Addresses (Admin)'}
          </Button>
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
                <p>• Student addresses are <strong>highly confidential</strong> - only view when necessary for coordination</p>
                <p>• Never share addresses with other students directly - facilitate contact through NHS channels</p>
                <p>• When arranging matches, provide only general proximity information ("nearby student")</p>
                <p>• All transportation coordination should prioritize student safety and privacy</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Show</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent"
            >
              <option value="all">Drivers & Riders</option>
              <option value="drivers">Drivers Only</option>
              <option value="riders">Riders Only</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        {transportationData?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{transportationData.summary.totalDrivers}</div>
              <div className="text-sm text-blue-800">Drivers</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{transportationData.summary.totalRiders}</div>
              <div className="text-sm text-green-800">Riders</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{transportationData.matches?.length || 0}</div>
              <div className="text-sm text-purple-800">Matches</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{transportationData.summary.totalRequests}</div>
              <div className="text-sm text-yellow-800">Total Requests</div>
            </div>
          </div>
        )}

        {/* Drivers Section */}
        {(typeFilter === 'all' || typeFilter === 'drivers') && transportationData?.drivers && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Car className="w-5 h-5 mr-2 text-blue-600" />
              Student Drivers ({transportationData.drivers.length})
            </h3>
            <div className="space-y-4">
              {transportationData.drivers.map((driver: any) => (
                <div key={driver.id} className="border rounded-lg p-4 bg-green-50 border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="font-medium text-green-900">{driver.name}</p>
                      <p className="text-sm text-green-700">{driver.email}</p>
                      <p className="text-xs text-green-600">NHS ID: {driver.nhsUserId}</p>
                    </div>
                    <div className="text-sm text-green-800">
                      <p><strong>School:</strong> {capitalizeSchoolName(driver.school)}</p>
                      <p><strong>Teacher:</strong> {driver.teacherLastName || 'Not specified'}</p>
                      <p><strong>Capacity:</strong> {driver.passengerCapacity} student{driver.passengerCapacity > 1 ? 's' : ''}</p>
                      <p><strong>Driving Range:</strong> {driver.drivingMinutes} minutes</p>
                    </div>
                    <div className="text-sm text-green-800">
                      {showAddresses ? (
                        <div className="bg-red-100 border border-red-300 rounded p-2">
                          <p className="text-red-800 font-medium text-xs mb-1">⚠️ CONFIDENTIAL ADDRESS</p>
                          <p className="text-red-700">Address would appear here in real system</p>
                        </div>
                      ) : (
                        <p className="text-green-600 italic">Address hidden for privacy</p>
                      )}
                      <div className="mt-2 space-y-1">
                        <p><strong>Emergency:</strong> {driver.emergencyContact}</p>
                        <p className="text-xs">{driver.emergencyPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Riders Section */}
        {(typeFilter === 'all' || typeFilter === 'riders') && transportationData?.riders && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-orange-600" />
              Students Needing Rides ({transportationData.riders.length})
            </h3>
            <div className="space-y-4">
              {transportationData.riders.map((rider: any) => (
                <div key={rider.id} className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="font-medium text-orange-900">{rider.name}</p>
                      <p className="text-sm text-orange-700">{rider.email}</p>
                      <p className="text-xs text-orange-600">NHS ID: {rider.nhsUserId}</p>
                    </div>
                    <div className="text-sm text-orange-800">
                      <p><strong>School:</strong> {capitalizeSchoolName(rider.school)}</p>
                      <p><strong>Teacher:</strong> {rider.teacherLastName || 'Not specified'}</p>
                      <p><strong>Ride Needs:</strong> {
                        rider.rideNeeds === 'to' ? 'TO school only' :
                        rider.rideNeeds === 'from' ? 'FROM school only' :
                        'BOTH directions'
                      }</p>
                    </div>
                    <div className="text-sm text-orange-800">
                      {showAddresses ? (
                        <div className="bg-red-100 border border-red-300 rounded p-2">
                          <p className="text-red-800 font-medium text-xs mb-1">⚠️ CONFIDENTIAL ADDRESS</p>
                          <p className="text-red-700">Address would appear here in real system</p>
                        </div>
                      ) : (
                        <p className="text-orange-600 italic">Address hidden for privacy</p>
                      )}
                      <div className="mt-2 space-y-1">
                        <p><strong>Emergency:</strong> {rider.emergencyContact}</p>
                        <p className="text-xs">{rider.emergencyPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student-Led Ride Sharing Coordination */}
        {typeFilter === 'all' && transportationData?.matches && transportationData.matches.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-purple-600" />
              Student-Led Ride Sharing Coordination ({transportationData.matches.length})
            </h3>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">🤝 Student Coordination Guidelines</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• NHS students coordinate rides directly with each other for elementary school visits</p>
                    <p>• Update status as coordination progresses: <strong>Contacted → Confirmed</strong></p>
                    <p>• Students should confirm pickup times and meeting locations</p>
                    <p>• All coordination prioritizes student safety and reliable transportation</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {transportationData.matches.map((match: any, index: number) => {
                const matchId = match.id || `match-${index}`;
                const currentStatus = match.coordinationStatus || '';
                return (
                  <div key={matchId} className="border rounded-lg p-4 bg-white border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{match.driverName}</div>
                          <div className="text-xs text-green-600 flex items-center justify-center gap-1">
                            <Car className="w-3 h-3" />
                            Driver
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="text-sm">{match.distance} miles</span>
                          <span className="mx-2">→</span>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{match.riderName}</div>
                          <div className="text-xs text-orange-600 flex items-center justify-center gap-1">
                            <Users className="w-3 h-3" />
                            Rider
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs border ${
                          match.compatibility === 'high' ? 'bg-green-100 text-green-800 border-green-300' :
                          match.compatibility === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          'bg-red-100 text-red-800 border-red-300'
                        }`}>
                          {match.compatibility} match
                        </span>
                      </div>
                    </div>

                    {/* Coordination Status Section */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(currentStatus)}
                            <span className={`px-2 py-1 rounded-full text-xs border font-medium ${getStatusColor(currentStatus)}`}>
                              {getStatusText(currentStatus)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            School: <strong>{capitalizeSchoolName(match.school)}</strong>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-gray-500">Update Status:</div>
                          <select
                            value={currentStatus}
                            onChange={(e) => updateMatchStatus(matchId, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Not Contacted</option>
                            <option value="contacted">Contacted</option>
                            <option value="confirmed">Confirmed</option>
                          </select>
                        </div>
                      </div>

                      {/* Progress Indicator */}
                      <div className="mt-3 flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              currentStatus === 'confirmed' ? 'bg-green-500 w-full' :
                              currentStatus === 'contacted' ? 'bg-orange-500 w-1/2' :
                              'bg-gray-300 w-1/4'
                            }`}
                          />
                        </div>
                        <div className="text-xs text-gray-500 min-w-max">
                          {currentStatus === 'confirmed' ? '✅ Ride Confirmed' :
                           currentStatus === 'contacted' ? '📞 Students in Contact' :
                           '🔄 Coordination Needed'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Data Message */}
        {transportationData && (
          (typeFilter === 'drivers' && transportationData.drivers.length === 0) ||
          (typeFilter === 'riders' && transportationData.riders.length === 0) ||
          (typeFilter === 'all' && transportationData.drivers.length === 0 && transportationData.riders.length === 0)
        ) && (
          <div className="text-center py-8 text-gray-500">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-lg font-medium">No transportation requests found</p>
            <p className="text-sm">Students haven't submitted transportation requests yet, or they don't match your filters.</p>
          </div>
        )}

        {/* Mock Data Notice */}
        {transportationData?.note && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> {transportationData.note}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}