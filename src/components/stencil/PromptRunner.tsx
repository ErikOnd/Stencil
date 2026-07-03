"use client";

import { Icon } from "@/components/atoms";
import type { PromptDraft, PromptRecord } from "@/lib/stencil/types";
import { guessMultiline } from "@/lib/stencil/utils";
import { PreviewText } from "./TokenText";
import styles from "./PromptRunner.module.scss";

export function PromptRunner({
  target,
  values,
  copied,
  onBack,
  onValue,
  onReset,
  onCopy,
  onImprove,
}: {
  target: PromptRecord | PromptDraft;
  values: Record<string, string>;
  copied: boolean;
  onBack: () => void;
  onValue: (name: string, value: string) => void;
  onReset: () => void;
  onCopy: () => void;
  onImprove: () => void;
}) {
  const total = target.variables.length;
  const filled = target.variables.filter((variable) => values[variable.name]?.trim()).length;

  return (
    <div className={styles.useView}>
      <div className={styles.useEditor}>
        <div className={styles.useEditorInner}>
          <button className={styles.backButton} onClick={onBack} type="button" style={{ margin: "6px 0 18px -8px" }}>
            <Icon name="chevronLeft" size={16} />
            Back
          </button>
          <div className={styles.useEyebrow}>Fill in the prompt</div>
          <h1 className={styles.useTitle}>{target.title || "Untitled prompt"}</h1>
          <div className={styles.fillRow}>
            <span className={styles.filledLabel}>{filled} of {total} filled</span>
            <button className={styles.resetButton} onClick={onReset} type="button">Reset values</button>
          </div>

          <div className={styles.fieldStack}>
            {target.variables.map((variable) => {
              const multiline = guessMultiline(variable);
              return (
                <div className={styles.field} key={variable.name}>
                  <label>
                    {variable.label}
                    <span>{variable.required ? " *" : ""}</span>
                  </label>
                  {multiline ? (
                    <textarea
                      className={styles.runnerTextarea}
                      value={values[variable.name] ?? ""}
                      onInput={(event) => onValue(variable.name, event.currentTarget.value)}
                      placeholder={variable.placeholder}
                    />
                  ) : (
                    <input
                      className={styles.runnerInput}
                      value={values[variable.name] ?? ""}
                      onInput={(event) => onValue(variable.name, event.currentTarget.value)}
                      placeholder={variable.placeholder}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <aside className={styles.usePreview}>
        <div className={styles.previewHead}>
          <strong>Final prompt</strong>
          <span>live preview</span>
        </div>
        <div className={styles.previewBody}>
          <div className={styles.previewText}>
            <PreviewText body={target.body} variables={target.variables} values={values} />
          </div>
          <div className={styles.previewHelp}>Highlighted chips are values still to fill in. They stay as placeholders until you type a value.</div>
        </div>
        <div className={styles.copyBlock}>
          {copied ? (
            <button className={styles.copiedButton} onClick={onCopy} type="button">
              <Icon name="check" size={16} />
              Copied to clipboard
            </button>
          ) : (
            <button className={styles.copyButton} onClick={onCopy} type="button">
              <Icon name="copy" size={16} />
              Copy final prompt
            </button>
          )}
          <button className={styles.improveCopyButton} onClick={onImprove} type="button">
            <Icon name="sparkle" size={15} color="var(--sage)" />
            Improve before copy
          </button>
        </div>
      </aside>
    </div>
  );
}
