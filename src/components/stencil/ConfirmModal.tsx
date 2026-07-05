"use client";

import { Button, Icon, Modal, ModalActions } from "@/components/atoms";
import type { ReactNode } from "react";
import styles from "./ConfirmModal.module.scss";

export function ConfirmModal({
  width,
  title,
  confirmLabel,
  confirmDisabled,
  busy,
  onCancel,
  onConfirm,
  children,
}: {
  width?: number;
  title: string;
  confirmLabel: string;
  confirmDisabled?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  children: ReactNode;
}) {
  return (
    <Modal width={width}>
      <div className={styles.deleteIcon}>
        <Icon name="trash" size={22} />
      </div>
      <div className={styles.deleteTitle}>{title}</div>
      {children}
      <ModalActions>
        <Button variant="secondary" size="large" disabled={busy} onClick={onCancel}>Cancel</Button>
        <Button variant="danger" size="large" disabled={confirmDisabled || busy} loading={busy} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </ModalActions>
    </Modal>
  );
}
