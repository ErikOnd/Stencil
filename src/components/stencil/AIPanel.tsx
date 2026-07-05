"use client";

import { Button, CloseButton, Icon } from "@/components/atoms";
import type { ImproveResult } from "@/lib/stencil/types";
import styles from "./AIPanel.module.scss";
import { TokenText } from "./TokenText";

export function AIPanel({
	contextLabel,
	status,
	error,
	original,
	result,
	running,
	onClose,
	onRun,
	onApplyImproved,
	onKeepOriginal,
}: {
	contextLabel: string;
	status: "idle" | "done" | "error";
	error: string;
	original: string;
	result: ImproveResult | null;
	running: boolean;
	onClose: () => void;
	onRun: () => void;
	onApplyImproved: () => void;
	onKeepOriginal: () => void;
}) {
	const errorTitle = error.includes("already been improved")
		? "Prompt already improved"
		: error.includes("Add prompt text")
		? "Add prompt text"
		: error.includes("auto-save") || error.includes("Save this prompt")
		? "Could not save prompt"
		: "AI is not available";
	const canRetryError = !error.includes("already been improved") && !error.includes("Add prompt text");

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
					<CloseButton onClick={onClose} />
				</div>

				{status === "idle"
					? (
						<div className={styles.aiIdle}>
							<div className={styles.aiIdleIcon}>
								<Icon name="sparkle" size={26} />
							</div>
							<strong>No improved version yet</strong>
							<p>
								The assistant will read your prompt and suggest a clearer, more reliable version — you decide what to
								keep.
							</p>
							<Button variant="sageSolid" disabled={running} loading={running} onClick={onRun}>
								Suggest improvements
							</Button>
						</div>
					)
					: status === "error"
					? (
						<div className={styles.aiIdle}>
							<div className={styles.aiErrorIcon}>!</div>
							<strong>{errorTitle}</strong>
							<p>{error || "AI improvements failed. Check your configuration and try again."}</p>
							<div className={styles.aiErrorActions}>
								{canRetryError
									? (
										<Button variant="sageSolid" disabled={running} loading={running} onClick={onRun}>
											Try again
										</Button>
									)
									: null}
								<Button variant="secondary" onClick={onKeepOriginal}>Keep original</Button>
							</div>
						</div>
					)
					: result
					? (
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
							</div>

							<div className={styles.aiFooter}>
								<Button variant="primary" size="large" onClick={onApplyImproved}>Apply improved version</Button>
								<Button variant="secondary" size="large" onClick={onKeepOriginal}>Keep original</Button>
							</div>
						</>
					)
					: null}
			</div>
		</div>
	);
}
