"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScoredProfessor } from "@/lib/types";
import ProfCard from "@/components/ProfCard";

export default function MatchesPage() {
  const router = useRouter();
  const [saved, setSaved] = useState<ScoredProfessor[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("savedProfessors");
    if (!raw) return;
    setSaved(JSON.parse(raw));
  }, []);

  const goToEmail = (profId?: string) => {
    if (profId) {
      localStorage.setItem("emailFocusId", profId);
    }
    router.push("/email");
  };

  if (saved.length === 0) {
    return (
      <div className="fade-up flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">💔</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No matches yet</h2>
        <p className="text-gray-400 text-sm mb-6">Go back and swipe right on some professors!</p>
        <button
          onClick={() => router.push("/swipe")}
          className="px-6 py-3 rounded-xl font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: "#D85A30" }}
        >
          ← Back to swiping
        </button>
      </div>
    );
  }

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Your matches</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {saved.length} professor{saved.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <button
          onClick={() => goToEmail()}
          className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm shadow-md transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: "#D85A30" }}
        >
          ✉️ Draft all emails
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-4">
        {saved.map((prof) => (
          <div key={prof.id} className="card-enter">
            <div className="relative group">
              <ProfCard professor={prof} compact={false} />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => goToEmail(prof.id)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] active:scale-95"
                  style={{ backgroundColor: "#D85A30" }}
                >
                  Draft email ✉️
                </button>
                <button
                  onClick={() => router.push("/swipe")}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:border-gray-300 transition-all"
                >
                  ← Keep swiping
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-8 p-5 rounded-2xl text-center" style={{ backgroundColor: "#FEF3ED" }}>
        <p className="text-sm font-semibold" style={{ color: "#D85A30" }}>
          Ready to reach out?
        </p>
        <p className="text-xs text-gray-500 mt-1 mb-4">
          Claude will write personalized cold emails for each professor.
        </p>
        <button
          onClick={() => goToEmail()}
          className="px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: "#D85A30" }}
        >
          Draft all {saved.length} email{saved.length !== 1 ? "s" : ""} →
        </button>
      </div>
    </div>
  );
}
