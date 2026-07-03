"use client";

import { Button, Icon } from "@/components/atoms";
import type { ImproveResult } from "@/lib/stencil/types";
import clsx from "clsx";
import { TokenText } from "./TokenText";
import styles from "./AIPanel.module.scss";

type Suggestion = {
  id: number;
  text: string;
  checked: boolean;
};

export function AIPanel({
  contextLabel,
  status,
  error,
  original,
  result,
  suggestions,
  running,
  onClose,
  onRun,
  onToggleSuggestion,
  onApplyImproved,
  onApplySelected,
  onKeepOriginal,
}: {
  contextLabel: string;
  status: "idle" | "done" | "error";
  error: string;
  original: string;
  result: ImproveResult | null;
  suggestions: Suggestion[];
  running: boolean;
  onClose: () => void;
  onRun: () => void;
  onToggleSuggestion: (id: number) => void;
  onApplyImproved: () => void;
  onApplySelected: () => void;
  onKeepOriginal: () => void;
}) {
  const anySelected = suggestions.some((suggestion) => suggestion.checked);
  const errorTitle = error.includes("already been improved")
    ? "Prompt already improved"
    : error.includes("Save this prompt")
      ? "Save prompt first"
      : "AI is not available";
  const canRetryError = !error.includes("already been improved") && !error.includes("Save this prompt");

  return (
    <div className={styles.aiOverlay}>
      <div className={styles.aiDismiss} onClick={onClose} />
      <div className={styles.aiPanel}>
        <div className={styles.aiHead}>
          <div>
            <div className={styles.aiTitle}>
              <Icon name="sparkle" size={17} color="var(--sage)" />
              <strong>Prompt assistant</strong>
            </div>
            <div className={styles.aiContext}>{contextLabel}</div>
          </div>
          <button className={styles.closeButton} onClick={onClose} type="button">×</button>
        </div>

        {status === "idle" ? (
          <div className={styles.aiIdle}>
            <div className={styles.aiIdleIcon}>
              <Icon name="sparkle" size={26} />
            </div>
            <strong>No suggestions yet</strong>
            <p>The assistant will read your prompt and suggest a clearer, more reliable version — you decide what to keep.</p>
            <Button variant="danger" className={styles.sageRunButton} disabled={running} loading={running} onClick={onRun} style={{ background: "var(--sage)", boxShadow: "0 3px 12px rgba(110,138,99,.28)" }}>
              Suggest improvements
            </Button>
          </div>
        ) : status === "error" ? (
          <div className={styles.aiIdle}>
            <div className={styles.aiErrorIcon}>!</div>
            <strong>{errorTitle}</strong>
            <p>{error || "AI improvements failed. Check your configuration and try again."}</p>
            <div className={styles.aiErrorActions}>
              {canRetryError ? (
                <Button variant="danger" className={styles.sageRunButton} disabled={running} loading={running} onClick={onRun} style={{ background: "var(--sage)", boxShadow: "0 3px 12px rgba(110,138,99,.28)" }}>
                  Try again
                </Button>
              ) : null}
              <Button variant="secondary" onClick={onKeepOriginal}>Keep original</Button>
            </div>
          </div>
        ) : result ? (
          <>
            <div className={styles.aiResults}>
              <div className={styles.aiLabel}>Original</div>
              <div className={styles.aiBlock}>
                <TokenText text={original} />
              </div>

              <div className={styles.aiImprovedRow}>
                <div className={styles.aiImprovedLabel}>Improved</div>
                <div />
              </div>
              <div className={styles.aiBlockImproved}>
                <TokenText text={result.improved} />
              </div>

              <div className={styles.whatChanged}>What changed</div>
              <div className={styles.aiChecks}>
                {result.explanation.map((item, index) => (
                  <div className={styles.aiCheck} key={`${item}-${index}`}>
                    <Icon name="check" size={14} color="var(--sage)" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className={styles.suggestTitle}>Suggested additions</div>
              <p className={styles.suggestHelp}>Pick any you want to append to your prompt.</p>
              <div className={styles.suggestList}>
                {suggestions.map((suggestion) => (
                  <button className={styles.suggestButton} key={suggestion.id} onClick={() => onToggleSuggestion(suggestion.id)} type="button">
                    <span className={clsx(styles.suggestCheck, suggestion.checked && styles.suggestCheckOn)}>
                      {suggestion.checked ? "✓" : ""}
                    </span>
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.aiFooter}>
              <Button variant="primary" size="large" onClick={onApplyImproved}>Apply improved version</Button>
              <div className={styles.aiFooterRow}>
                {anySelected ? (
                  <Button variant="sage" size="large" onClick={onApplySelected}>Apply selected additions</Button>
                ) : null}
                <Button variant="secondary" size="large" onClick={onKeepOriginal}>Keep original</Button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
