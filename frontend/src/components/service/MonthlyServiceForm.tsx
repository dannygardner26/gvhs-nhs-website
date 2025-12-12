"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Check, Clock, AlertCircle, ChevronDown, ChevronUp, MessageCircle, Send } from 'lucide-react';
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

interface MonthlyServiceFormProps {
  userId: string;
  userName: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getMonthName(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  return `${months[parseInt(month) - 1]} ${year}`;
}

export function MonthlyServiceForm({ userId, userName }: MonthlyServiceFormProps) {
  const [submissions, setSubmissions] = useState<MonthlyServiceSubmission[]>([]);
  const [currentMonth] = useState(getMonthKey(new Date()));
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Conversation thread state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [userId]);

  // Fetch comments for flagged current submission
  useEffect(() => {
    const currentSubmission = submissions.find(s => s.month === currentMonth);
    if (currentSubmission?.status === 'flagged') {
      fetchComments(currentSubmission.id);
    }
  }, [submissions, currentMonth]);

  const fetchComments = async (submissionId: string) => {
    setLoadingComments(true);
    try {
      const response = await fetch(`/api/monthly-service/${submissionId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSendComment = async () => {
    const currentSubmission = submissions.find(s => s.month === currentMonth);
    if (!currentSubmission || !newComment.trim()) return;

    try {
      const response = await fetch(`/api/monthly-service/${currentSubmission.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_type: 'student',
          author_id: userId,
          author_name: userName,
          message: newComment.trim()
        })
      });

      if (response.ok) {
        setNewComment('');
        fetchComments(currentSubmission.id);
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

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/monthly-service?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);

        // Check if current month has submission
        const currentSubmission = data.find((s: MonthlyServiceSubmission) => s.month === currentMonth);
        if (currentSubmission) {
          setDescription(currentSubmission.description);
        }
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setMessage('Please describe your monthly service activities.');
      return;
    }

    if (description.trim().length < 50) {
      setMessage('Please provide a more detailed description (at least 50 characters).');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/monthly-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          user_name: userName,
          month: currentMonth,
          description: description.trim()
        })
      });

      if (response.ok) {
        setMessage('Monthly service submitted successfully!');
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

  const currentSubmission = submissions.find(s => s.month === currentMonth);
  const pastSubmissions = submissions.filter(s => s.month !== currentMonth);

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
          <Calendar className="h-5 w-5" />
          Monthly Service
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Month Form */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{getMonthName(currentMonth)}</h3>
            {currentSubmission && getStatusBadge(currentSubmission.status)}
          </div>

          {/* Conversation Thread for Flagged Submissions */}
          {currentSubmission?.status === 'flagged' && (
            <div className="border rounded-lg overflow-hidden mb-4">
              <div className="bg-red-50 p-3 border-b border-red-200">
                <h4 className="font-medium text-sm flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  Your submission needs attention
                </h4>
                <p className="text-xs text-red-600 mt-1">
                  An admin has flagged this submission. Please review the conversation below and update your description.
                </p>
              </div>

              <div className="bg-gray-50 p-3 border-b">
                <h5 className="font-medium text-sm flex items-center gap-2 text-gray-700">
                  <MessageCircle className="h-4 w-4" />
                  Conversation
                </h5>
              </div>

              <div className="p-3 max-h-48 overflow-y-auto bg-white">
                {loadingComments ? (
                  <div className="text-center text-gray-500 py-4 text-sm">Loading messages...</div>
                ) : comments.length > 0 ? (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-2 rounded-lg ${
                          comment.author_type === 'admin'
                            ? 'bg-red-50 border border-red-200 mr-4'
                            : 'bg-blue-50 border border-blue-200 ml-4'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${
                            comment.author_type === 'admin' ? 'bg-red-500' : 'bg-blue-500'
                          }`}></span>
                          <span className="text-xs font-medium">
                            {comment.author_type === 'admin' ? 'Admin' : 'You'}
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
                    No messages yet. You can reply to the admin below.
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-50 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Reply to admin..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendComment();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={handleSendComment}
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Textarea
            placeholder="Describe the service activities you completed this month. Be specific about what you did, who you helped, and what impact you made..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {description.length} characters (minimum 50)
            </span>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : (currentSubmission?.status === 'flagged' || currentSubmission?.status === 'approved') ? 'Update & Resubmit' : currentSubmission ? 'Update' : 'Submit'}
            </Button>
          </div>

          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
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
                      <span className="font-medium text-sm">{getMonthName(submission.month)}</span>
                      {getStatusBadge(submission.status)}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{submission.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
