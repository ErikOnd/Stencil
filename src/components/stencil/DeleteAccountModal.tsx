"use client";

import { Checkbox } from "@/components/atoms";
import { ConfirmModal } from "./ConfirmModal";
import styles from "./DeleteAccountModal.module.scss";
import confirmStyles from "./ConfirmModal.module.scss";

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
    <ConfirmModal
      width={420}
      title="Delete your account?"
      confirmLabel="Delete account"
      confirmDisabled={!acknowledged}
      busy={deleting}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <p className={confirmStyles.deleteText}>
        This permanently removes your library and all <strong>{count}</strong> saved prompts. This can’t be undone.
      </p>
      <label className={styles.deleteAck}>
        <Checkbox checked={acknowledged} onClick={onToggle} />
        <span>I understand this will delete everything and can’t be reversed.</span>
      </label>
    </ConfirmModal>
  );
}
