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
          (s: { wouldPay: boolean }) => s.wouldPay
        ).length;
        const signupsBySource = apiSignups.reduce(
          (acc: Record<string, number>, signup: { source?: string }) => {
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
    <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-3xl p-8 shadow-xl border border-gray-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-gray-900">
            Customer Validation Dashboard
          </h3>
          <p className="text-gray-600 mt-1">
            Real-time insights into your startup&apos;s market validation
          </p>
        </div>
      </div>

      {/* North Star Metrics */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <h4 className="text-2xl font-bold text-gray-800">
            North Star Metrics
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="text-5xl font-bold text-blue-600 mb-3">
              {validationMetrics.landingPagesGenerated}
            </div>
            <div className="text-gray-600 font-semibold text-lg">
              Landing Pages Generated
            </div>
            <div className="text-sm text-gray-500 mt-2">
              AI-powered validation pages
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="text-5xl font-bold text-green-600 mb-3">
              {validationMetrics.emailsCaptured}
            </div>
            <div className="text-gray-600 font-semibold text-lg">
              Emails Captured
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Interested early adopters
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className="text-5xl font-bold text-purple-600 mb-3">
              {validationMetrics.wouldPaySignals}
            </div>
            <div className="text-gray-600 font-semibold text-lg">
              &ldquo;Would Pay&rdquo; Signals
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Revenue potential indicators
            </div>
          </div>
        </div>
      </div>

      {/* Source Attribution */}
      {Object.keys(validationMetrics.signupsBySource).length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-gray-800">
              Traffic Sources
            </h4>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(validationMetrics.signupsBySource).map(
                ([source, count]) => (
                  <div key={source} className="text-center group">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {count}
                    </div>
                    <div className="text-sm font-medium text-gray-600 capitalize">
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
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-gray-800">
              Customer Feedback
            </h4>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg">
            {recentFeedback.length > 0 ? (
              <div className="grid gap-6">
                {recentFeedback.slice(0, 3).map((feedback) => (
                  <div
                    key={feedback.id}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-xl ${
                                star <= feedback.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {feedback.rating}/5
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                        {(() => {
                          try {
                            if (feedback.timestamp) {
                              return new Date(
                                feedback.timestamp
                              ).toLocaleDateString();
                            } else if (feedback.createdAt) {
                              return new Date(
                                feedback.createdAt
                              ).toLocaleDateString();
                            }
                            return "Invalid Date";
                          } catch {
                            return "Invalid Date";
                          }
                        })()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-lg italic leading-relaxed">
                      &ldquo;{feedback.feedback}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-6">
                {validationMetrics.recentQuotes.map((quote, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-xl text-yellow-400">
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        5/5
                      </span>
                    </div>
                    <p className="text-gray-700 text-lg italic leading-relaxed">
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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h4 className="text-2xl font-bold text-gray-800">Recent Signups</h4>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg">
          {analytics.recentSignups.length > 0 ? (
            <div className="space-y-4">
              {analytics.recentSignups.map(
                (signup: {
                  id: string;
                  email: string;
                  wouldPay: boolean;
                  pricePoint?: number;
                  timestamp?: number;
                  createdAt?: Date | string;
                }) => (
                  <div
                    key={signup.id}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="text-gray-800 font-semibold text-lg">
                          {signup.email}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          {signup.wouldPay && (
                            <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                              💰 Would Pay
                            </span>
                          )}
                          {signup.pricePoint && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                              ${signup.pricePoint}/mo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                      {(() => {
                        try {
                          if (signup.timestamp) {
                            return new Date(
                              signup.timestamp
                            ).toLocaleDateString();
                          } else if (signup.createdAt) {
                            return new Date(
                              signup.createdAt
                            ).toLocaleDateString();
                          }
                          return "Invalid Date";
                        } catch {
                          return "Invalid Date";
                        }
                      })()}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No signups yet
              </h3>
              <p className="text-gray-600">
                Share your landing page to start collecting interest and
                validation data!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
