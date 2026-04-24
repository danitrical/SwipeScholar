"use client";

import { useEffect, useState } from "react";
import { ScoredProfessor, StudentProfile } from "@/lib/types";

interface EmailDraftProps {
  professor: ScoredProfessor;
  studentProfile: StudentProfile;
  initialEmail?: string;
}

export default function EmailDraft({ professor, studentProfile, initialEmail }: EmailDraftProps) {
  const [email, setEmail] = useState(initialEmail || "");
  const [loading, setLoading] = useState(!initialEmail);
  const [copied, setCopied] = useState(false);

  const draft = async () => {
    setLoading(true);
    setEmail("");
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentProfile, professor }),
      });
      const data = await res.json();
      setEmail(data.email || "Failed to generate email.");
    } catch {
      setEmail("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-draft on first render if no initial email provided
  useEffect(() => {
    if (!initialEmail) {
      draft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToClipboard = async () => {
    if (!email) return;
    const subject = `Research Interest Inquiry — ${professor.researchTags[0]}`;
    const fullText = `To: ${professor.email}\nSubject: ${subject}\n\n${email}`;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Professor header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: professor.avatarColor }}
        >
          {professor.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{professor.name}</p>
          <p className="text-xs text-gray-500 truncate">{professor.email}</p>
        </div>
        <span
          className="text-xs font-bold px-2 py-1 rounded-full"
          style={{ backgroundColor: "#F0F7E6", color: "#639922" }}
        >
          {professor.matchScore}% match
        </span>
      </div>

      {/* Email body */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <div
              className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#D85A30", borderTopColor: "transparent" }}
            />
            <p className="text-sm text-gray-400">Drafting personalized email…</p>
          </div>
        ) : (
          <textarea
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-64 text-sm text-gray-700 leading-relaxed resize-none focus:outline-none font-mono"
            placeholder="Email will appear here…"
          />
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 flex gap-3">
        <button
          onClick={copyToClipboard}
          disabled={loading || !email}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40"
          style={{ borderColor: "#D85A30", color: "#D85A30" }}
        >
          {copied ? "✓ Copied!" : "Copy to clipboard"}
        </button>
        <button
          onClick={draft}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40"
          style={{ backgroundColor: "#D85A30" }}
        >
          {loading ? "Regenerating…" : "↻ Regenerate"}
        </button>
      </div>
    </div>
  );
}
