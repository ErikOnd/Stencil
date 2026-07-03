"use client";

import { Button, Checkbox, Icon, Modal } from "@/components/atoms";
import styles from "./DeleteAccountModal.module.scss";

export function DeleteAccountModal({
  count,
  acknowledged,
  deleting,
  onToggle,
  onCancel,
  onConfirm,
}: {
  count: number;
  acknowledged: boolean;
  deleting: boolean;
  onToggle: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal width={420}>
      <div className={styles.deleteIcon}>
        <Icon name="trash" size={22} />
      </div>
      <div className={styles.deleteTitle}>Delete your account?</div>
      <p className={styles.deleteText}>
        This permanently removes your library and all <strong>{count}</strong> saved prompts. This can’t be undone.
      </p>
      <label className={styles.deleteAck}>
        <Checkbox checked={acknowledged} onClick={onToggle} />
        <span>I understand this will delete everything and can’t be reversed.</span>
      </label>
      <div className={styles.modalActions}>
        <Button variant="secondary" size="large" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" size="large" disabled={!acknowledged || deleting} loading={deleting} onClick={onConfirm}>
          Delete account
        </Button>
      </div>
    </Modal>
  );
}
