"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { professors as rawProfessors } from "@/lib/professors";
import { StudentProfile, ScoredProfessor } from "@/lib/types";
import SwipeStack from "@/components/SwipeStack";

export default function SwipePage() {
  const router = useRouter();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [scoredProfessors, setScoredProfessors] = useState<ScoredProfessor[]>([]);
  const [savedProfessors, setSavedProfessors] = useState<ScoredProfessor[]>([]);
  const [loadingState, setLoadingState] = useState<"scoring" | "ready">("scoring");
  const [scoredCount, setScoredCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("studentProfile");
    if (!stored) {
      router.replace("/");
      return;
    }
    const profile: StudentProfile = JSON.parse(stored);
    setStudentProfile(profile);
    scoreAll(profile);
  }, []);

  const scoreAll = async (profile: StudentProfile) => {
    setLoadingState("scoring");

    const results = await Promise.all(
      rawProfessors.map(async (prof) => {
        try {
          const res = await fetch("/api/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentProfile: profile, professor: prof }),
          });
          const data = await res.json();
          setScoredCount((c) => c + 1);
          return {
            ...prof,
            matchScore: typeof data.score === "number" ? Math.min(99, Math.max(1, Math.round(data.score))) : prof.baseScore,
            matchReason: data.reason || "Strong alignment in research areas.",
          } as ScoredProfessor;
        } catch {
          setScoredCount((c) => c + 1);
          return {
            ...prof,
            matchScore: prof.baseScore,
            matchReason: "Strong alignment in research areas.",
          } as ScoredProfessor;
        }
      })
    );

    // Sort by score descending for best experience
    const sorted = [...results].sort((a, b) => b.matchScore - a.matchScore);
    setScoredProfessors(sorted);
    setLoadingState("ready");
  };

  const handleSave = (prof: ScoredProfessor) => {
    setSavedProfessors((prev) => {
      const updated = [...prev, prof];
      localStorage.setItem("savedProfessors", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSkip = (_prof: ScoredProfessor) => {
    // No-op, just move to next card
  };

  const handleDone = () => {
    router.push("/matches");
  };

  if (loadingState === "scoring") {
    return (
      <div className="fade-up flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-6">🔬</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Finding your matches…</h2>
        <p className="text-gray-400 text-sm mb-8">
          Claude is scoring research alignment for each professor
        </p>

        {/* Progress */}
        <div className="w-64 mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Scoring professors</span>
            <span>{scoredCount} / {rawProfessors.length}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${(scoredCount / rawProfessors.length) * 100}%`, backgroundColor: "#D85A30" }}
            />
          </div>
        </div>

        {/* Loading dots */}
        <div className="dot-pulse text-2xl text-gray-300 mt-4">
          <span>·</span><span>·</span><span>·</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Your professor matches</h1>
        {studentProfile && (
          <p className="text-sm text-gray-400">
            Based on your background in{" "}
            <span className="font-semibold" style={{ color: "#D85A30" }}>
              {studentProfile.researchDomains?.slice(0, 2).join(" & ")}
            </span>
          </p>
        )}
      </div>

      <SwipeStack
        professors={scoredProfessors}
        onSave={handleSave}
        onSkip={handleSkip}
        onDone={handleDone}
        savedCount={savedProfessors.length}
      />
    </div>
  );
}
