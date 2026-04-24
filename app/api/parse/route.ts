import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;
    const interests = (formData.get("interests") as string) || "";

    let resumeText = "";

    if (file && file.size > 0) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        resumeText = result.text;
      } catch {
        // Non-fatal: fall back to interests only
        resumeText = "";
      }
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system:
        "You are a research profile extractor. Given a student's resume text and research interests, extract: their top 3 technical skills, top 2 research domains, one sentence summary of their background, and one concrete project they could propose to a professor. Return JSON only with keys: skills (array of 3 strings), researchDomains (array of 2 strings), backgroundSummary (string), proposedProject (string).",
      messages: [
        {
          role: "user",
          content: `Resume:\n${resumeText || "(no resume provided)"}\n\nResearch Interests:\n${interests || "(none provided)"}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    let jsonText = content.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const profile = JSON.parse(jsonText);
    return NextResponse.json({ ...profile, rawInterests: interests });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
