"use client";

import { useState } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);

    // Create signup data
    const signup: SignupData = {
      id: generateId(),
      email: email.trim(),
      startupId,
      timestamp: Date.now(),
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
    setIsSubmitting(false);
    setEmail("");
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
            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Signing Up..." : content.cta}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
