"use client";

import { useState, useEffect } from 'react';

// Automatic logout times in EST (24-hour format)
const AUTO_LOGOUT_TIMES = [
  '07:50', // 7:50 AM
  '08:40', // 8:40 AM
  '09:35', // 9:35 AM
  '10:30', // 10:30 AM
  '11:15', // 11:15 AM
  '11:45', // 11:45 AM
  '12:15', // 12:15 PM
  '12:48', // 12:48 PM
  '13:40', // 1:40 PM
  '14:30', // 2:30 PM
  '17:00'  // 5:00 PM
];

interface AutoLogoutSchedulerProps {
  enabled?: boolean;
  onLogoutTriggered?: (result: Record<string, unknown>) => void;
}

export function AutoLogoutScheduler({
  enabled = true,
  onLogoutTriggered
}: AutoLogoutSchedulerProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [nextLogoutTime, setNextLogoutTime] = useState('');
  const [lastLogoutCheck, setLastLogoutCheck] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const updateTime = () => {
      const now = new Date();
      const estTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now);

      setCurrentTime(estTime);

      // Calculate next logout time
      const currentMinutes = parseInt(estTime.split(':')[0]) * 60 + parseInt(estTime.split(':')[1]);
      let nextTime = null;

      for (const time of AUTO_LOGOUT_TIMES) {
        const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
        if (timeMinutes > currentMinutes) {
          nextTime = time;
          break;
        }
      }

      if (!nextTime) {
        nextTime = AUTO_LOGOUT_TIMES[0] + ' (tomorrow)';
      }

      setNextLogoutTime(nextTime);

      // Check if we need to trigger auto-logout
      if (AUTO_LOGOUT_TIMES.includes(estTime) && lastLogoutCheck !== estTime && !isProcessing) {
        triggerAutoLogout(estTime);
      }
    };

    // Update immediately
    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [enabled, lastLogoutCheck, isProcessing]);

  const triggerAutoLogout = async (time: string) => {
    setIsProcessing(true);
    setLastLogoutCheck(time);

    try {
      console.log(`Triggering auto-logout at ${time} EST`);

      const response = await fetch('/api/checkin/admin/auto-logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      console.log('Auto-logout result:', result);

      if (onLogoutTriggered) {
        onLogoutTriggered(result);
      }

    } catch (error) {
      console.error('Error triggering auto-logout:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const manualTrigger = async () => {
    await triggerAutoLogout(currentTime);
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-semibold text-blue-800 mb-2">🕐 Automatic Logout Scheduler</h3>
      <div className="text-sm space-y-2">
        <div>
          <span className="font-medium">Current Time (EST):</span> {currentTime}
        </div>
        <div>
          <span className="font-medium">Next Auto-Logout:</span> {nextLogoutTime}
        </div>
        <div className="text-xs text-blue-600">
          <span className="font-medium">Schedule:</span> {AUTO_LOGOUT_TIMES.join(', ')} EST
        </div>
        {isProcessing && (
          <div className="text-blue-600 font-medium">
            🔄 Processing auto-logout...
          </div>
        )}
      </div>

      <button
        onClick={manualTrigger}
        disabled={isProcessing}
        className="mt-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Manual Trigger'}
      </button>
    </div>
  );
}