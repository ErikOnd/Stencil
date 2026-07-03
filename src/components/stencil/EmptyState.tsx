"use client";

import { Button, Icon } from "@/components/atoms";
import clsx from "clsx";
import styles from "./EmptyState.module.scss";

type EmptyStateProps =
  | { kind: "none"; onNew: () => void; onClear?: never; search?: never }
  | { kind: "noresults"; onClear: () => void; search: string; onNew?: never }
  | { kind: "nofilter"; onClear: () => void; onNew?: never; search?: never };

export function EmptyState(props: EmptyStateProps) {
  if (props.kind === "none") {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <Icon name="plus" size={26} />
        </div>
        <h3>Your library is empty</h3>
        <p>Create your first prompt template, mark the parts that change as variables, and reuse it whenever you need it.</p>
        <Button variant="primary" onClick={props.onNew}>Create your first prompt</Button>
      </div>
    );
  }

  if (props.kind === "noresults") {
    return (
      <div className={clsx(styles.empty, styles.emptySmall)}>
        <div className={styles.emptyIcon} style={{ borderRadius: "50%", background: "transparent", border: "2px solid var(--line2)", color: "var(--ink3)" }}>
          <Icon name="search" size={22} />
        </div>
        <h3>No prompts match “{props.search}”</h3>
        <p>Try a different word, or clear the search to see everything again.</p>
        <Button variant="secondary" onClick={props.onClear}>Clear search</Button>
      </div>
    );
  }

  return (
    <div className={clsx(styles.empty, styles.emptySmall)}>
      <h3>Nothing here yet</h3>
      <p>No prompts match this filter.</p>
      <Button variant="secondary" onClick={props.onClear}>Show all prompts</Button>
    </div>
  );
}
