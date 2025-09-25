"use client";

import { useState, useEffect } from "react";
import { GeneratedContent, SignupData } from "@/types";
import {
  generateId,
  saveToStorage,
  getFromStorage,
  STORAGE_KEYS,
} from "@/lib/storage";

interface GeneratedLandingPageProps {
  content: GeneratedContent;
  startupId: string;
  onSignup: (signup: SignupData) => void;
}

export default function GeneratedLandingPage({
  content,
  startupId,
  onSignup,
}: GeneratedLandingPageProps) {
  const [email, setEmail] = useState("");
  const [wouldPay, setWouldPay] = useState<boolean | null>(null);
  const [pricePoint, setPricePoint] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [source, setSource] = useState<string | undefined>();

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Extract UTM source from URL parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get("s") || urlParams.get("utm_source");
      if (utmSource) {
        setSource(utmSource);
      }
    }
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);

    try {
      // Submit to API
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          startupId,
          source,
          wouldPay: wouldPay,
          pricePoint: pricePoint ? Number(pricePoint) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sign up");
      }

      // Create signup data for local storage and parent notification
      const signup: SignupData = {
        id: generateId(),
        email: email.trim(),
        startupId,
        timestamp: Date.now(),
        source,
        wouldPay: wouldPay || false,
        pricePoint: pricePoint ? Number(pricePoint) : undefined,
      };

      // Save to local storage
      const existingSignups = getFromStorage<SignupData[]>(
        STORAGE_KEYS.SIGNUPS,
        []
      );
      const updatedSignups = [...existingSignups, signup];
      saveToStorage(STORAGE_KEYS.SIGNUPS, updatedSignups);

      // Notify parent component
      onSignup(signup);

      setIsSubmitted(true);
    } catch (error) {
      console.error("Signup error:", error);
      alert("Failed to sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || rating === 0) return;

    setIsSubmittingFeedback(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startupId,
          feedback: feedback.trim(),
          rating,
          source,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      setFeedbackSubmitted(true);
      setFeedback("");
      setRating(0);
    } catch (error) {
      console.error("Feedback error:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          You&apos;re In!
        </h2>
        <p className="text-gray-600">
          Thanks for your interest! We&apos;ll keep you updated on this exciting
          project.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 text-white py-20 px-8 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {content.headline}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed opacity-90">
            {content.pitch}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {content.industry}
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Instant Validation
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-8 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose This Solution?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the key features that make this solution stand out in the
            market
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {content.features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                {feature}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Experience the power of this innovative feature that sets us
                apart from the competition.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Signup Section */}
      <div className="py-16 px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join the early adopters and be the first to experience this
            revolutionary solution
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5 text-indigo-500"
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
                  Get Early Access
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 placeholder-gray-500 text-lg transition-all duration-300 hover:border-gray-300"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Intent Survey */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200">
                <p className="text-base text-gray-700 mb-4 font-medium">
                  💰 Would you pay to keep this page live & get 1-click share
                  assets?
                </p>
                <div className="flex space-x-6 mb-4">
                  <label className="flex items-center text-gray-800 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="wouldPay"
                      value="yes"
                      checked={wouldPay === true}
                      onChange={() => setWouldPay(true)}
                      className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-lg">Yes</span>
                  </label>
                  <label className="flex items-center text-gray-800 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="wouldPay"
                      value="no"
                      checked={wouldPay === false}
                      onChange={() => setWouldPay(false)}
                      className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-lg">No</span>
                  </label>
                </div>

                {wouldPay === true && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What price point interests you?
                    </label>
                    <select
                      value={pricePoint}
                      onChange={(e) => setPricePoint(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base bg-white text-gray-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      <option value="">Select price</option>
                      <option value="0">Free</option>
                      <option value="9">$9/month</option>
                      <option value="19">$19/month</option>
                      <option value="29">$29/month</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:shadow-none flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing Up...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    {content.cta}
                  </>
                )}
              </button>
            </form>

            {/* Feedback Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="text-center mb-6">
                <button
                  onClick={() => setShowFeedback(!showFeedback)}
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium underline decoration-2 underline-offset-4 hover:decoration-indigo-400 transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4"
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
                  {showFeedback ? "Hide feedback form" : "Share your thoughts"}{" "}
                  about this idea
                </button>
              </div>

              {showFeedback && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-3xl border border-gray-200">
                  {feedbackSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Thank you for your feedback!
                      </h3>
                      <p className="text-gray-600">
                        Your input helps us improve and validate this idea.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                      <div>
                        <label className="block text-lg font-semibold text-gray-800 mb-4">
                          ⭐ How would you rate this idea? (1-5 stars)
                        </label>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className={`text-3xl transition-all duration-300 hover:scale-110 ${
                                star <= rating
                                  ? "text-yellow-400"
                                  : "text-gray-300 hover:text-yellow-300"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-lg font-semibold text-gray-800 mb-4">
                          💭 What do you think about this idea?
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Share your thoughts, suggestions, or concerns..."
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-base resize-none bg-white text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                          rows={4}
                          disabled={isSubmittingFeedback}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={
                          isSubmittingFeedback ||
                          !feedback.trim() ||
                          rating === 0
                        }
                        className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:shadow-none flex items-center justify-center gap-3"
                      >
                        {isSubmittingFeedback ? (
                          <>
                            <svg
                              className="w-5 h-5 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                              />
                            </svg>
                            Submit Feedback
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
