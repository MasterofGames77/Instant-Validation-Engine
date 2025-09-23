"use client";

import { useEffect, useState } from "react";
import { Analytics, SignupData } from "@/types";
import { getFromStorage, STORAGE_KEYS } from "@/lib/storage";

interface AnalyticsDashboardProps {
  startupId: string;
  onSignupUpdate: () => void;
}

export default function AnalyticsDashboard({
  startupId,
  onSignupUpdate,
}: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalSignups: 0,
    signupsByStartup: {},
    recentSignups: [],
  });

  useEffect(() => {
    const updateAnalytics = () => {
      const allSignups = getFromStorage<SignupData[]>(STORAGE_KEYS.SIGNUPS, []);
      const startupSignups = allSignups.filter(
        (signup) => signup.startupId === startupId
      );

      setAnalytics({
        totalSignups: startupSignups.length,
        signupsByStartup: { [startupId]: startupSignups.length },
        recentSignups: startupSignups.slice(-5).reverse(), // Last 5 signups, most recent first
      });
    };

    updateAnalytics();

    // Listen for storage changes (when new signups are added)
    const handleStorageChange = () => {
      updateAnalytics();
      onSignupUpdate();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for updates (since localStorage events don't fire in same tab)
    const interval = setInterval(updateAnalytics, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [startupId, onSignupUpdate]);

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Real-time Analytics
      </h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {analytics.totalSignups}
          </div>
          <div className="text-gray-600">Total Signups</div>
        </div>

        <div className="bg-white rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {analytics.recentSignups.length}
          </div>
          <div className="text-gray-600">Recent Signups</div>
        </div>

        <div className="bg-white rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {analytics.recentSignups.length > 0
              ? new Date(
                  analytics.recentSignups[0].timestamp
                ).toLocaleDateString()
              : "No signups yet"}
          </div>
          <div className="text-gray-600">Latest Signup</div>
        </div>
      </div>

      {/* Recent Signups */}
      {analytics.recentSignups.length > 0 && (
        <div className="bg-white rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Signups
          </h4>
          <div className="space-y-2">
            {analytics.recentSignups.map((signup) => (
              <div
                key={signup.id}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
              >
                <span className="text-gray-700">{signup.email}</span>
                <span className="text-sm text-gray-500">
                  {new Date(signup.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.totalSignups === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p>
            No signups yet. Share your landing page to start collecting
            interest!
          </p>
        </div>
      )}
    </div>
  );
}
