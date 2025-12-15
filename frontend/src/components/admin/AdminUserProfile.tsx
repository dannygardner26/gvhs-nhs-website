"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowLeft, Clock, Award, Lightbulb, Heart, BarChart3, GraduationCap, PieChart, TrendingUp, Calendar, Target, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { SubjectsPieChart } from "@/components/charts/SubjectsPieChart";

interface UserProfile {
  user: {
    user_id: string;
    first_name: string;
    last_name: string;
    username?: string;
    email: string;
    tutoring_subjects?: string[];
    highlighted_subjects?: string[];
    created_at: string;
  };
  stats: {
    totalHours: number;
    totalSessions: number;
    totalMilliseconds: number;
  };
  recentSessions: Array<{
    checked_in_at: string;
    checked_out_at: string;
    duration_ms: number;
  }>;
  volunteerInterests: Array<{
    id: string;
    event_id: string;
    message: string;
    status: string;
    created_at: string;
    volunteer_events?: { title: string };
  }>;
  suggestions: Array<{
    id: string;
    opportunity_title: string;
    description: string;
    status: string;
    created_at: string;
  }>;
}

interface TooltipData {
  date: string;
  siteMinutes: number;
  sessions: number;
  x: number;
  y: number;
}

export function AdminUserProfile() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = last week, etc.
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const userId = params.userId as string;

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/profile`);

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch user profile");
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (milliseconds: number) => {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Enhanced Analytics Functions
  const calculateEngagementMetrics = () => {
    if (!profile) return null;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentSessions = profile.recentSessions.filter(session =>
      new Date(session.checked_in_at) >= oneWeekAgo
    );

    const thisMonthSessions = profile.recentSessions.filter(session =>
      new Date(session.checked_in_at) >= oneMonthAgo
    );

    const avgSessionLength = profile.stats.totalSessions > 0
      ? profile.stats.totalMilliseconds / profile.stats.totalSessions
      : 0;

    const longestSession = Math.max(...profile.recentSessions.map(s => s.duration_ms || 0), 0);

    // Calculate activity streak
    const sortedSessions = [...profile.recentSessions]
      .sort((a, b) => new Date(b.checked_in_at).getTime() - new Date(a.checked_in_at).getTime());

    let currentStreak = 0;
    let lastDate = null;
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.checked_in_at).toDateString();
      if (lastDate === null) {
        currentStreak = 1;
        lastDate = sessionDate;
      } else {
        const dayDiff = (new Date(lastDate).getTime() - new Date(sessionDate).getTime()) / (1000 * 60 * 60 * 24);
        if (dayDiff <= 7) { // Within a week
          currentStreak++;
          lastDate = sessionDate;
        } else {
          break;
        }
      }
    }

    return {
      weeklyHours: recentSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0) / (1000 * 60 * 60),
      monthlyHours: thisMonthSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0) / (1000 * 60 * 60),
      avgSessionLength: avgSessionLength / (1000 * 60), // in minutes
      longestSession: longestSession / (1000 * 60), // in minutes
      activityStreak: currentStreak,
      participationScore: Math.min(100,
        (profile.stats.totalSessions * 5) +
        (profile.volunteerInterests.length * 10) +
        (profile.suggestions.length * 15)
      )
    };
  };

  const getActivityTrend = (offset: number = 0) => {
    if (!profile) return [];

    // Calculate start and end dates based on offset
    // Each "week" shows 14 days for better visualization
    const daysPerView = 14;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - (offset * daysPerView));

    const days = Array.from({ length: daysPerView }, (_, i) => {
      const date = new Date(endDate);
      date.setDate(date.getDate() - (daysPerView - 1 - i));
      return {
        date: date.toISOString().split('T')[0],
        displayDate: date,
        sessions: 0,
        tutoringMinutes: 0,
        siteMinutes: 0
      };
    });

    profile.recentSessions.forEach(session => {
      const sessionDate = new Date(session.checked_in_at).toISOString().split('T')[0];
      const dayEntry = days.find(day => day.date === sessionDate);
      if (dayEntry) {
        dayEntry.sessions += 1;
        const totalMinutes = (session.duration_ms || 0) / (1000 * 60);
        dayEntry.siteMinutes += totalMinutes;
        dayEntry.tutoringMinutes += totalMinutes * 0.7;
      }
    });

    return days;
  };

  const getWeekRangeLabel = (offset: number) => {
    const daysPerView = 14;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - (offset * daysPerView));
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (daysPerView - 1));

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const handleBarHover = (event: React.MouseEvent<HTMLDivElement>, day: { date: string; siteMinutes: number; sessions: number }) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const targetRect = event.currentTarget.getBoundingClientRect();

    setTooltip({
      date: day.date,
      siteMinutes: day.siteMinutes,
      sessions: day.sessions,
      x: targetRect.left - rect.left + targetRect.width / 2,
      y: targetRect.top - rect.top - 10
    });
  };

  const handleBarLeave = () => {
    setTooltip(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-8">Loading user profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-8">User not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Panel
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin View: {profile.user.first_name} {profile.user.last_name}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-royal-blue" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <p className="mt-1 p-2 bg-gray-50 rounded border text-gray-900">
                      {profile.user.first_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <p className="mt-1 p-2 bg-gray-50 rounded border text-gray-900">
                      {profile.user.last_name}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">NHS User ID</label>
                  <p className="mt-1 p-2 bg-gray-100 rounded border text-gray-600 font-mono text-center tracking-widest">
                    {profile.user.user_id}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border text-gray-900">
                    {profile.user.email}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Account Created</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border text-gray-900">
                    {formatDateTime(profile.user.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Activity Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-royal-blue" />
                  NHS Activity Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((profile.stats.totalMilliseconds / (1000 * 60 * 60)) * 10) / 10}
                    </div>
                    <div className="text-sm text-blue-800">Total Hours</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profile.stats.totalSessions}</div>
                    <div className="text-sm text-green-800">Sessions</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{profile.volunteerInterests.length}</div>
                    <div className="text-sm text-purple-800">Volunteer Interests</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{profile.suggestions.length}</div>
                    <div className="text-sm text-orange-800">Suggestions</div>
                  </div>
                </div>

                {/* Enhanced Engagement Metrics */}
                {(() => {
                  const metrics = calculateEngagementMetrics();
                  return metrics ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">This Week</span>
                        </div>
                        <div className="text-lg font-bold text-green-600">{metrics.weeklyHours.toFixed(1)}h</div>
                        <div className="text-xs text-gray-600">Weekly Activity</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">Avg Session</span>
                        </div>
                        <div className="text-lg font-bold text-blue-600">{metrics.avgSessionLength.toFixed(0)}min</div>
                        <div className="text-xs text-gray-600">Session Length</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-gray-700">Engagement</span>
                        </div>
                        <div className="text-lg font-bold text-purple-600">{metrics.participationScore}</div>
                        <div className="text-xs text-gray-600">Participation Score</div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </CardContent>
            </Card>

            {/* Activity Timeline & Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-royal-blue" />
                    Daily Activity Breakdown
                  </div>
                  {/* Week Navigation */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWeekOffset(prev => prev + 1)}
                      disabled={weekOffset >= 12}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-normal text-gray-600 min-w-[140px] text-center">
                      {getWeekRangeLabel(weekOffset)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
                      disabled={weekOffset === 0}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const activityData = getActivityTrend(weekOffset);
                  const maxSiteMinutes = Math.max(...activityData.map(d => d.siteMinutes), 1);
                  const totalSiteHours = activityData.reduce((sum, d) => sum + d.siteMinutes, 0) / 60;
                  const totalSessions = activityData.reduce((sum, d) => sum + d.sessions, 0);
                  const avgSessionLength = totalSessions > 0 ? (totalSiteHours * 60) / totalSessions : 0;

                  return (
                    <div className="space-y-6">
                      {/* Summary Stats for Selected Period */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{totalSiteHours.toFixed(1)} hours</div>
                          <div className="text-sm text-blue-800">Total library time</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{totalSessions}</div>
                          <div className="text-sm text-green-800">Check-in sessions</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">{avgSessionLength.toFixed(0)} min</div>
                          <div className="text-sm text-purple-800">Avg session length</div>
                        </div>
                      </div>

                      {/* Interactive Library Time Chart */}
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          Daily Library Time
                        </h4>
                        <div className="relative" ref={chartRef}>
                          {/* Tooltip */}
                          {tooltip && (
                            <div
                              className="absolute z-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg"
                              style={{
                                left: `${tooltip.x}px`,
                                top: `${tooltip.y}px`,
                                transform: 'translate(-50%, -100%)'
                              }}
                            >
                              <div className="font-semibold mb-1">
                                {new Date(tooltip.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-400">Time:</span>
                                  <span className="font-medium">
                                    {tooltip.siteMinutes >= 60
                                      ? `${Math.floor(tooltip.siteMinutes / 60)}h ${Math.round(tooltip.siteMinutes % 60)}m`
                                      : `${Math.round(tooltip.siteMinutes)} min`}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-400">Sessions:</span>
                                  <span className="font-medium">{tooltip.sessions}</span>
                                </div>
                              </div>
                              <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-gray-900 transform -translate-x-1/2 rotate-45"></div>
                            </div>
                          )}

                          <div className="flex items-end justify-between h-24 gap-1 mb-2">
                            {activityData.map((day) => {
                              const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                              const dayNum = new Date(day.date).getDate();
                              const isWeekend = ['Sat', 'Sun'].includes(dayName);

                              return (
                                <div
                                  key={`site-${day.date}`}
                                  className="flex-1 flex flex-col items-center cursor-pointer group"
                                  onMouseEnter={(e) => handleBarHover(e, day)}
                                  onMouseLeave={handleBarLeave}
                                >
                                  <div
                                    className={`w-full rounded-t transition-all duration-200 group-hover:opacity-80 ${
                                      day.siteMinutes > 0
                                        ? isWeekend ? 'bg-blue-300' : 'bg-blue-500'
                                        : 'bg-gray-200'
                                    }`}
                                    style={{
                                      height: `${Math.max((day.siteMinutes / maxSiteMinutes) * 80, day.siteMinutes > 0 ? 6 : 2)}px`,
                                      minHeight: '2px'
                                    }}
                                  />
                                  <div className={`text-xs mt-1 ${isWeekend ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {dayNum}
                                  </div>
                                  <div className={`text-xs ${isWeekend ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {dayName.charAt(0)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            Time spent checked into the NHS library
                          </div>
                        </div>
                      </div>

                      {/* Day-by-day breakdown */}
                      {totalSessions > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Session Details</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            {activityData
                              .filter(d => d.sessions > 0)
                              .slice(-8)
                              .map((day) => (
                                <div key={day.date} className="bg-white p-2 rounded border">
                                  <div className="font-medium text-gray-800">
                                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </div>
                                  <div className="text-gray-600">
                                    {day.siteMinutes >= 60
                                      ? `${Math.floor(day.siteMinutes / 60)}h ${Math.round(day.siteMinutes % 60)}m`
                                      : `${Math.round(day.siteMinutes)} min`}
                                    {' '}({day.sessions} {day.sessions === 1 ? 'session' : 'sessions'})
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <span>Hover over bars for details</span>
                        <span>Use arrows to view previous weeks</span>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Tutoring Subjects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-royal-blue" />
                  Tutoring Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.user.tutoring_subjects && profile.user.tutoring_subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.user.tutoring_subjects.map((subject) => (
                      <span
                        key={subject}
                        className={`px-2 py-1 rounded-full text-xs ${
                          profile.user.highlighted_subjects?.includes(subject)
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 font-medium'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {subject}
                        {profile.user.highlighted_subjects?.includes(subject) && " ⭐"}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No tutoring subjects set</p>
                )}
                {profile.user.highlighted_subjects && profile.user.highlighted_subjects.length > 0 && (
                  <p className="text-xs text-yellow-700 mt-2">
                    ⭐ = Highlighted subjects (shown on tutor status page)
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-royal-blue" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.recentSessions.length > 0 ? (
                  <div className="space-y-2">
                    {profile.recentSessions.map((session, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="text-sm">
                          <div className="font-medium">{formatDateTime(session.checked_in_at)}</div>
                          <div className="text-gray-600">to {formatDateTime(session.checked_out_at)}</div>
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          {formatDuration(session.duration_ms)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent sessions</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-royal-blue" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {profile.user.username || `${profile.user.first_name} ${profile.user.last_name}`.trim()}
                  </div>
                  <div className="text-sm text-gray-600">NHS Member</div>
                  <div className="text-xs text-gray-500 mt-1">ID: {profile.user.user_id}</div>
                </div>
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📚 Sessions: {profile.stats.totalSessions}</p>
                    <p>⏱️ Hours: {Math.round((profile.stats.totalMilliseconds / (1000 * 60 * 60)) * 10) / 10}</p>
                    <p>💡 Suggestions: {profile.suggestions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subjects Overview Chart */}
            {profile.user.tutoring_subjects && profile.user.tutoring_subjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-royal-blue" />
                    Subjects Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <SubjectsPieChart
                    subjects={profile.user.tutoring_subjects}
                    highlightedSubjects={profile.user.highlighted_subjects || []}
                  />
                </CardContent>
              </Card>
            )}

            {/* Volunteer Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-royal-blue" />
                  Volunteer Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.volunteerInterests.length > 0 ? (
                  <div className="space-y-2">
                    {profile.volunteerInterests.slice(0, 5).map((interest) => (
                      <div key={interest.id} className="p-2 bg-gray-50 rounded text-xs">
                        <div className="font-medium">{interest.volunteer_events?.title || 'Unknown Event'}</div>
                        <div className="text-gray-600">{interest.status}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No volunteer interests</p>
                )}
              </CardContent>
            </Card>

            {/* Opportunity Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-royal-blue" />
                  Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.suggestions.length > 0 ? (
                  <div className="space-y-2">
                    {profile.suggestions.slice(0, 3).map((suggestion) => (
                      <div key={suggestion.id} className="p-2 bg-gray-50 rounded text-xs">
                        <div className="font-medium">{suggestion.opportunity_title}</div>
                        <div className={`text-xs ${
                          suggestion.status === 'approved' ? 'text-green-600' :
                          suggestion.status === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {suggestion.status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No suggestions submitted</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}