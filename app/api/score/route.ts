import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentProfile, professor } = body;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system:
        "You are a research alignment scorer. Given a student profile and a professor's details, score the research alignment from 0-100 and write one sentence explaining the strongest connection. Return JSON only with keys: score (number between 0-100), reason (string, one sentence, no more than 20 words).",
      messages: [
        {
          role: "user",
          content: `Student Profile:
Skills: ${studentProfile.skills?.join(", ")}
Research Domains: ${studentProfile.researchDomains?.join(", ")}
Background: ${studentProfile.backgroundSummary}
Proposed Project: ${studentProfile.proposedProject}
Interests: ${studentProfile.rawInterests}

Professor:
Name: ${professor.name}
Department: ${professor.department}
Research Tags: ${professor.researchTags?.join(", ")}
Latest Paper: ${professor.latestPaper}
Paper Abstract: ${professor.paperAbstract}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    let jsonText = content.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const result = JSON.parse(jsonText);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Score error:", error);
    return NextResponse.json({ error: "Failed to score professor" }, { status: 500 });
  }
}
