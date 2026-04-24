"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScoredProfessor, StudentProfile } from "@/lib/types";
import EmailDraft from "@/components/EmailDraft";

export default function EmailPage() {
  const router = useRouter();
  const [saved, setSaved] = useState<ScoredProfessor[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const rawSaved = localStorage.getItem("savedProfessors");
    const rawProfile = localStorage.getItem("studentProfile");
    const focusId = localStorage.getItem("emailFocusId");

    if (!rawSaved || !rawProfile) {
      router.replace("/");
      return;
    }

    const profs: ScoredProfessor[] = JSON.parse(rawSaved);
    const prof: StudentProfile = JSON.parse(rawProfile);
    setSaved(profs);
    setProfile(prof);

    const firstId = focusId && profs.find((p) => p.id === focusId) ? focusId : profs[0]?.id;
    setActiveId(firstId ?? null);
    localStorage.removeItem("emailFocusId");
  }, []);

  useEffect(() => {
    if (activeId && tabRefs.current[activeId]) {
      tabRefs.current[activeId]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeId]);

  if (!profile || saved.length === 0) {
    return (
      <div className="fade-up flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  const activeProfessor = saved.find((p) => p.id === activeId);

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={() => router.push("/matches")}
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: "#D85A30" }}
          >
            ← Matches
          </button>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Email drafts</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          AI-personalized cold emails for each saved professor
        </p>
      </div>

      {/* Tab bar */}
      {saved.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
          {saved.map((prof) => (
            <button
              key={prof.id}
              ref={(el) => { tabRefs.current[prof.id] = el; }}
              onClick={() => setActiveId(prof.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
              style={{
                backgroundColor: activeId === prof.id ? "#D85A30" : "#F3F4F6",
                color: activeId === prof.id ? "white" : "#6B7280",
              }}
            >
              <span
                className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0"
                style={{
                  backgroundColor: activeId === prof.id ? "rgba(255,255,255,0.25)" : prof.avatarColor,
                  color: "white",
                  fontSize: "10px",
                }}
              >
                {prof.initials}
              </span>
              {prof.name.split(" ").pop()}
            </button>
          ))}
        </div>
      )}

      {/* Active email draft */}
      {activeProfessor && (
        <div key={activeProfessor.id} className="card-enter">
          <EmailDraft professor={activeProfessor} studentProfile={profile} />
        </div>
      )}

      {/* Footer tips */}
      <div className="mt-6 p-4 rounded-2xl border border-gray-100" style={{ backgroundColor: "#FAFAFA" }}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tips</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Edit the email inline before copying — personalize the subject line</li>
          <li>• Send from your university email for higher response rates</li>
          <li>• Follow up once after 2 weeks if no response</li>
        </ul>
      </div>
    </div>
  );
}
