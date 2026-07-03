"use client";

import { Badge } from "@/components/atoms";
import type { PromptVariable } from "@/lib/stencil/types";
import { guessMultiline } from "@/lib/stencil/utils";
import clsx from "clsx";
import styles from "./VariablePanel.module.scss";

export function VariablePanel({
  variables,
  onFieldType,
  onEdit,
  onRemove,
}: {
  variables: PromptVariable[];
  onFieldType: (index: number, multiline: boolean) => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <aside className={styles.varAside}>
      <div className={styles.varHead}>
        <strong>Variables</strong>
        <Badge>{"{ }"}</Badge>
      </div>
      <p className={styles.varIntro}>Every part you mark shows up here. Edit or remove them any time.</p>

      {variables.length ? (
        <div className={styles.varList}>
          {variables.map((variable, index) => (
            <VariableCard
              key={`${variable.name}-${index}`}
              variable={variable}
              onSingle={() => onFieldType(index, false)}
              onMulti={() => onFieldType(index, true)}
              onEdit={() => onEdit(index)}
              onRemove={() => onRemove(index)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.noVars}>
          <div className={styles.noVarsCode}>{"{ }"}</div>
          <strong>No variables yet</strong>
          <p>
            Select text and hit <span style={{ color: "var(--varink)", fontWeight: 600 }}>Mark as variable</span>, or just type{" "}
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--varink)", background: "var(--varbg)", borderRadius: 4, padding: "0 4px" }}>
              {"{{like_this}}"}
            </span>{" "}
            — either way it shows up here.
          </p>
        </div>
      )}
    </aside>
  );
}

function VariableCard({
  variable,
  onSingle,
  onMulti,
  onEdit,
  onRemove,
}: {
  variable: PromptVariable;
  onSingle: () => void;
  onMulti: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const multiline = guessMultiline(variable);

  return (
    <div className={styles.varCard}>
      <div className={styles.varCardTop}>
        <span className={styles.varName}>{variable.name}</span>
        <span className={clsx(styles.varReq, !variable.required && styles.varOptional)}>
          {variable.required ? "Required" : "Optional"}
        </span>
      </div>
      <div className={styles.varLabel}>{variable.label}</div>
      <div className={styles.varPlaceholder}>e.g. {variable.placeholder || "—"}</div>
      <div className={styles.segmented}>
        <button className={clsx(styles.segButton, !multiline && styles.segActive)} onClick={onSingle} title="Single line input" type="button">
          <span className={styles.mutedLine} />
          Input
        </button>
        <button className={clsx(styles.segButton, multiline && styles.segActive)} onClick={onMulti} title="Multi-line text area" type="button">
          <span className={styles.stackLines}>
            <span className={styles.mutedLine} />
            <span className={styles.mutedLine} />
          </span>
          Text area
        </button>
      </div>
      <div className={styles.varActions}>
        <button onClick={onEdit} type="button">Edit</button>
        <button onClick={onRemove} type="button">Remove</button>
      </div>
    </div>
  );
}
