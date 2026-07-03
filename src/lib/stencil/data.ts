import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { PromptDraft, PromptRecord } from "./types";
import { guessMultiline } from "./utils";

type Client = SupabaseClient<Database>;

type PromptRow = Database["public"]["Tables"]["prompts"]["Row"];
type VariableRow = Database["public"]["Tables"]["prompt_variables"]["Row"];

export function mapPrompt(row: PromptRow, variables: VariableRow[]): PromptRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    body: row.body,
    tags: row.tags ?? [],
    favorite: row.favorite,
    lastUsedAt: row.last_used_at,
    aiImprovedAt: row.ai_improved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    variables: variables
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((variable) => ({
        id: variable.id,
        name: variable.name,
        label: variable.label,
        placeholder: variable.placeholder,
        default: variable.default_value,
        required: variable.required,
        multiline: variable.multiline,
        position: variable.position,
      })),
  };
}

export async function loadPrompts(supabase: Client, userId: string) {
  const { data: promptRows, error: promptError } = await supabase
    .from("prompts")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (promptError) throw promptError;

  const promptIds = (promptRows ?? []).map((prompt) => prompt.id);
  const { data: variableRows, error: variableError } = promptIds.length
    ? await supabase
      .from("prompt_variables")
      .select("*")
      .in("prompt_id", promptIds)
      .order("position", { ascending: true })
    : { data: [], error: null };

  if (variableError) throw variableError;

  const variablesByPrompt = new Map<string, VariableRow[]>();
  (variableRows ?? []).forEach((variable) => {
    variablesByPrompt.set(variable.prompt_id, [...(variablesByPrompt.get(variable.prompt_id) ?? []), variable]);
  });

  return (promptRows ?? []).map((prompt) => mapPrompt(prompt, variablesByPrompt.get(prompt.id) ?? []));
}

export async function ensureProfile(supabase: Client, user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
  const displayName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : typeof user.user_metadata?.first_name === "string"
          ? user.user_metadata.first_name
          : null;

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
  });

  if (profileError) throw profileError;
}

export async function savePrompt(supabase: Client, userId: string, draft: PromptDraft, id?: string | null) {
  const title = draft.title.trim() || "Untitled prompt";
  const row = {
    user_id: userId,
    title,
    description: draft.description.trim(),
    body: draft.body,
    tags: draft.tags,
    updated_at: new Date().toISOString(),
  };

  const { data: prompt, error: promptError } = id
    ? await supabase
      .from("prompts")
      .update(row)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single()
    : await supabase
      .from("prompts")
      .insert({ ...row, favorite: false })
      .select("*")
      .single();

  if (promptError) throw promptError;

  const { error: deleteError } = await supabase.from("prompt_variables").delete().eq("prompt_id", prompt.id);
  if (deleteError) throw deleteError;

  if (draft.variables.length) {
    const { error: variableError } = await supabase.from("prompt_variables").insert(
      draft.variables.map((variable, index) => ({
        prompt_id: prompt.id,
        name: variable.name,
        label: variable.label,
        placeholder: variable.placeholder,
        default_value: variable.default,
        required: variable.required,
        multiline: guessMultiline(variable),
        position: index,
      })),
    );

    if (variableError) throw variableError;
  }

  const { data: variables, error: variablesError } = await supabase
    .from("prompt_variables")
    .select("*")
    .eq("prompt_id", prompt.id)
    .order("position", { ascending: true });

  if (variablesError) throw variablesError;
  return mapPrompt(prompt, variables ?? []);
}
