"use client";

import { BackButton, Button, Icon, Tag } from "@/components/atoms";
import { continuePromptList, htmlToPromptText } from "@/lib/stencil/prompt-text";
import type { PromptDraft } from "@/lib/stencil/types";
import { useRef } from "react";
import styles from "./PromptEditor.module.scss";
import { VariablePanel } from "./VariablePanel";

export function PromptEditor({
	draft,
	editing,
	tagInput,
	hasSelection,
	saving,
	deleting,
	titleError,
	canImprove,
	onDraft,
	onBodySelect,
	onBodyRange,
	onTagInput,
	onTagKey,
	onTagCommit,
	onRemoveTag,
	onMark,
	onBack,
	onAI,
	onSave,
	onDelete,
	onFieldType,
	onEditVariable,
	onRemoveVariable,
}: {
	draft: PromptDraft;
	editing: boolean;
	tagInput: string;
	hasSelection: boolean;
	saving: boolean;
	deleting: boolean;
	titleError: string;
	canImprove: boolean;
	onDraft: (patch: Partial<PromptDraft>) => void;
	onBodySelect: (event: React.SyntheticEvent<HTMLTextAreaElement>) => void;
	onBodyRange: (start: number, end: number) => void;
	onTagInput: (value: string) => void;
	onTagKey: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	onTagCommit: () => void;
	onRemoveTag: (index: number) => void;
	onMark: () => void;
	onBack: () => void;
	onAI: () => void;
	onSave: () => void;
	onDelete: () => void;
	onFieldType: (index: number, multiline: boolean) => void;
	onEditVariable: (index: number) => void;
	onRemoveVariable: (index: number) => void;
}) {
	const bodyRef = useRef<HTMLTextAreaElement>(null);

	function readBodyRange() {
		const target = bodyRef.current;
		if (!target) return { start: draft.body.length, end: draft.body.length };
		return { start: target.selectionStart, end: target.selectionEnd };
	}

	function commitBody(nextBody: string, nextStart: number, nextEnd = nextStart) {
		onDraft({ body: nextBody });
		requestAnimationFrame(() => {
			const target = bodyRef.current;
			if (!target) return;
			const start = Math.max(0, Math.min(nextStart, nextBody.length));
			const end = Math.max(start, Math.min(nextEnd, nextBody.length));
			target.focus();
			target.setSelectionRange(start, end);
			onBodyRange(start, end);
		});
	}

	function insertBodyText(insert: string) {
		const { start, end } = readBodyRange();
		const nextBody = `${draft.body.slice(0, start)}${insert}${draft.body.slice(end)}`;
		commitBody(nextBody, start + insert.length);
	}

	function handleBodyKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key !== "Enter" || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;

		const { start, end } = readBodyRange();
		const next = continuePromptList(draft.body, start, end);
		if (!next) return;

		event.preventDefault();
		commitBody(next.text, next.start, next.end);
	}

	function handleBodyPaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
		const html = event.clipboardData.getData("text/html");
		if (!html) return;

		const text = htmlToPromptText(html);
		if (!text.trim()) return;

		event.preventDefault();
		insertBodyText(text);
	}

	return (
		<div className={styles.editorView}>
			<div className={styles.editorScroll}>
				<div className={styles.editorInner}>
					<div className={styles.editorTop}>
						<BackButton onClick={onBack}>Library</BackButton>
						<div className={styles.editorActions}>
							{editing
								? (
									<Button
										className={styles.deletePromptButton}
										variant="secondary"
										aria-label="Delete prompt"
										title="Delete prompt"
										disabled={deleting || saving}
										onClick={onDelete}
									>
										<Icon name="trash" size={19} />
									</Button>
								)
								: null}
							{canImprove ? <Button variant="sage" icon="sparkle" onClick={onAI}>Improve with AI</Button> : null}
							<Button variant="primary" loading={saving} onClick={onSave}>Save prompt</Button>
						</div>
					</div>

					<div className={styles.editorEyebrow}>{editing ? "Edit prompt" : "New prompt"}</div>
					<input
						className={styles.plainTitle}
						value={draft.title}
						onInput={(event) => onDraft({ title: event.currentTarget.value })}
						placeholder="Prompt title"
						aria-invalid={!!titleError}
						aria-describedby={titleError ? "prompt-title-error" : undefined}
					/>
					{titleError ? <div className={styles.titleError} id="prompt-title-error">{titleError}</div> : null}
					<input
						className={styles.plainDesc}
						value={draft.description}
						onInput={(event) => onDraft({ description: event.currentTarget.value })}
						placeholder="Add a short description…"
					/>

					<div className={styles.tagEditor}>
						{draft.tags.map((tag, index) => (
							<Tag key={`${tag}-${index}`}>
								{tag}
								<button className={styles.removeTag} onClick={() => onRemoveTag(index)} type="button">×</button>
							</Tag>
						))}
						<input
							className={styles.tagInput}
							value={tagInput}
							onInput={(event) => onTagInput(event.currentTarget.value)}
							onKeyDown={onTagKey}
							onBlur={onTagCommit}
							placeholder="+ tag"
						/>
					</div>

					<div className={styles.selectionRow}>
						<div className={styles.selectionHint}>Select text in your prompt, then mark it as a variable.</div>
						{hasSelection
							? (
								<button className={styles.markButton} onClick={onMark} type="button">
									{"{ }"} Mark as variable
								</button>
							)
							: null}
					</div>

					<div className={styles.bodyBox}>
						<textarea
							ref={bodyRef}
							className={styles.bodyTextarea}
							value={draft.body}
							onInput={(event) => onDraft({ body: event.currentTarget.value })}
							onKeyDown={handleBodyKeyDown}
							onPaste={handleBodyPaste}
							onSelect={onBodySelect}
							onKeyUp={onBodySelect}
							onMouseUp={onBodySelect}
							onClick={onBodySelect}
							placeholder="Write your prompt here… e.g. Please build this Text Image component from Figma: [figma link]."
							spellCheck={false}
						/>
					</div>
					<div className={styles.editorHelp}>
						Variables appear as <span>{"{{componentName}}"}</span> and become form fields when the prompt is used.
					</div>
				</div>
			</div>

			<VariablePanel
				variables={draft.variables}
				onFieldType={onFieldType}
				onEdit={onEditVariable}
				onRemove={onRemoveVariable}
			/>
		</div>
	);
}
