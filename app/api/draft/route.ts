import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: { "X-Title": "SwipeScholar" },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentProfile, professor } = body;

    const completion = await client.chat.completions.create({
      model: "anthropic/claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content:
            "You are an academic cold email writer. Write a 4-paragraph email from a student to a professor. Paragraph 1: hook referencing a specific claim from their latest paper. Paragraph 2: student background and relevant project. Paragraph 3: concrete 10-hour starter project they could work on together. Paragraph 4: polite ask for a 20-minute call. Tone: confident but not sycophantic. Under 250 words. Output only the email body, no subject line, no 'Subject:' prefix.",
        },
        {
          role: "user",
          content: `Student Profile:
Skills: ${studentProfile.skills?.join(", ")}
Research Domains: ${studentProfile.researchDomains?.join(", ")}
Background: ${studentProfile.backgroundSummary}
Proposed Project: ${studentProfile.proposedProject}

Professor:
Name: ${professor.name}
Department: ${professor.department}
Email: ${professor.email}
Latest Paper: "${professor.latestPaper}"
Paper Abstract: ${professor.paperAbstract}
Research Tags: ${professor.researchTags?.join(", ")}

Write the email body now.`,
        },
      ],
    });

    const email = (completion.choices[0].message.content ?? "").trim();
    return NextResponse.json({ email });
  } catch (error) {
    console.error("Draft error:", error);
    return NextResponse.json({ error: "Failed to draft email" }, { status: 500 });
  }
}
