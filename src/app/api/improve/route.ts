import { parseTokenNames } from "@/lib/stencil/utils";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type ImprovePayload = {
	body?: string;
	title?: string;
	promptId?: string | null;
};

const IMPROVE_PROMPT_SYSTEM = `You improve reusable prompt templates for a prompt-library app.

Your job is not to give generic writing advice. Read the title and prompt, infer the real task context, and make the prompt more precise, enforceable, and useful for that context.

Use these prompting principles from Anthropic's "6 Techniques for Effective Prompt Engineering" handout when they fit the user's intent:
- Add specific context: scope, audience, domain, geography, timeframe, source material, and other task boundaries.
- Add examples or ask the user to provide examples when the desired pattern, format, quality bar, or style is otherwise ambiguous.
- Specify output constraints: format, sections, length, ordering, required details, exclusions, and success criteria.
- Break complex tasks into ordered steps so the assistant has a clear process to follow.
- Ask the assistant to consider relevant factors, constraints, and approaches before producing the final answer; do not require hidden reasoning to be shown unless the user explicitly wants visible reasoning.
- Define the assistant's role, tone, expertise level, and target audience when that would improve the result.
- When the user is unsure how to ask for the task, rewrite the prompt to make the request itself clearer and more complete.

Hard rules:
- Preserve every existing {{variable}} token exactly. Do not rename, remove, or invent variable tokens.
- If the original prompt has no {{variables}}, the improved prompt must also have no {{variables}}.
- Never wrap new words or placeholders in {{double braces}}.
- If a missing input should be supplied by the user, describe that in plain language instead of creating a new variable.
- Keep the user's original intent and workflow.
- Prefer concrete, testable instructions over vague wording.
- Do not add broad filler like "be clear" unless it is tied to the task.
- If the original prompt mentions a project, file, framework, API, database, link, document, design source, MCP server, or external tool, treat that as core context.
- Do not introduce tools, sources, requirements, frameworks, or workflows that are not implied by the original prompt.
- Add "ask the user when unclear" behavior when missing information would otherwise require guessing.
- Add "do not guess" behavior for any work that depends on unavailable source data, project context, designs, requirements, or files.

When the prompt references an external source or tool, improve it by making that source/tool relationship explicit:
- State what the assistant should inspect or use before answering.
- State whether that source is authoritative or only supporting context, based on the user's wording.
- Require the assistant to preserve concrete details from the source instead of approximating them.
- Require the assistant to ask for clarification when the source is inaccessible, incomplete, or ambiguous.

For coding prompts, strongly prefer adding requirements like:
- Follow existing project patterns and component structure.
- Keep the change narrowly scoped.
- Avoid unrelated refactors.
- Mention files touched and verification steps.

Return strict JSON with:
- improved: the rewritten prompt template`;

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

function hasSameVariableTokens(original: string, improved: string) {
	const originalNames = parseTokenNames(original).sort();
	const improvedNames = parseTokenNames(improved).sort();
	return originalNames.length === improvedNames.length
		&& originalNames.every((name, index) => name === improvedNames[index]);
}

function unwrapInventedVariableTokens(text: string, allowedNames: string[]) {
	const allowed = new Set(allowedNames);
	return text.replace(/\{\{\s*([^}]+?)\s*}}/g, (match, rawName: string) => {
		const name = rawName.trim();
		return allowed.has(name) ? match : name;
	});
}

async function requestImprovedText(title: string, body: string, existingVariables: string[]) {
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
					content: IMPROVE_PROMPT_SYSTEM,
				},
				{
					role: "user",
					content: JSON.stringify({
						title,
						prompt: body,
						existingVariables,
						schema: {
							improved: "string",
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
	return asImprovedPrompt(parsed.improved, body);
}

async function improvePrompt(payload: ImprovePayload) {
	const body = payload.body?.trim() ?? "";
	const promptId = payload.promptId?.trim() ?? "";
	const existingVariables = parseTokenNames(body);

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

	const rawImproved = await requestImprovedText(payload.title ?? "Untitled prompt", body, existingVariables);
	const improved = unwrapInventedVariableTokens(rawImproved, existingVariables);
	if (!hasSameVariableTokens(body, improved)) {
		return NextResponse.json(
			{
				error:
					"AI generated a prompt with different variables. Try again; existing variables must be preserved exactly and no new variables may be added.",
			},
			{ status: 502 },
		);
	}

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
		improved,
		aiImprovedAt: updatedPrompt.ai_improved_at ?? aiImprovedAt,
	});
}

function parsePayload(value: unknown): ImprovePayload | null {
	if (!value || typeof value !== "object") return null;

	const record = value as Record<string, unknown>;
	if (record.body !== undefined && typeof record.body !== "string") return null;
	if (record.title !== undefined && typeof record.title !== "string") return null;
	if (record.promptId !== undefined && record.promptId !== null && typeof record.promptId !== "string") return null;

	return record as ImprovePayload;
}

export async function POST(request: Request) {
	try {
		const payload = parsePayload(await request.json().catch(() => null));
		if (!payload) {
			return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
		}

		return await improvePrompt(payload);
	} catch (error) {
		console.error("AI improvement failed", error);
		return NextResponse.json(
			{ error: "AI improvements failed. Check the OpenAI key, model, and server logs, then try again." },
			{ status: 502 },
		);
	}
}
