import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentProfile, professor } = body;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system:
        "You are an academic cold email writer. Write a 4-paragraph email from a student to a professor. Paragraph 1: hook referencing a specific claim from their latest paper. Paragraph 2: student background and relevant project. Paragraph 3: concrete 10-hour starter project they could work on together. Paragraph 4: polite ask for a 20-minute call. Tone: confident but not sycophantic. Under 250 words. Output only the email body, no subject line, no 'Subject:' prefix.",
      messages: [
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

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    return NextResponse.json({ email: content.text.trim() });
  } catch (error) {
    console.error("Draft error:", error);
    return NextResponse.json({ error: "Failed to draft email" }, { status: 500 });
  }
}
