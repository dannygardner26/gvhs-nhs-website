"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, ChevronDown, ChevronUp, Trash2, AlertTriangle, Clock } from "lucide-react";

interface UserCardProps {
  user: any; // Using any for now since we know the structure from logs
  onForceCheckout: (userId: string, email: string) => void;
  onChangePin: (email: string) => void; // Changed to use email only
  onDeleteUser: (userId: string, email: string) => void;
  onToggleExpand: (userId: string) => void;
  isExpanded: boolean;
  userSessions: any[];
  userHours: any;
  formatDateTime: (dateString: string) => string;
  formatDuration: (milliseconds: number) => string;
  isDeleting: boolean;
}

export function UserCard({
  user,
  onForceCheckout,
  onChangePin,
  onDeleteUser,
  onToggleExpand,
  isExpanded,
  userSessions,
  userHours,
  formatDateTime,
  formatDuration,
  isDeleting
}: UserCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetPasswordConfirm, setShowResetPasswordConfirm] = useState(false);

  // Use user_id field from database (confirmed from debug logs)
  const userId = user.user_id || user.userId;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(!showDeleteConfirm);
  };

  const handleResetPasswordClick = () => {
    setShowResetPasswordConfirm(!showResetPasswordConfirm);
  };

  const handleResetPasswordConfirm = () => {
    onChangePin(user.email);
    setShowResetPasswordConfirm(false);
  };

  const handleDeleteConfirm = () => {
    onDeleteUser(userId, user.email);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-lg">{user.first_name} {user.last_name}</h3>
            {user.isCheckedIn && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Currently in library
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            <span className="font-medium">User ID:</span> {userId} | <span className="font-medium">Email:</span> {user.email || 'No email provided'}
          </div>
          {user.isCheckedIn && user.checkedInAt && (
            <div className="text-xs text-gray-500 mt-1">
              Checked in: {formatDateTime(user.checkedInAt)}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {user.isCheckedIn && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onForceCheckout(userId, user.email)}
            >
              Force Checkout
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetPasswordClick}
          >
            <Key className="w-4 h-4 mr-1" />
            Reset Password
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleExpand(userId)}
          >
            <Clock className="w-4 h-4 mr-1" />
            Hours
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Reset Password Confirmation */}
      {showResetPasswordConfirm && (
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-blue-800">Reset Password</h4>
          </div>
          <div className="text-sm text-blue-700 mb-3">
            <p>This will generate a new random password for <strong>{user.first_name} {user.last_name}</strong></p>
            <p className="text-xs mt-1">Email: {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleResetPasswordConfirm}
            >
              Generate New Password
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowResetPasswordConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold text-red-800">Delete User Account</h4>
          </div>
          <div className="text-sm text-red-700 mb-3">
            <p className="font-medium">⚠️ WARNING: This action is PERMANENT and cannot be undone!</p>
            <p className="mt-1">This will completely remove:</p>
            <ul className="ml-4 mt-1 list-disc">
              <li>User account ({user.first_name} {user.last_name})</li>
              <li>All check-in/check-out history</li>
              <li>All volunteer session records</li>
              <li>Any opportunity suggestions by this user</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {isDeleting ? "Deleting..." : "Yes, Delete Forever"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Hours Breakdown */}
      {isExpanded && (
        <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-800">Volunteer Hours & Session History</h4>
            </div>

            {userHours ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                  <div className="text-2xl font-bold text-blue-700">
                    {userHours.totalHours}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Total Hours</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                  <div className="text-2xl font-bold text-green-700">
                    {userHours.totalSessions}
                  </div>
                  <div className="text-sm text-green-600 font-medium">Total Sessions</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                  <div className="text-2xl font-bold text-purple-700">
                    {userHours.totalSessions > 0
                      ? `${Math.round((userHours.totalMilliseconds / userHours.totalSessions) / (1000 * 60))}m`
                      : '0m'
                    }
                  </div>
                  <div className="text-sm text-purple-600 font-medium">Avg Session</div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
                <div className="text-gray-500 text-center">Loading volunteer hours...</div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-3 bg-gray-50 rounded-t-lg border-b border-gray-200">
                <h5 className="font-medium text-gray-800">Recent Sessions</h5>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {userSessions && userSessions.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {userSessions.map((session: any, index: number) => (
                      <div key={index} className="p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium text-sm text-gray-800">
                                {formatDateTime(session.checked_in_at)}
                              </div>
                              <span className="text-gray-400">→</span>
                              <div className="font-medium text-sm text-gray-800">
                                {formatDateTime(session.checked_out_at)}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(session.duration_ms || session.duration || 0)}
                              </span>
                              {session.forced_by_admin && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                  Forced Checkout
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <div className="font-medium">No session history</div>
                    <div className="text-sm">Sessions will appear here after check-ins</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}