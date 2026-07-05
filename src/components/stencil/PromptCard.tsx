"use client";

import { Button, Icon, IconButton, Tag } from "@/components/atoms";
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
      <IconButton
        className={styles.favButton}
        onClick={() => onFavorite(prompt.id)}
        aria-label={prompt.favorite ? "Remove from favorites" : "Add to favorites"}
        title={prompt.favorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Icon
          name="star"
          size={18}
          fill={prompt.favorite ? "var(--accent)" : "none"}
          stroke={prompt.favorite ? "var(--accent)" : "var(--ink3)"}
        />
      </IconButton>
      <div className={styles.cardTitle}>{prompt.title}</div>
      <p className={styles.cardDescription}>{preview}</p>
      <div className={styles.cardTags}>
        {prompt.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      <div className={styles.cardMeta}>
        <span>
          <span className={styles.metaGlyph}>{"{ }"}</span>
          {prompt.variables.length} {prompt.variables.length === 1 ? "variable" : "variables"}
        </span>
        <span>·</span>
        <span>
          <Icon name="clock" size={12} className={styles.metaIcon} />
          {displayLastUsed(prompt)}
        </span>
      </div>
      <div className={styles.cardActions}>
        <Button
          variant={copied ? "sageSolid" : "primary"}
          size="small"
          icon={copied ? "check" : undefined}
          onClick={() => {
            void onUse(prompt.id);
          }}
        >
          {copied ? "Copied" : copiesImmediately ? "Copy" : "Use"}
        </Button>
        <Button variant="secondary" size="small" onClick={() => onEdit(prompt.id)}>
          Edit
        </Button>
      </div>
    </div>
  );
}
