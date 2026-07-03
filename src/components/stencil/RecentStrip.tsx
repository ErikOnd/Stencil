"use client";

import type { PromptRecord } from "@/lib/stencil/types";
import { displayLastUsed, sortRecentlyUsed } from "@/lib/stencil/utils";
import styles from "./RecentStrip.module.scss";

export function RecentStrip({ prompts, onOpen }: { prompts: PromptRecord[]; onOpen: (id: string) => void }) {
  const recentPrompts = sortRecentlyUsed(prompts).filter((prompt) => prompt.lastUsedAt).slice(0, 4);

  if (!recentPrompts.length) return null;

  return (
    <div className={styles.recentStrip}>
      <div className={styles.recentTitle}>Jump back in</div>
      <div className={styles.recentGrid}>
        {recentPrompts.map((prompt) => (
          <button key={prompt.id} className={styles.recentCard} onClick={() => onOpen(prompt.id)} type="button">
            <strong>{prompt.title}</strong>
            <span>Used {displayLastUsed(prompt)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
