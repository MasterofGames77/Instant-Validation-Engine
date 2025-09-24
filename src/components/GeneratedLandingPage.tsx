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
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {content.headline}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            {content.pitch}
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {content.features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">✓</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature}</h3>
            </div>
          ))}
        </div>

        {/* Signup Form */}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Get early access - Enter your email below
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Intent Survey */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-3">
                Would you pay to keep this page live & get 1-click share assets?
              </p>
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center text-gray-800 font-medium">
                  <input
                    type="radio"
                    name="wouldPay"
                    value="yes"
                    checked={wouldPay === true}
                    onChange={() => setWouldPay(true)}
                    className="mr-2"
                    disabled={isSubmitting}
                  />
                  Yes
                </label>
                <label className="flex items-center text-gray-800 font-medium">
                  <input
                    type="radio"
                    name="wouldPay"
                    value="no"
                    checked={wouldPay === false}
                    onChange={() => setWouldPay(false)}
                    className="mr-2"
                    disabled={isSubmitting}
                  />
                  No
                </label>
              </div>

              {wouldPay === true && (
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    What price point interests you?
                  </label>
                  <select
                    value={pricePoint}
                    onChange={(e) => setPricePoint(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Signing Up..." : content.cta}
            </button>
          </form>

          {/* Feedback Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center mb-4">
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                {showFeedback ? "Hide" : "Share your thoughts"} about this idea
              </button>
            </div>

            {showFeedback && (
              <div className="bg-gray-50 p-4 rounded-lg">
                {feedbackSubmitted ? (
                  <div className="text-center py-4">
                    <div className="text-green-600 text-2xl mb-2">✓</div>
                    <p className="text-gray-700">
                      Thank you for your feedback!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How would you rate this idea? (1-5 stars)
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl ${
                              star <= rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            } hover:text-yellow-400 transition-colors`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What do you think about this idea?
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share your thoughts, suggestions, or concerns..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        disabled={isSubmittingFeedback}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={
                        isSubmittingFeedback || !feedback.trim() || rating === 0
                      }
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmittingFeedback
                        ? "Submitting..."
                        : "Submit Feedback"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
