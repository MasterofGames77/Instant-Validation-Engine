"use client";

import { useState, useEffect } from "react";
import { StartupIdea, GeneratedContent } from "@/types";
import { getFromStorage, STORAGE_KEYS } from "@/lib/storage";

interface LandingPagesListProps {
  onSelectPage: (idea: StartupIdea, content: GeneratedContent) => void;
  onClose: () => void;
}

export default function LandingPagesList({
  onSelectPage,
  onClose,
}: LandingPagesListProps) {
  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedIdeas = getFromStorage<StartupIdea[]>(
      STORAGE_KEYS.STARTUP_IDEAS,
      []
    );
    setIdeas(savedIdeas.reverse()); // Most recent first
    setLoading(false);
  }, []);

  const handleSelectPage = async (idea: StartupIdea) => {
    // Generate content for the selected idea
    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea: idea.idea }),
      });

      if (response.ok) {
        const content = await response.json();
        onSelectPage(idea, content);
      } else {
        // Fallback content
        const content: GeneratedContent = {
          headline: `Revolutionary ${idea.idea}`,
          pitch:
            "Join thousands of early adopters who are already excited about this innovation.",
          cta: "Get Early Access",
          features: [
            "Innovative solution",
            "Easy to use",
            "Game-changing results",
          ],
          industry: "Technology",
        };
        onSelectPage(idea, content);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      // Fallback content
      const content: GeneratedContent = {
        headline: `Revolutionary ${idea.idea}`,
        pitch:
          "Join thousands of early adopters who are already excited about this innovation.",
        cta: "Get Early Access",
        features: [
          "Innovative solution",
          "Easy to use",
          "Game-changing results",
        ],
        industry: "Technology",
      };
      onSelectPage(idea, content);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Landing Pages
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {ideas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📄</div>
              <p>No landing pages created yet.</p>
              <p className="text-sm mt-2">
                Create your first landing page to get started!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectPage(idea)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {idea.idea}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(idea.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-4 text-blue-600 font-medium">View →</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
