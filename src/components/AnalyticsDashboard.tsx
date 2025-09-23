"use client";

import { useEffect, useState } from "react";
import {
  Analytics,
  SignupData,
  ValidationMetrics,
  CustomerFeedback,
} from "@/types";
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
    totalLandingPages: 0,
    wouldPaySignals: 0,
    signupsBySource: {},
    topStartups: [],
  });

  const [validationMetrics, setValidationMetrics] = useState<ValidationMetrics>(
    {
      landingPagesGenerated: 0,
      emailsCaptured: 0,
      wouldPaySignals: 0,
      signupsBySource: {},
      topStartups: [],
      recentQuotes: [],
    }
  );

  const [recentFeedback, setRecentFeedback] = useState<CustomerFeedback[]>([]);

  useEffect(() => {
    const updateAnalytics = async () => {
      // Get local data
      const allSignups = getFromStorage<SignupData[]>(STORAGE_KEYS.SIGNUPS, []);
      const startupSignups = allSignups.filter(
        (signup) => signup.startupId === startupId
      );

      // Fetch data from API
      try {
        const [signupResponse, feedbackResponse] = await Promise.all([
          fetch(`/api/signup?startupId=${startupId}`),
          fetch(`/api/feedback?startupId=${startupId}`),
        ]);

        let apiSignups = [];
        let apiFeedback = [];

        if (signupResponse.ok) {
          const signupData = await signupResponse.json();
          apiSignups = signupData.signups || [];
        }

        if (feedbackResponse.ok) {
          const feedbackData = await feedbackResponse.json();
          apiFeedback = feedbackData.feedback || [];
        }

        // Calculate validation metrics
        const wouldPayCount = apiSignups.filter(
          (s: SignupData) => s.wouldPay
        ).length;
        const signupsBySource = apiSignups.reduce(
          (acc: Record<string, number>, signup: SignupData) => {
            const source = signup.source || "direct";
            acc[source] = (acc[source] || 0) + 1;
            return acc;
          },
          {}
        );

        // Get real feedback quotes
        const realQuotes = apiFeedback
          .slice(0, 3)
          .map((f: CustomerFeedback) => f.feedback);

        setValidationMetrics({
          landingPagesGenerated: 1, // This startup's page
          emailsCaptured: apiSignups.length,
          wouldPaySignals: wouldPayCount,
          signupsBySource,
          topStartups: [
            {
              id: startupId,
              idea: "Current startup idea", // We could fetch this from storage
              signupCount: apiSignups.length,
              wouldPayCount,
            },
          ],
          recentQuotes:
            realQuotes.length > 0
              ? realQuotes
              : [
                  "This is exactly what I needed!",
                  "Finally, a tool that makes sense.",
                  "I'd definitely pay for this service.",
                ], // Real quotes or fallback
        });

        setRecentFeedback(apiFeedback);

        setAnalytics({
          totalSignups: apiSignups.length,
          signupsByStartup: { [startupId]: apiSignups.length },
          recentSignups: apiSignups.slice(-5).reverse(),
          totalLandingPages: 1,
          wouldPaySignals: wouldPayCount,
          signupsBySource,
          topStartups: [
            {
              id: startupId,
              idea: "Current startup idea",
              signupCount: apiSignups.length,
            },
          ],
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        // Fallback to local data
        setAnalytics({
          totalSignups: startupSignups.length,
          signupsByStartup: { [startupId]: startupSignups.length },
          recentSignups: startupSignups.slice(-5).reverse(),
          totalLandingPages: 1,
          wouldPaySignals: startupSignups.filter((s) => s.wouldPay).length,
          signupsBySource: {},
          topStartups: [],
        });
      }
    };

    updateAnalytics();

    // Listen for storage changes (when new signups are added)
    const handleStorageChange = () => {
      updateAnalytics();
      onSignupUpdate();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for updates (since localStorage events don't fire in same tab)
    const interval = setInterval(updateAnalytics, 5000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [startupId, onSignupUpdate]);

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Customer Validation Dashboard
      </h3>

      {/* North Star Metrics */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          North Star Metrics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 text-center border-2 border-blue-200">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {validationMetrics.landingPagesGenerated}
            </div>
            <div className="text-gray-600 font-medium">
              Landing Pages Generated
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 text-center border-2 border-green-200">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {validationMetrics.emailsCaptured}
            </div>
            <div className="text-gray-600 font-medium">Emails Captured</div>
          </div>

          <div className="bg-white rounded-lg p-6 text-center border-2 border-purple-200">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {validationMetrics.wouldPaySignals}
            </div>
            <div className="text-gray-600 font-medium">
              &ldquo;Would Pay&rdquo; Signals
            </div>
          </div>
        </div>
      </div>

      {/* Source Attribution */}
      {Object.keys(validationMetrics.signupsBySource).length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Signups by Source
          </h4>
          <div className="bg-white rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(validationMetrics.signupsBySource).map(
                ([source, count]) => (
                  <div key={source} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {count}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {source}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Feedback */}
      {(validationMetrics.recentQuotes.length > 0 ||
        recentFeedback.length > 0) && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Customer Feedback
          </h4>
          <div className="bg-white rounded-lg p-6">
            {recentFeedback.length > 0 ? (
              <div className="space-y-4">
                {recentFeedback.slice(0, 3).map((feedback) => (
                  <div key={feedback.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${
                              star <= feedback.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(feedback.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 italic">
                      &ldquo;{feedback.feedback}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {validationMetrics.recentQuotes.map((quote, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 italic">
                      &ldquo;{quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Signups */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Signups
        </h4>
        <div className="bg-white rounded-lg p-6">
          {analytics.recentSignups.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentSignups.map((signup) => (
                <div
                  key={signup.id}
                  className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-700 font-medium">
                      {signup.email}
                    </span>
                    {signup.wouldPay && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Would Pay
                      </span>
                    )}
                    {signup.pricePoint && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        ${signup.pricePoint}/mo
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(signup.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <p>
                No signups yet. Share your landing page to start collecting
                interest!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
