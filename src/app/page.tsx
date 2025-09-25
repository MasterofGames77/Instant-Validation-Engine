"use client";

import { useState } from "react";
import IdeaInput from "@/components/IdeaInput";
import GeneratedLandingPage from "@/components/GeneratedLandingPage";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import LandingPagesList from "@/components/LandingPagesList";
import { StartupIdea, GeneratedContent, SignupData } from "@/types";
import { saveToStorage, getFromStorage, STORAGE_KEYS } from "@/lib/storage";

export default function Home() {
  const [currentIdea, setCurrentIdea] = useState<StartupIdea | null>(null);
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showLandingPagesList, setShowLandingPagesList] = useState(false);

  const handleIdeaSubmit = async (idea: StartupIdea) => {
    setIsLoading(true);
    setCurrentIdea(idea);

    try {
      // Save the idea to storage
      const existingIdeas = getFromStorage<StartupIdea[]>(
        STORAGE_KEYS.STARTUP_IDEAS,
        []
      );
      const updatedIdeas = [...existingIdeas, idea];
      saveToStorage(STORAGE_KEYS.STARTUP_IDEAS, updatedIdeas);

      // Generate content using AI
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: idea.idea,
          source: idea.source,
          startupId: idea.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const content = await response.json();
      setGeneratedContent(content);
      setShowAnalytics(true);
    } catch (error) {
      console.error("Error generating content:", error);
      // Fallback content
      setGeneratedContent({
        headline: `Revolutionary ${idea.idea}`,
        pitch: `We're building the future of ${idea.idea}. Join thousands of early adopters who are already excited about this innovation.`,
        cta: "Get Early Access",
        features: [
          "Innovative solution",
          "Easy to use",
          "Game-changing results",
        ],
        industry: "Technology",
      });
      setShowAnalytics(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = (signup: SignupData) => {
    // This will trigger analytics update via the dashboard's useEffect
    console.log("New signup:", signup);
  };

  const handleNewIdea = () => {
    setCurrentIdea(null);
    setGeneratedContent(null);
    setShowAnalytics(false);
  };

  const handleSelectPage = (idea: StartupIdea, content: GeneratedContent) => {
    setCurrentIdea(idea);
    setGeneratedContent(content);
    setShowAnalytics(true);
    setShowLandingPagesList(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {!currentIdea ? (
          <div className="space-y-8">
            <IdeaInput
              onIdeaSubmit={handleIdeaSubmit}
              isLoading={isLoading}
              onViewAllPages={() => setShowLandingPagesList(true)}
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleNewIdea}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Try Another Idea
              </button>
              <div className="text-sm text-gray-500">
                Generated at{" "}
                {new Date(currentIdea.timestamp).toLocaleTimeString()}
              </div>
            </div>

            {/* Generated Landing Page */}
            {generatedContent && (
              <GeneratedLandingPage
                content={generatedContent}
                startupId={currentIdea.id}
                onSignup={handleSignup}
              />
            )}

            {/* Analytics Dashboard */}
            {showAnalytics && (
              <AnalyticsDashboard
                startupId={currentIdea.id}
                onSignupUpdate={() => {}}
              />
            )}
          </div>
        )}

        {/* Landing Pages List Modal */}
        {showLandingPagesList && (
          <LandingPagesList
            onSelectPage={handleSelectPage}
            onClose={() => setShowLandingPagesList(false)}
          />
        )}
      </div>
    </div>
  );
}
