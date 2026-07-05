"use client";

import { BackButton, Button, Icon, Input, Textarea } from "@/components/atoms";
import type { PromptDraft, PromptRecord } from "@/lib/stencil/types";
import { guessMultiline } from "@/lib/stencil/utils";
import { PreviewText } from "./TokenText";
import styles from "./PromptRunner.module.scss";

export function PromptRunner({
  target,
  values,
  copied,
  canImprove,
  onBack,
  onValue,
  onReset,
  onCopy,
  onImprove,
}: {
  target: PromptRecord | PromptDraft;
  values: Record<string, string>;
  copied: boolean;
  canImprove: boolean;
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
      <BackButton className={styles.backButton} onClick={onBack} />
      <div className={styles.useEyebrow}>Fill in the prompt</div>
      <h1 className={styles.useTitle}>{target.title || "Untitled prompt"}</h1>
      <div className={styles.fillRow}>
        <span className={styles.filledLabel}>{filled} of {total} filled</span>
        <button className={styles.resetButton} onClick={onReset} type="button">Reset values</button>
      </div>

      <div className={styles.fieldStack}>
        {target.variables.map((variable) => (
          <div key={variable.name}>
            <label className={styles.fieldLabel}>
              {variable.label}
              <span>{variable.required ? " *" : ""}</span>
            </label>
            {guessMultiline(variable) ? (
              <Textarea
                className={styles.runnerTextarea}
                value={values[variable.name] ?? ""}
                onInput={(event) => onValue(variable.name, event.currentTarget.value)}
                placeholder={variable.placeholder}
              />
            ) : (
              <Input
                value={values[variable.name] ?? ""}
                onInput={(event) => onValue(variable.name, event.currentTarget.value)}
                placeholder={variable.placeholder}
              />
            )}
          </div>
        ))}
      </div>

      <div className={styles.previewHead}>
        <strong>Final prompt</strong>
        <span>live preview</span>
      </div>
      <div className={styles.previewText}>
        <PreviewText body={target.body} variables={target.variables} values={values} />
      </div>
      <div className={styles.previewHelp}>Highlighted chips are values still to fill in. They stay as placeholders until you type a value.</div>

      <div className={styles.copyBlock}>
        {copied ? (
          <Button variant="sageSolid" size="large" icon="check" onClick={onCopy}>
            Copied to clipboard
          </Button>
        ) : (
          <Button variant="primary" size="large" icon="copy" onClick={onCopy}>
            Copy final prompt
          </Button>
        )}
        {canImprove ? (
          <button className={styles.improveCopyButton} onClick={onImprove} type="button">
            <Icon name="sparkle" size={15} color="var(--sage)" />
            Improve with AI
          </button>
        ) : null}
      </div>
    </div>
  );
}
