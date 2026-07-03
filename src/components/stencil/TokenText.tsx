"use client";

import type { PromptVariable } from "@/lib/stencil/types";
import styles from "./TokenText.module.scss";

export function TokenText({ text }: { text: string }) {
  return (
    <>
      {(text || "").split(/(\{\{[^}]+\}\})/g).map((part, index) =>
        /^\{\{[^}]+\}\}$/.test(part) ? (
          <span className={styles.token} key={`${part}-${index}`}>
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </>
  );
}

export function PreviewText({
  body,
  variables,
  values,
}: {
  body: string;
  variables: PromptVariable[];
  values: Record<string, string>;
}) {
  const byName = new Map(variables.map((variable) => [variable.name, variable]));

  return (
    <>
      {(body || "").split(/(\{\{[^}]+\}\})/g).map((part, index) => {
        const match = part.match(/^\{\{([^}]+)\}\}$/);
        if (!match) return <span key={`${part}-${index}`}>{part}</span>;
        const name = match[1].trim();
        const value = values[name]?.trim();
        if (value) {
          return (
            <span className={styles.previewValue} key={`${name}-${index}`}>
              {values[name]}
            </span>
          );
        }

        return (
          <span className={styles.previewChip} key={`${name}-${index}`}>
            {byName.get(name)?.label || name}
          </span>
        );
      })}
    </>
  );
}
