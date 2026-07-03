import { AuthPage } from "@/components/auth/AuthPage";
import { StencilApp } from "@/components/stencil/StencilApp";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, loadPrompts } from "@/lib/stencil/data";
import packageJson from "../../package.json";

export const dynamic = "force-dynamic";

function capitalizeWords(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function displayNameFromUser(user: { email?: string | null; user_metadata?: Record<string, unknown> }) {
  const metadata = user.user_metadata ?? {};
  const metadataName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : typeof metadata.first_name === "string"
          ? metadata.first_name
          : "";

  if (metadataName.trim()) return metadataName.trim();

  const emailName = user.email?.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  return emailName ? capitalizeWords(emailName) : "You";
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string; layout?: string }>;
}) {
  const params = await searchParams;
  const layout = params?.layout === "split" ? "Split" : "Centered";
  const defaultMode = params?.mode === "register" ? "register" : "signin";

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <AuthPage layout={layout} defaultMode={defaultMode} />;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return <AuthPage layout={layout} defaultMode={defaultMode} />;
  }

  await ensureProfile(supabase, data.user);
  const prompts = await loadPrompts(supabase, data.user.id);

  return (
    <StencilApp
      initialPrompts={prompts}
      email={data.user.email ?? ""}
      userName={displayNameFromUser(data.user)}
      appVersion={packageJson.version}
    />
  );
}
