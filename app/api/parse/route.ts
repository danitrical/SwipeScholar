import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: { "X-Title": "SwipeScholar" },
});

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
        resumeText = "";
      }
    }

    const completion = await client.chat.completions.create({
      model: "anthropic/claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content:
            "You are a research profile extractor. Given a student's resume text and research interests, extract: their full name (from the resume header or contact info, or 'Student' if not found), top 3 technical skills, top 2 research domains, one sentence summary of their background, and one concrete project they could propose to a professor. Return JSON only with keys: name (string), skills (array of 3 strings), researchDomains (array of 2 strings), backgroundSummary (string), proposedProject (string).",
        },
        {
          role: "user",
          content: `Resume:\n${resumeText || "(no resume provided)"}\n\nResearch Interests:\n${interests || "(none provided)"}`,
        },
      ],
    });

    let jsonText = (completion.choices[0].message.content ?? "").trim();
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
