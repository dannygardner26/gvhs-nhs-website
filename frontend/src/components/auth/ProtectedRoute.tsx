"use client";

import React, { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, LogIn, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackMessage?: string;
  showLoginButtons?: boolean;
}

export function ProtectedRoute({
  children,
  fallbackMessage = "You need to be logged in to access this page.",
  showLoginButtons = true
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-royal-blue mx-auto mb-4" />
            <p className="text-gray-600">Loading your session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12 flex items-center justify-center px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {fallbackMessage}
            </p>

            {showLoginButtons && (
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    // Trigger login modal - this would need to be implemented
                    // For now, redirect to home page where they can login
                    window.location.href = '/';
                  }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login to Continue
                </Button>

                <p className="text-sm text-gray-500">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => {
                      // Trigger registration modal - this would need to be implemented
                      // For now, redirect to home page where they can register
                      window.location.href = '/';
                    }}
                    className="text-royal-blue hover:underline font-medium"
                  >
                    Register here
                  </button>
                </p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}