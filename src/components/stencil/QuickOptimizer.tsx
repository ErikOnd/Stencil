"use client";

import { BackButton, Button, Icon } from "@/components/atoms";
import { copyTextToClipboard } from "@/lib/stencil/clipboard";
import { continuePromptList, htmlToPromptText } from "@/lib/stencil/prompt-text";
import type { ImproveResult } from "@/lib/stencil/types";
import { useRef, useState } from "react";
import styles from "./QuickOptimizer.module.scss";
import { TokenText } from "./TokenText";

export function QuickOptimizer({ onBack }: { onBack: () => void }) {
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const [input, setInput] = useState("");
	const [result, setResult] = useState("");
	const [error, setError] = useState("");
	const [running, setRunning] = useState(false);
	const [copied, setCopied] = useState(false);

	const canOptimize = !!input.trim() && !running;
	const hasResult = !!result.trim();

	function resetOutput() {
		if (result) setResult("");
		if (copied) setCopied(false);
		if (error) setError("");
	}

	function readInputRange() {
		const target = inputRef.current;
		if (!target) return { start: input.length, end: input.length };
		return { start: target.selectionStart, end: target.selectionEnd };
	}

	function commitInput(nextInput: string, nextStart: number, nextEnd = nextStart) {
		setInput(nextInput);
		resetOutput();
		requestAnimationFrame(() => {
			const target = inputRef.current;
			if (!target) return;
			const start = Math.max(0, Math.min(nextStart, nextInput.length));
			const end = Math.max(start, Math.min(nextEnd, nextInput.length));
			target.focus();
			target.setSelectionRange(start, end);
		});
	}

	function insertInputText(insert: string) {
		const { start, end } = readInputRange();
		const nextInput = `${input.slice(0, start)}${insert}${input.slice(end)}`;
		commitInput(nextInput, start + insert.length);
	}

	function handleInputKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key !== "Enter" || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;

		const { start, end } = readInputRange();
		const next = continuePromptList(input, start, end);
		if (!next) return;

		event.preventDefault();
		commitInput(next.text, next.start, next.end);
	}

	function handleInputPaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
		const html = event.clipboardData.getData("text/html");
		if (!html) return;

		const text = htmlToPromptText(html);
		if (!text.trim()) return;

		event.preventDefault();
		insertInputText(text);
	}

	async function optimize() {
		const body = input.trim();
		if (!body) {
			setError("Paste prompt text before optimizing.");
			setResult("");
			return;
		}

		setRunning(true);
		setCopied(false);
		setError("");

		try {
			const response = await fetch("/api/improve", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					body,
					title: "Quick optimizer",
					quick: true,
				}),
			});
			const payload = (await response.json()) as Partial<ImproveResult> & { error?: string };

			if (!response.ok || typeof payload.improved !== "string") {
				setResult("");
				setError(payload.error || "Prompt optimization failed.");
				return;
			}

			setResult(payload.improved);
		} catch (caught) {
			setResult("");
			setError(caught instanceof Error ? caught.message : "Prompt optimization failed.");
		} finally {
			setRunning(false);
		}
	}

	async function copyResult() {
		if (!result.trim()) return;
		await copyTextToClipboard(result);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1800);
	}

	return (
		<div className={styles.quickView}>
			<div className={styles.quickInner}>
				<div className={styles.quickTop}>
					<BackButton onClick={onBack}>Library</BackButton>
					<div className={styles.quickActions}>
						{hasResult
							? <Button variant="secondary" onClick={copyResult}>{copied ? "Copied" : "Copy optimized"}</Button>
							: (
								<Button
									variant="sageSolid"
									icon="sparkle"
									disabled={!canOptimize}
									loading={running}
									onClick={optimize}
								>
									Optimize prompt
								</Button>
							)}
					</div>
				</div>

				<section className={styles.quickOptimizer}>
					<div className={styles.quickHead}>
						<div>
							<div className={styles.quickTitle}>
								<Icon name="sparkle" size={16} color="var(--sage)" />
								<h2>Quick optimizer</h2>
							</div>
							<p>Optimize a one-off prompt without saving it.</p>
						</div>
					</div>

					<div className={styles.quickGrid}>
						<label className={styles.quickField}>
							<span>Prompt</span>
							<textarea
								ref={inputRef}
								value={input}
								onChange={(event) => {
									setInput(event.currentTarget.value);
									resetOutput();
								}}
								onKeyDown={handleInputKeyDown}
								onPaste={handleInputPaste}
								placeholder="Paste a rough prompt..."
								spellCheck={false}
							/>
						</label>

						<div className={styles.quickField}>
							<span>Optimized</span>
							<div className={styles.outputBox} data-empty={!result.trim()}>
								{result.trim()
									? <TokenText text={result} />
									: error
									? <span className={styles.errorText}>{error}</span>
									: "No output yet."}
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
