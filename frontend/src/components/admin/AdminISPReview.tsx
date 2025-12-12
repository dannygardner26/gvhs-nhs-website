"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Check, AlertCircle, Clock, ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface ISPSubmission {
  id: string;
  project_id: string;
  quarter: string; // stores semester like "2024-Fall"
  progress_update: string;
  status: 'submitted' | 'approved' | 'flagged';
  admin_notes?: string;
  student_feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  independent_projects?: {
    id: string;
    project_title: string;
    user_id: string;
    user_name: string;
  };
}

function getCurrentSemester(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  if (month >= 9 && month <= 12) {
    return `${year}-Fall`;
  } else if (month >= 1 && month <= 5) {
    return `${year}-Spring`;
  } else {
    return `${year}-Fall`;
  }
}

function getSemesterName(semester: string): string {
  const [year, term] = semester.split('-');
  return `${term} ${year}`;
}

function getSemesterDates(semester: string): string {
  const [year, term] = semester.split('-');
  if (term === 'Fall') {
    return `September - December ${year}`;
  } else {
    return `January - May ${year}`;
  }
}

// Get semester options (current and past semesters)
function getSemesterOptions(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const options: string[] = [];

  // Current semester
  if (month >= 9 && month <= 12) {
    options.push(`${year}-Fall`);
    options.push(`${year}-Spring`);
    options.push(`${year - 1}-Fall`);
    options.push(`${year - 1}-Spring`);
  } else if (month >= 1 && month <= 5) {
    options.push(`${year}-Spring`);
    options.push(`${year - 1}-Fall`);
    options.push(`${year - 1}-Spring`);
    options.push(`${year - 2}-Fall`);
  } else {
    // Summer
    options.push(`${year}-Fall`);
    options.push(`${year}-Spring`);
    options.push(`${year - 1}-Fall`);
    options.push(`${year - 1}-Spring`);
  }

  return options;
}

export function AdminISPReview() {
  const [submissions, setSubmissions] = useState<ISPSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState(getCurrentSemester());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [studentFeedback, setStudentFeedback] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [selectedSemester, statusFilter]);

  const fetchSubmissions = async () => {
    try {
      let url = `/api/isp/semester?semester=${selectedSemester}`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (submission: ISPSubmission, status: 'approved' | 'flagged') => {
    try {
      const response = await fetch('/api/isp/semester', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submission.id,
          status,
          admin_notes: adminNotes[submission.id] || null,
          student_feedback: studentFeedback[submission.id] || null,
          reviewed_by: 'admin'
        })
      });

      if (response.ok) {
        setMessage(`Submission ${status}!`);
        fetchSubmissions();
        setExpandedSubmission(null);
        // Clear the notes
        setAdminNotes(prev => {
          const next = { ...prev };
          delete next[submission.id];
          return next;
        });
        setStudentFeedback(prev => {
          const next = { ...prev };
          delete next[submission.id];
          return next;
        });
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to review submission');
      }
    } catch (error) {
      console.error('Error reviewing submission:', error);
      setMessage('Error reviewing submission');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
            <Check className="h-3 w-3" /> Approved
          </span>
        );
      case 'flagged':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
            <AlertCircle className="h-3 w-3" /> Flagged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
    }
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'submitted').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    flagged: submissions.filter(s => s.status === 'flagged').length
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          ISP Semester Review
        </h2>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="border rounded px-3 py-1.5 text-sm"
              >
                {getSemesterOptions().map(semester => (
                  <option key={semester} value={semester}>{getSemesterName(semester)}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              {['all', 'submitted', 'approved', 'flagged'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-sm rounded ${
                    statusFilter === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-500">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.flagged}</div>
            <div className="text-sm text-gray-500">Flagged</div>
          </CardContent>
        </Card>
      </div>

      {message && (
        <p className={`text-sm ${message.includes('Error') || message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}

      {/* Submissions List */}
      <div className="space-y-3">
        {submissions.map(submission => (
          <Card key={submission.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    {submission.independent_projects?.user_name || 'Unknown'}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    ID: {submission.independent_projects?.user_id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(submission.status)}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedSubmission(
                      expandedSubmission === submission.id ? null : submission.id
                    )}
                  >
                    {expandedSubmission === submission.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedSubmission === submission.id && (
              <CardContent className="pt-0 space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600 mb-1">{getSemesterDates(submission.quarter)}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Semester Progress</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{submission.progress_update}</p>
                </div>

                <div className="text-xs text-gray-500">
                  Submitted: {new Date(submission.created_at).toLocaleString()}
                  {submission.reviewed_at && (
                    <> • Reviewed: {new Date(submission.reviewed_at).toLocaleString()}</>
                  )}
                </div>

                {submission.status === 'submitted' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Feedback for Student (visible to them)</label>
                      <Textarea
                        placeholder="Add feedback that the student will see..."
                        value={studentFeedback[submission.id] || ''}
                        onChange={(e) => setStudentFeedback({ ...studentFeedback, [submission.id]: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Internal Notes (admin only, not visible to student)</label>
                      <Textarea
                        placeholder="Add internal notes for other admins..."
                        value={adminNotes[submission.id] || ''}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [submission.id]: e.target.value })}
                        rows={2}
                        className="border-gray-300"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleReview(submission, 'approved')}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReview(submission, 'flagged')}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" /> Flag
                      </Button>
                    </div>
                  </div>
                )}

                {submission.student_feedback && (
                  <div className="p-3 bg-amber-50 rounded border border-amber-200">
                    <p className="text-sm font-medium text-amber-800">Feedback (visible to student):</p>
                    <p className="text-sm text-amber-700 whitespace-pre-wrap break-words">{submission.student_feedback}</p>
                  </div>
                )}

                {submission.admin_notes && (
                  <div className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Internal Notes (admin only):</p>
                    <p className="text-sm text-gray-500 whitespace-pre-wrap break-words">{submission.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}

        {submissions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No submissions for {getSemesterName(selectedSemester)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
