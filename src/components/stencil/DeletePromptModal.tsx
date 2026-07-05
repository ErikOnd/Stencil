"use client";

import { ConfirmModal } from "./ConfirmModal";
import styles from "./ConfirmModal.module.scss";

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
		<ConfirmModal
			width={400}
			title="Delete this prompt?"
			confirmLabel="Delete prompt"
			busy={deleting}
			onCancel={onCancel}
			onConfirm={onConfirm}
		>
			<p className={styles.deleteText}>
				<strong>{title || "Untitled prompt"}</strong> will be permanently removed. This cannot be undone.
			</p>
		</ConfirmModal>
	);
}
