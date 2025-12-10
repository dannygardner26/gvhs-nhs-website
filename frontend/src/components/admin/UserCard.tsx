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
        <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
          <h4 className="font-semibold text-sm mb-3">Session History & Total Hours</h4>

          {userHours && (
            <div className="mb-3 p-2 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-800">
                Total Hours: {userHours.totalHours}
              </div>
              <div className="text-sm text-blue-600">
                Total Sessions: {userHours.totalSessions}
              </div>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto">
            {userSessions && userSessions.length > 0 ? (
              <div className="space-y-2">
                {userSessions.map((session: any, index: number) => (
                  <div key={index} className="text-xs bg-white p-2 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {formatDateTime(session.checkedInAt)} → {formatDateTime(session.checkedOutAt)}
                        </div>
                        <div className="text-gray-500 mt-1">
                          Duration: {formatDuration(session.duration)}
                          {session.forcedByAdmin && (
                            <span className="text-red-500 ml-2">(Force checkout by admin)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No session history available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}