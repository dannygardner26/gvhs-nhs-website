"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Mail, Key, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const [userIdOrEmail, setUserIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading, clearError } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login(userIdOrEmail.trim(), password);
    if (success) {
      onClose();
      setUserIdOrEmail('');
      setPassword('');
    }
  };

  const handleClose = () => {
    onClose();
    clearError();
    setUserIdOrEmail('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-royal-blue" />
              Login to NHS Portal
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email or User PIN Field */}
            <div className="space-y-1">
              <Label htmlFor="userIdOrEmail">Email or NHS User PIN</Label>
              <div className="relative">
                <Input
                  id="userIdOrEmail"
                  type="text"
                  value={userIdOrEmail}
                  onChange={(e) => setUserIdOrEmail(e.target.value)}
                  placeholder="your.email@student.gvsd.org or 123456"
                  className="pl-10"
                  required
                />
                <div className="absolute left-3 top-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                  required
                />
                <div className="absolute left-3 top-3">
                  <Key className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !userIdOrEmail.trim() || !password.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </form>

          {/* Registration Link */}
          <div className="text-center pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Button
                variant="ghost"
                size="sm"
                onClick={onSwitchToRegister}
                className="text-royal-blue p-0 h-auto font-semibold"
              >
                Register here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}