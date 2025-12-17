"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, User, Mail, Key, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { register, error, isLoading, clearError, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/tutor/profile');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'userId') {
      // Only allow digits and limit to 6 characters
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validation
    if (formData.userId.length !== 6) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const registerData = {
      userId: formData.userId,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim() || undefined,
      password: formData.password.trim(),
    };

    const success = await register(registerData);
    if (success) {
      router.push('/tutor/profile');
    }
  };

  const passwordsMatch = formData.password === formData.confirmPassword;
  const isFormValid =
    formData.userId.length === 6 &&
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.password.length >= 6 &&
    passwordsMatch;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <UserPlus className="w-5 h-5 text-royal-blue" />
            Join NHS Portal
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NHS User ID */}
            <div className="space-y-1">
              <Label htmlFor="userId">Choose Your 6-Digit NHS User PIN *</Label>
              <div className="relative">
                <Input
                  id="userId"
                  name="userId"
                  type="text"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="123456"
                  className="pl-10 tracking-wider font-mono"
                  maxLength={6}
                  required
                />
                <div className="absolute left-3 top-3">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Create a 6-digit PIN you&apos;ll remember - this is NOT your school ID
              </p>
              {formData.userId && formData.userId.length !== 6 && (
                <p className="text-xs text-amber-600">PIN must be exactly 6 digits</p>
              )}
            </div>

            {/* First Name */}
            <div className="space-y-1">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
              />
            </div>

            {/* Email (Optional) */}
            <div className="space-y-1">
              <Label htmlFor="email">Email (Optional)</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@student.gvsd.org"
                  className="pl-10"
                />
                <div className="absolute left-3 top-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                For password recovery and notifications
              </p>
            </div>

            {/* Password Fields */}
            <div className="space-y-1">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="pl-10"
                  minLength={6}
                  required
                />
                <div className="absolute left-3 top-3">
                  <Key className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              {formData.password && formData.password.length < 6 && (
                <p className="text-xs text-amber-600">Password must be at least 6 characters</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="pl-10"
                  required
                />
                <div className="absolute left-3 top-3">
                  <Key className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
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
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-royal-blue font-semibold hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
