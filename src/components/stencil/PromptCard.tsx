"use client";

import { Icon, Tag } from "@/components/atoms";
import type { PromptRecord } from "@/lib/stencil/types";
import { displayLastUsed } from "@/lib/stencil/utils";
import styles from "./PromptCard.module.scss";

export function PromptCard({
  prompt,
  copied,
  onFavorite,
  onUse,
  onEdit,
}: {
  prompt: PromptRecord;
  copied: boolean;
  onFavorite: (id: string) => void;
  onUse: (id: string) => void | Promise<void>;
  onEdit: (id: string) => void;
}) {
  const preview = prompt.description.trim() || prompt.body.replace(/\{\{\s*([^}]+?)\s*\}\}/g, "$1").trim();
  const copiesImmediately = prompt.variables.length === 0;

  return (
    <div className={styles.promptCard}>
      <button
        className={styles.favButton}
        onClick={() => onFavorite(prompt.id)}
        aria-label={prompt.favorite ? "Remove from favorites" : "Add to favorites"}
        title={prompt.favorite ? "Remove from favorites" : "Add to favorites"}
        type="button"
      >
        <Icon
          name="star"
          size={18}
          fill={prompt.favorite ? "var(--accent)" : "none"}
          stroke={prompt.favorite ? "var(--accent)" : "var(--ink3)"}
        />
      </button>
      <div className={styles.cardTitle}>{prompt.title}</div>
      <p className={styles.cardDescription}>{preview}</p>
      <div className={styles.cardTags}>
        {prompt.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      <div className={styles.cardMeta}>
        <span>
          <span style={{ opacity: 0.85 }}>{"{ }"}</span>
          {prompt.variables.length} {prompt.variables.length === 1 ? "variable" : "variables"}
        </span>
        <span>·</span>
        <span>
          <Icon name="clock" size={12} style={{ opacity: 0.8 }} />
          {displayLastUsed(prompt)}
        </span>
      </div>
      <div className={styles.cardActions}>
        <button
          className={copied ? styles.copiedCardButton : styles.useCardButton}
          onClick={() => {
            void onUse(prompt.id);
          }}
          type="button"
        >
          {copied ? (
            <>
              <Icon name="check" size={15} />
              Copied
            </>
          ) : copiesImmediately ? "Copy" : "Use"}
        </button>
        <button className={styles.editCardButton} onClick={() => onEdit(prompt.id)} type="button">
          Edit
        </button>
      </div>
    </div>
  );
}
