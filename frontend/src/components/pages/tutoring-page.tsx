"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, RefreshCw } from "lucide-react";

export function TutoringPage() {
  const [currentCount, setCurrentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchCurrentCount();

    // Refresh count every 30 seconds
    const interval = setInterval(fetchCurrentCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchCurrentCount = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/checkin/count");
      if (response.ok) {
        const data = await response.json();
        setCurrentCount(data.count);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching count:", error);
      // Use sample count as fallback
      setCurrentCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchCurrentCount();
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-2xl w-full mx-4">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="flex items-center justify-center text-royal-blue text-3xl md:text-4xl font-bold">
              <Users className="w-10 h-10 mr-4" />
              Library Status
            </CardTitle>
            <p className="text-gray-600 text-lg mt-2">
              Students currently in the library
            </p>
          </CardHeader>
          <CardContent className="text-center">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-royal-blue" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <div className="text-8xl md:text-9xl font-bold text-royal-blue mb-4 relative">
                    {currentCount}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent opacity-20 blur-sm">
                      {currentCount}
                    </div>
                  </div>
                  <div className="text-xl text-gray-600 font-medium">
                    {currentCount === 1 ? "Student" : "Students"}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-gray-500 text-sm">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="mt-3 inline-flex items-center text-royal-blue hover:text-blue-700 text-sm font-medium"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </button>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <p className="text-sm text-gray-700">
                    <strong>How to check in:</strong> Scan the QR code in the library or visit the check-in page to register your presence.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}