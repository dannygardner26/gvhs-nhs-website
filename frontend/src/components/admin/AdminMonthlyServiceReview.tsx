"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Check, AlertCircle, Clock, ChevronDown, ChevronUp, Filter, MessageCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { MonthlyServiceSubmission } from '@/lib/types';

interface Comment {
  id: string;
  submission_id: string;
  author_type: 'admin' | 'student';
  author_id: string;
  author_name: string;
  message: string;
  created_at: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getMonthName(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  return `${months[parseInt(month) - 1]} ${year}`;
}

function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function AdminMonthlyServiceReview() {
  const [submissions, setSubmissions] = useState<MonthlyServiceSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [studentFeedback, setStudentFeedback] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  // Conversation thread state
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSubmissions();
  }, [selectedMonth, statusFilter]);

  // Fetch comments when a submission is expanded (for flagged or resubmitted submissions)
  useEffect(() => {
    if (expandedSubmission) {
      const submission = submissions.find(s => s.id === expandedSubmission);
      // Fetch comments for flagged submissions OR resubmitted submissions (which may have conversation history)
      if ((submission?.status === 'flagged' || submission?.resubmitted_at) && !comments[expandedSubmission]) {
        fetchComments(expandedSubmission);
      }
    }
  }, [expandedSubmission, submissions]);

  const fetchSubmissions = async () => {
    try {
      let url = `/api/monthly-service?month=${selectedMonth}`;
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

  const handleReview = async (submission: MonthlyServiceSubmission, status: 'approved' | 'flagged') => {
    try {
      const response = await fetch('/api/monthly-service', {
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
        // Clear the notes for this submission
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

  const fetchComments = async (submissionId: string) => {
    setLoadingComments(prev => ({ ...prev, [submissionId]: true }));
    try {
      const response = await fetch(`/api/monthly-service/${submissionId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(prev => ({ ...prev, [submissionId]: data }));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const handleSendComment = async (submissionId: string) => {
    const commentText = newComment[submissionId]?.trim();
    if (!commentText) return;

    try {
      const response = await fetch(`/api/monthly-service/${submissionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_type: 'admin',
          author_id: 'admin',
          author_name: 'NHS Admin',
          message: commentText
        })
      });

      if (response.ok) {
        setNewComment(prev => ({ ...prev, [submissionId]: '' }));
        fetchComments(submissionId);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending comment:', error);
      setMessage('Error sending message');
    }
  };

  const formatCommentTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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

  // Generate month options for the last 12 months
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      options.push(`${year}-${month}`);
    }
    return options;
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
          <Calendar className="h-5 w-5" />
          Monthly Service Review
        </h2>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border rounded px-3 py-1.5 text-sm"
              >
                {getMonthOptions().map(month => (
                  <option key={month} value={month}>{getMonthName(month)}</option>
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
                  <CardTitle className="text-base">{submission.user_name}</CardTitle>
                  <p className="text-sm text-gray-500">ID: {submission.user_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(submission.status)}
                  {submission.resubmitted_at && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                      🔄 Resubmitted
                    </span>
                  )}
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
                <div className="p-4 bg-gray-50 rounded-lg overflow-hidden">
                  <h4 className="font-medium mb-2">Service Description</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words max-w-full overflow-hidden">{submission.description}</p>
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

                {/* Only show feedback box if NOT flagged (since flagged submissions have feedback in conversation) */}
                {submission.student_feedback && submission.status !== 'flagged' && (
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

                {/* Conversation Thread for Flagged or Resubmitted Submissions */}
                {(submission.status === 'flagged' || submission.resubmitted_at) && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3 border-b">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Conversation Thread
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Communicate with the student about this submission
                      </p>
                    </div>

                    <div className="p-3 max-h-64 overflow-y-auto bg-white">
                      {loadingComments[submission.id] ? (
                        <div className="text-center text-gray-500 py-4 text-sm">Loading messages...</div>
                      ) : comments[submission.id]?.length > 0 ? (
                        <div className="space-y-3">
                          {comments[submission.id].map((comment) => (
                            <div
                              key={comment.id}
                              className={`p-2 rounded-lg ${
                                comment.author_type === 'admin'
                                  ? 'bg-red-50 border border-red-200 ml-4'
                                  : 'bg-blue-50 border border-blue-200 mr-4'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${
                                  comment.author_type === 'admin' ? 'bg-red-500' : 'bg-blue-500'
                                }`}></span>
                                <span className="text-xs font-medium">
                                  {comment.author_type === 'admin' ? 'Admin' : comment.author_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatCommentTime(comment.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.message}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4 text-sm">
                          No messages yet. Start the conversation below.
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-gray-50 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message to the student..."
                          value={newComment[submission.id] || ''}
                          onChange={(e) => setNewComment({ ...newComment, [submission.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendComment(submission.id);
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSendComment(submission.id)}
                          disabled={!newComment[submission.id]?.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}

        {submissions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No submissions for {getMonthName(selectedMonth)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
