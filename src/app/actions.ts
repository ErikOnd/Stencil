"use server";

import { savePrompt } from "@/lib/stencil/data";
import type { PromptDraft } from "@/lib/stencil/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRecoverableAuthSessionError } from "@/lib/supabase/auth-errors";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getUser();
	if (error && !isRecoverableAuthSessionError(error)) throw error;
	if (!data.user) throw new Error("You must be signed in.");
	return { supabase, user: data.user };
}

export async function savePromptAction(draft: PromptDraft, id?: string | null) {
	const { supabase, user } = await requireUser();
	return savePrompt(supabase, user.id, draft, id);
}

export async function toggleFavoriteAction(id: string, favorite: boolean) {
	const { supabase, user } = await requireUser();
	const { error } = await supabase
		.from("prompts")
		.update({ favorite })
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) throw error;
}

export async function deletePromptAction(id: string) {
	const { supabase, user } = await requireUser();
	const { error } = await supabase
		.from("prompts")
		.delete()
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) throw error;
}

export async function touchPromptAction(id: string) {
	const { supabase, user } = await requireUser();
	const now = new Date().toISOString();
	const { error } = await supabase
		.from("prompts")
		.update({ last_used_at: now })
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) throw error;
	return now;
}

export async function signOutAction() {
	const supabase = await createClient();
	const { error } = await supabase.auth.signOut({ scope: "local" });
	if (error && !isRecoverableAuthSessionError(error)) throw error;
}

export async function deleteAccountAction() {
	const { supabase, user } = await requireUser();

	const { error: promptError } = await supabase.from("prompts").delete().eq("user_id", user.id);
	if (promptError) throw promptError;

	const { error: profileError } = await supabase.from("profiles").delete().eq("id", user.id);
	if (profileError) throw profileError;

	const admin = createAdminClient();
	const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
	if (deleteUserError) throw deleteUserError;

	await supabase.auth.signOut();
}
