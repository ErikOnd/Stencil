"use client";

import { Button, Modal, Toggle } from "@/components/atoms";
import type { PromptVariable } from "@/lib/stencil/types";
import clsx from "clsx";
import styles from "./VariableModal.module.scss";

export type VariableModalState = PromptVariable & {
  editingIndex: number | null;
  range: { start: number; end: number } | null;
};

export function VariableModal({
  value,
  onChange,
  onCancel,
  onSave,
}: {
  value: VariableModalState;
  onChange: (patch: Partial<VariableModalState>) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <Modal width={460}>
      <div className={styles.modalHead}>
        <strong>{value.editingIndex == null ? "New variable" : "Edit variable"}</strong>
        <button className={styles.closeButton} onClick={onCancel} type="button">×</button>
      </div>

      <div className={styles.modalFields}>
        <div>
          <label>Variable name</label>
          <div className={styles.nameWrap}>
            <span>{"{{"}</span>
            <input className={styles.modalNameInput} value={value.name} onInput={(event) => onChange({ name: event.currentTarget.value })} />
            <span>{"}}"}</span>
          </div>
        </div>
        <div>
          <label>Label</label>
          <input
            className={styles.modalInput}
            value={value.label}
            onInput={(event) => onChange({ label: event.currentTarget.value })}
            placeholder="Component name"
          />
        </div>
        <div>
          <label>Placeholder / examples</label>
          <input
            className={styles.modalInput}
            value={value.placeholder}
            onInput={(event) => onChange({ placeholder: event.currentTarget.value })}
            placeholder="Hero section, Text Image, Pricing card"
          />
        </div>
        <div>
          <label>Field type</label>
          <div className={styles.fieldTypeRow}>
            <button
              className={clsx(styles.typeButton, !value.multiline && styles.typeButtonActive)}
              onClick={() => onChange({ multiline: false })}
              type="button"
            >
              <span className={styles.mutedLine} style={{ width: 14 }} />
              Single line
            </button>
            <button
              className={clsx(styles.typeButton, value.multiline && styles.typeButtonActive)}
              onClick={() => onChange({ multiline: true })}
              type="button"
            >
              <span className={styles.stackLines} style={{ gap: 2 }}>
                <span className={styles.mutedLine} style={{ width: 14 }} />
                <span className={styles.mutedLine} style={{ width: 14 }} />
                <span className={styles.mutedLine} style={{ width: 9 }} />
              </span>
              Text area
            </button>
          </div>
          <div className={styles.fieldNote}>Choose how this value is entered when the prompt is used.</div>
        </div>
        <div>
          <label>
            Default value <span style={{ color: "var(--ink3)", fontWeight: 500 }}>(optional)</span>
          </label>
          <input
            className={styles.modalInput}
            value={value.default}
            onInput={(event) => onChange({ default: event.currentTarget.value })}
            placeholder="Leave empty for none"
          />
        </div>
        <div className={styles.requiredRow}>
          <div>
            <strong>Required</strong>
            <span>Must be filled before copying.</span>
          </div>
          <Toggle checked={value.required} onClick={() => onChange({ required: !value.required })} aria-label="Required" />
        </div>
      </div>

      <div className={styles.modalActions}>
        <Button variant="secondary" size="large" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="large" onClick={onSave}>Save variable</Button>
      </div>
    </Modal>
  );
}
