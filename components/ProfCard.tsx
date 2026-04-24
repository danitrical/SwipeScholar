"use client";

import { ScoredProfessor } from "@/lib/types";

interface ProfCardProps {
  professor: ScoredProfessor;
  compact?: boolean;
}

const fundingColors: Record<string, string> = {
  "NSF Funded": "bg-blue-100 text-blue-700",
  "DARPA Funded": "bg-purple-100 text-purple-700",
  "NIH Funded": "bg-green-100 text-green-700",
  "Industry Sponsored": "bg-orange-100 text-orange-700",
  "DOE Funded": "bg-yellow-100 text-yellow-700",
};

export default function ProfCard({ professor, compact = false }: ProfCardProps) {
  const scoreColor =
    professor.matchScore >= 85
      ? "#639922"
      : professor.matchScore >= 70
      ? "#D85A30"
      : "#6B7280";

  const fundingClass = fundingColors[professor.fundingStatus] || "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden w-full">
      <div className="p-6">
        {/* Avatar + header */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm"
            style={{ backgroundColor: professor.avatarColor }}
          >
            {professor.initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 leading-tight truncate">
              {professor.name}
            </h2>
            <p className="text-sm text-gray-500 truncate">{professor.department}</p>
            <p className="text-xs text-gray-400 truncate">{professor.university}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${fundingClass}`}>
            {professor.fundingStatus}
          </span>
        </div>

        {/* Match score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Research Match
            </span>
            <span className="text-sm font-bold" style={{ color: scoreColor }}>
              {professor.matchScore}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${professor.matchScore}%`, backgroundColor: scoreColor }}
            />
          </div>
        </div>

        {/* Research tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {professor.researchTags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: "#FEF3ED", color: "#D85A30" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Latest paper */}
        {!compact && (
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
              Latest Paper
            </p>
            <p className="text-sm text-gray-700 italic leading-snug">
              &ldquo;{professor.latestPaper}&rdquo;
            </p>
          </div>
        )}

        {/* Why you match */}
        {professor.matchReason && (
          <div className="flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: "#F0F7E6" }}>
            <span className="text-base mt-0.5">✨</span>
            <p className="text-sm font-medium" style={{ color: "#3D5A1A" }}>
              {professor.matchReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
