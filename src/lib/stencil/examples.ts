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
    title: "Build project feature",
    description: "Ask AI to implement a specific coding task in an existing project.",
    tags: ["Coding", "Project"],
    body: `You are working in this existing codebase.

Project context:
{{projectContext}}

Task:
{{task}}

Relevant files or areas:
{{relevantFiles}}

Constraints:
{{constraints}}

Please implement the change in the style of the existing project. Keep the scope focused, avoid unrelated refactors, and explain what changed when you are done.`,
    variables: [
      {
        name: "projectContext",
        label: "Project context",
        placeholder: "Next.js app, Supabase backend, existing component names, user flow, etc.",
        default: "",
        required: true,
        multiline: true,
      },
      {
        name: "task",
        label: "Task",
        placeholder: "Add a settings modal, fix auth redirect, create an empty state, etc.",
        default: "",
        required: true,
        multiline: true,
      },
      {
        name: "relevantFiles",
        label: "Relevant files",
        placeholder: "src/app/page.tsx, src/components/..., API route, database table, etc.",
        default: "",
        required: false,
        multiline: true,
      },
      {
        name: "constraints",
        label: "Constraints",
        placeholder: "Do not change the database schema. Keep mobile layout intact. Use existing design system.",
        default: "Use existing patterns and keep the change focused.",
        required: false,
        multiline: true,
      },
    ],
  },
  {
    title: "Debug project error",
    description: "Give AI an error, expected behavior, and project context.",
    tags: ["Coding", "Debugging"],
    body: `Help debug this issue in my project.

Project context:
{{projectContext}}

What I expected:
{{expectedBehavior}}

What happened instead:
{{actualBehavior}}

Error or logs:
{{errorLogs}}

Relevant code or files:
{{relevantCode}}

Find the likely cause, suggest the smallest fix, and point out any verification steps.`,
    variables: [
      {
        name: "projectContext",
        label: "Project context",
        placeholder: "Framework, auth/database setup, feature area, recent changes.",
        default: "",
        required: true,
        multiline: true,
      },
      {
        name: "expectedBehavior",
        label: "Expected behavior",
        placeholder: "What should happen?",
        default: "",
        required: true,
        multiline: true,
      },
      {
        name: "actualBehavior",
        label: "Actual behavior",
        placeholder: "What happens instead?",
        default: "",
        required: true,
        multiline: true,
      },
      {
        name: "errorLogs",
        label: "Error or logs",
        placeholder: "Paste browser console errors, terminal output, stack traces, or network errors.",
        default: "",
        required: false,
        multiline: true,
      },
      {
        name: "relevantCode",
        label: "Relevant code",
        placeholder: "Paste the code or list the files that seem related.",
        default: "",
        required: false,
        multiline: true,
      },
    ],
  },
];
