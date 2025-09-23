"use client";

import { useState } from "react";
import { generateId } from "@/lib/storage";
import { StartupIdea } from "@/types";

interface IdeaInputProps {
  onIdeaSubmit: (idea: StartupIdea) => void;
  isLoading: boolean;
}

export default function IdeaInput({ onIdeaSubmit, isLoading }: IdeaInputProps) {
  const [idea, setIdea] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      const startupIdea: StartupIdea = {
        id: generateId(),
        idea: idea.trim(),
        timestamp: Date.now(),
      };
      onIdeaSubmit(startupIdea);
      setIdea("");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Market Pulse</h1>
        <p className="text-xl text-gray-600 mb-8">
          Enter your startup idea and get an instant landing page to test market
          interest
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="idea"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            What&apos;s your startup idea?
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g., AI-powered personal fitness coach that creates custom workout plans based on your schedule and preferences"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
            rows={4}
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !idea.trim()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Generating Landing Page..." : "Generate Landing Page"}
        </button>
      </form>
    </div>
  );
}
