"use client";

import { Button, Icon, Modal } from "@/components/atoms";
import styles from "./DeletePromptModal.module.scss";

export function DeletePromptModal({
  title,
  deleting,
  onCancel,
  onConfirm,
}: {
  title: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal width={400}>
      <div className={styles.deleteIcon}>
        <Icon name="trash" size={22} />
      </div>
      <div className={styles.deleteTitle}>Delete this prompt?</div>
      <p className={styles.deleteText}>
        <strong>{title || "Untitled prompt"}</strong> will be permanently removed. This cannot be undone.
      </p>
      <div className={styles.modalActions}>
        <Button variant="secondary" size="large" disabled={deleting} onClick={onCancel}>Cancel</Button>
        <Button variant="danger" size="large" loading={deleting} disabled={deleting} onClick={onConfirm}>
          Delete prompt
        </Button>
      </div>
    </Modal>
  );
}
