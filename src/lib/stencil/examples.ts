import type { PromptDraft } from "./types";

export const starterPromptExamples: PromptDraft[] = [
  {
    title: "Simple email reply",
    description: "Reply to an email in a clear, natural way.",
    tags: ["Email"],
    body: `Write a short email reply.

Original email:
{{originalEmail}}

What I want to say:
{{replyGoal}}

Tone: {{tone}}

Keep it concise and ready to send.`,
    variables: [
      {
        name: "originalEmail",
        label: "Original email",
        placeholder: "Paste the email you received.",
        default: "",
        required: true,
        multiline: true,
      },
      {
        name: "replyGoal",
        label: "Reply goal",
        placeholder: "Say yes, ask for more details, explain the delay, decline politely, etc.",
        default: "",
        required: true,
        multiline: true,
      },
      {
        name: "tone",
        label: "Tone",
        placeholder: "Friendly and professional",
        default: "friendly and professional",
        required: true,
        multiline: false,
      },
    ],
  },
  {
    title: "Code refactoring",
    description: "Clean up the current codebase without changing behavior.",
    tags: ["Coding", "Refactoring"],
    body: `Refactor the code we are currently working on.

- Remove unused code, dead branches, and outdated comments.
- Consolidate duplicated logic into shared functions or components.
- Follow the existing project structure, naming, and patterns.
- Do not change any behavior or public APIs.
- Keep the scope focused and avoid unrelated changes.

When you are done, list what was removed or consolidated and how you verified nothing broke.`,
    variables: [],
  },
];
