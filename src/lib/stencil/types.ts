export type PromptVariable = {
  id?: string;
  name: string;
  label: string;
  placeholder: string;
  default: string;
  required: boolean;
  multiline?: boolean;
  position?: number;
};

export type PromptRecord = {
  id: string;
  title: string;
  description: string;
  body: string;
  tags: string[];
  favorite: boolean;
  lastUsedAt: string | null;
  aiImprovedAt: string | null;
  createdAt: string;
  updatedAt: string;
  variables: PromptVariable[];
};

export type PromptDraft = {
  title: string;
  description: string;
  tags: string[];
  body: string;
  variables: PromptVariable[];
};

export type ImproveResult = {
  improved: string;
  aiImprovedAt?: string;
};
