import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type ImprovePayload = {
  body?: string;
  title?: string;
  promptId?: string | null;
};

function asStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function asImprovedPrompt(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.prompt === "string" && record.prompt.trim()) return record.prompt;
    if (typeof record.text === "string" && record.text.trim()) return record.text;
    if (typeof record.body === "string" && record.body.trim()) return record.body;
  }
  return fallback;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ImprovePayload;
  const body = payload.body?.trim() ?? "";
  const promptId = payload.promptId?.trim() ?? "";

  if (!body) {
    return NextResponse.json({ error: "Add prompt text before asking for improvements." }, { status: 400 });
  }

  if (!promptId) {
    return NextResponse.json({ error: "Save this prompt before using AI improvements." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "AI improvements are not configured. Add OPENAI_API_KEY to .env.local and restart the dev server." },
      { status: 503 },
    );
  }

  if (!process.env.OPENAI_MODEL) {
    return NextResponse.json(
      { error: "AI improvements are not configured. Add OPENAI_MODEL to .env.local and restart the dev server." },
      { status: 503 },
    );
  }

  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must be signed in to improve prompts." }, { status: 401 });
    }

    const { data: prompt, error: promptError } = await supabase
      .from("prompts")
      .select("id, ai_improved_at")
      .eq("id", promptId)
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (promptError) throw promptError;
    if (!prompt) return NextResponse.json({ error: "Prompt not found." }, { status: 404 });
    if (prompt.ai_improved_at) {
      return NextResponse.json({ error: "This prompt has already been improved with AI." }, { status: 409 });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL,
        input: [
          {
            role: "system",
            content:
              "You improve prompt templates. Preserve {{variables}} exactly. Return strict JSON with improved, explanation, and suggestions.",
          },
          {
            role: "user",
            content: JSON.stringify({
              title: payload.title ?? "Untitled prompt",
              prompt: body,
              schema: {
                improved: "string",
                explanation: ["short bullet"],
                suggestions: ["appendable suggestion"],
              },
            }),
          },
        ],
        text: {
          format: {
            type: "json_object",
          },
        },
      }),
    });

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();
    const text = data.output_text ?? data.output?.[0]?.content?.[0]?.text;
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("OpenAI response did not include text output.");
    }

    const parsed = JSON.parse(text);
    const aiImprovedAt = new Date().toISOString();
    const { data: updatedPrompt, error: updateError } = await supabase
      .from("prompts")
      .update({ ai_improved_at: aiImprovedAt })
      .eq("id", promptId)
      .eq("user_id", authData.user.id)
      .is("ai_improved_at", null)
      .select("ai_improved_at")
      .maybeSingle();

    if (updateError) throw updateError;
    if (!updatedPrompt) {
      return NextResponse.json({ error: "This prompt has already been improved with AI." }, { status: 409 });
    }

    return NextResponse.json({
      improved: asImprovedPrompt(parsed.improved, body),
      explanation: asStringArray(parsed.explanation),
      suggestions: asStringArray(parsed.suggestions),
      aiImprovedAt: updatedPrompt.ai_improved_at ?? aiImprovedAt,
    });
  } catch (error) {
    console.error("AI improvement failed", error);
    return NextResponse.json(
      { error: "AI improvements failed. Check the OpenAI key, model, and server logs, then try again." },
      { status: 502 },
    );
  }
}
