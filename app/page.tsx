"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [interests, setInterests] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
    } else {
      setError("Please upload a PDF file.");
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleSubmit = async () => {
    if (!interests.trim()) {
      setError("Please describe your research interests.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      if (file) formData.append("resume", file);
      formData.append("interests", interests);

      const res = await fetch("/api/parse", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Parse failed");
      const profile = await res.json();
      localStorage.setItem("studentProfile", JSON.stringify(profile));
      router.push("/swipe");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fade-up">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🎓</div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Find your research match
        </h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
          Upload your resume, describe your interests, and swipe through UMD professors
          to find your perfect advisor.
        </p>
      </div>

      <div className="space-y-5">
        {/* Drop zone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Resume (PDF)
            <span className="font-normal text-gray-400 ml-1">— optional but recommended</span>
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
            style={{
              borderColor: dragging ? "#D85A30" : file ? "#639922" : "#D1D5DB",
              backgroundColor: dragging ? "#FEF3ED" : file ? "#F0F7E6" : "#FAFAFA",
            }}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">📄</span>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 text-sm">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024).toFixed(0)} KB · Click to replace
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="text-3xl mb-2">☁️</div>
                <p className="text-sm font-medium text-gray-600">
                  Drag & drop your PDF, or <span style={{ color: "#D85A30" }}>browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF only</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Research Interests
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Describe your research interests in 3–5 sentences. What problems excite you? What methods do you want to learn? What kind of work do you want to do with a professor?"
            rows={5}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none transition-all"
            style={{ backgroundColor: "#FAFAFA" }}
            onFocus={(e) => (e.target.style.borderColor = "#D85A30")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
          />
          <p className="text-xs text-gray-400 mt-1.5">{interests.length} characters</p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "#FEF3ED", color: "#D85A30" }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-md transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#D85A30" }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span
                className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"
                style={{ borderTopColor: "transparent" }}
              />
              Finding your matches…
            </span>
          ) : (
            "Find my matches →"
          )}
        </button>
      </div>

      {/* How it works */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-5">
          How it works
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: "📤", title: "Upload", body: "Share your resume & interests" },
            { icon: "🃏", title: "Swipe", body: "Like or skip professor cards" },
            { icon: "✉️", title: "Email", body: "AI drafts your cold outreach" },
          ].map((step) => (
            <div key={step.title} className="text-center">
              <div className="text-2xl mb-1.5">{step.icon}</div>
              <p className="text-sm font-bold text-gray-700">{step.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
