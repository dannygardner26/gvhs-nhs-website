"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Check, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ISPDashboardProps {
  userId: string;
  userName: string;
}

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

export function ISPDashboard({ userId, userName }: ISPDashboardProps) {
  const [submissions, setSubmissions] = useState<ISPSubmission[]>([]);
  const [currentSemester] = useState(getCurrentSemester());
  const [progressUpdate, setProgressUpdate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [userId]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/isp/semester?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);

        // Pre-fill if current semester has a submission
        const currentSubmission = data.find((s: ISPSubmission) => s.quarter === currentSemester);
        if (currentSubmission) {
          setProgressUpdate(currentSubmission.progress_update);
        }
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleSubmit = async () => {
    if (!progressUpdate.trim()) {
      setMessage('Please describe your service project activities.');
      return;
    }

    if (progressUpdate.trim().length < 100) {
      setMessage('Please provide a more detailed description (at least 100 characters for semester summary).');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/isp/semester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          user_name: userName,
          semester: currentSemester,
          progress_update: progressUpdate.trim()
        })
      });

      if (response.ok) {
        setMessage('Semester ISP submission successful!');
        fetchSubmissions();
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      setMessage('Error submitting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSubmission = submissions.find(s => s.quarter === currentSemester);
  const pastSubmissions = submissions.filter(s => s.quarter !== currentSemester);

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
            <AlertCircle className="h-3 w-3" /> Needs Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
            <Clock className="h-3 w-3" /> Submitted
          </span>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Independent Service Project
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Semester Form */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{getSemesterName(currentSemester)}</h3>
              <p className="text-xs text-gray-500">{getSemesterDates(currentSemester)}</p>
            </div>
            {currentSubmission && getStatusBadge(currentSubmission.status)}
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800">
              Describe your independent service project activities for this semester.
              Include what you did, who you helped, and the impact of your work.
            </p>
          </div>

          <Textarea
            placeholder="Describe your independent service project activities for this semester. Be specific about your project goals, progress made, people helped, and the impact of your work..."
            value={progressUpdate}
            onChange={(e) => setProgressUpdate(e.target.value)}
            rows={6}
            disabled={currentSubmission?.status !== 'submitted' && !!currentSubmission}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {progressUpdate.length} characters (minimum 100)
            </span>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (currentSubmission?.status !== 'submitted' && !!currentSubmission)}
            >
              {isSubmitting ? 'Submitting...' : currentSubmission ? 'Update' : 'Submit'}
            </Button>
          </div>

          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          {/* Show feedback for current semester if reviewed */}
          {currentSubmission?.student_feedback && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-medium text-amber-800">Feedback from admin:</p>
              <p className="text-sm text-amber-700 whitespace-pre-wrap">{currentSubmission.student_feedback}</p>
            </div>
          )}
        </div>

        {/* Past Submissions */}
        {pastSubmissions.length > 0 && (
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => setShowHistory(!showHistory)}
            >
              <span>Past Submissions ({pastSubmissions.length})</span>
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showHistory && (
              <div className="mt-3 space-y-3">
                {pastSubmissions.map(submission => (
                  <div key={submission.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-sm">{getSemesterName(submission.quarter)}</span>
                        <p className="text-xs text-gray-500">{getSemesterDates(submission.quarter)}</p>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{submission.progress_update}</p>
                    {submission.student_feedback && (
                      <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                        <p className="text-xs font-medium text-amber-800">Feedback from admin:</p>
                        <p className="text-xs text-amber-700 whitespace-pre-wrap">{submission.student_feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No submissions yet */}
        {submissions.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Submit your first ISP progress update above!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
