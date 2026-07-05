import type { PromptDraft, PromptRecord, PromptVariable } from "./types";

// Must match $bp-md in src/styles/mixins.scss.
export const MOBILE_BREAKPOINT = 860;

export function blankDraft(): PromptDraft {
  return { title: "", description: "", tags: [], body: "", variables: [] };
}

export function cloneDraft(source: PromptRecord | PromptDraft): PromptDraft {
  return JSON.parse(
    JSON.stringify({
      title: source.title,
      description: source.description,
      tags: source.tags,
      body: source.body,
      variables: source.variables,
    }),
  ) as PromptDraft;
}

export function camel(value: string) {
  const words = (value || "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "variable";

  let out = words[0].toLowerCase();
  for (let i = 1; i < words.length; i += 1) {
    out += words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
  }

  if (/^[0-9]/.test(out)) out = `v${out}`;
  return out.slice(0, 40);
}

export function titleCase(value: string) {
  const cleaned = (value || "").replace(/[^a-zA-Z0-9 ]/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function parseTokenNames(body: string) {
  const re = /\{\{\s*([^}]+?)\s*\}\}/g;
  const names: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(body || ""))) {
    const name = match[1].trim();
    if (name && !names.includes(name)) names.push(name);
  }
  return names;
}

export function syncVars(body: string, vars: PromptVariable[]) {
  const names = parseTokenNames(body);
  const byName = new Map(vars.map((variable) => [variable.name, variable]));

  return names.map((name, index) => ({
    ...(byName.get(name) ?? {
      name,
      label: titleCase(name),
      placeholder: "",
      default: "",
      required: true,
      multiline: name.length > 18,
    }),
    position: index,
  }));
}

export function uniqueName(base: string, vars: PromptVariable[], exclude?: number | null) {
  const names = vars.map((variable, index) => (index === exclude ? "\u0000" : variable.name));
  if (!names.includes(base)) return base;

  let next = 2;
  while (names.includes(`${base}${next}`)) next += 1;
  return `${base}${next}`;
}

export function guessMultiline(variable: PromptVariable) {
  return variable.multiline ?? /code|message|copy|notes|context|text|constraint/i.test(variable.name);
}

export function finalText(body: string, values: Record<string, string>) {
  return (body || "").replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, rawName: string) => {
    const key = rawName.trim();
    return values[key]?.trim() ? values[key] : match;
  });
}

export function displayLastUsed(prompt: PromptRecord) {
  if (!prompt.lastUsedAt) return "Never";
  const usedAt = new Date(prompt.lastUsedAt);
  const usedAtTime = usedAt.getTime();
  if (Number.isNaN(usedAtTime)) return "Never";

  const deltaMs = Date.now() - usedAtTime;
  const minutes = Math.max(1, Math.floor(deltaMs / 60000));
  if (minutes < 2) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: usedAt.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  }).format(usedAt);
}

export function sortRecentlyUsed(prompts: PromptRecord[]) {
  return prompts.slice().sort((a, b) => {
    if (!a.lastUsedAt && !b.lastUsedAt) return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (!a.lastUsedAt) return 1;
    if (!b.lastUsedAt) return -1;
    return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
  });
}
