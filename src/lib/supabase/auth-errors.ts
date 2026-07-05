const recoverableAuthCodes = new Set([
  "refresh_token_already_used",
  "refresh_token_not_found",
  "session_expired",
  "session_not_found",
]);

export function isRecoverableAuthSessionError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const authError = error as { code?: unknown; message?: unknown; name?: unknown };
  const code = typeof authError.code === "string" ? authError.code : "";
  const name = typeof authError.name === "string" ? authError.name : "";
  const message = typeof authError.message === "string" ? authError.message : "";

  return (
    recoverableAuthCodes.has(code) ||
    name === "AuthSessionMissingError" ||
    message.includes("Auth session missing") ||
    message.includes("Invalid Refresh Token")
  );
}

function getSupabaseAuthCookieName() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;

  try {
    return `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
  } catch {
    return null;
  }
}

export function isSupabaseAuthCookieName(name: string) {
  const authCookieName = getSupabaseAuthCookieName();
  return Boolean(authCookieName && (name === authCookieName || name.startsWith(`${authCookieName}.`)));
}
