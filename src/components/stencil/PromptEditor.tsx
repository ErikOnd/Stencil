"use client";

import { BackButton, Button, Icon, Tag } from "@/components/atoms";
import type { PromptDraft } from "@/lib/stencil/types";
import { useRef } from "react";
import styles from "./PromptEditor.module.scss";
import { VariablePanel } from "./VariablePanel";

const LIST_TAGS = new Set(["ul", "ol"]);
const BLOCK_TAGS = new Set([
	"address",
	"article",
	"aside",
	"blockquote",
	"div",
	"dl",
	"fieldset",
	"figcaption",
	"figure",
	"footer",
	"form",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"header",
	"hr",
	"li",
	"main",
	"nav",
	"ol",
	"p",
	"pre",
	"section",
	"table",
	"ul",
]);

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
		if (start !== end) return;

		const lineStart = draft.body.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
		const nextLineBreak = draft.body.indexOf("\n", start);
		const lineEnd = nextLineBreak === -1 ? draft.body.length : nextLineBreak;
		const beforeCursor = draft.body.slice(lineStart, start);
		const afterCursor = draft.body.slice(start, lineEnd);
		const emptyNumbered = beforeCursor.match(/^(\s*)\d+\.\s*$/);
		const emptyBulleted = beforeCursor.match(/^(\s*)[-*+]\s*$/);

		if ((emptyNumbered || emptyBulleted) && !afterCursor.trim()) {
			event.preventDefault();
			const indent = emptyNumbered?.[1] ?? emptyBulleted?.[1] ?? "";
			const nextBody = `${draft.body.slice(0, lineStart)}${indent}${draft.body.slice(lineEnd)}`;
			commitBody(nextBody, lineStart + indent.length);
			return;
		}

		const numbered = beforeCursor.match(/^(\s*)(\d+)\.\s+(.+)$/);
		if (numbered?.[3].trim()) {
			event.preventDefault();
			const nextNumber = Number(numbered[2]) + 1;
			const insert = `\n${numbered[1]}${nextNumber}. `;
			const nextBody = `${draft.body.slice(0, start)}${insert}${draft.body.slice(start)}`;
			commitBody(nextBody, start + insert.length);
			return;
		}

		const bulleted = beforeCursor.match(/^(\s*)([-*+])\s+(.+)$/);
		if (bulleted?.[3].trim()) {
			event.preventDefault();
			const insert = `\n${bulleted[1]}${bulleted[2]} `;
			const nextBody = `${draft.body.slice(0, start)}${insert}${draft.body.slice(start)}`;
			commitBody(nextBody, start + insert.length);
		}
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

function htmlToPromptText(html: string) {
	const document = new DOMParser().parseFromString(html, "text/html");
	return normalizePromptText(renderHtmlChildren(document.body, 0));
}

function renderHtmlChildren(node: Node, listDepth: number) {
	return Array.from(node.childNodes).map((child) => renderHtmlNode(child, listDepth)).join("");
}

function renderHtmlNode(node: Node, listDepth: number): string {
	if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").replace(/\u00a0/g, " ");
	if (!(node instanceof HTMLElement)) return "";

	const tagName = node.tagName.toLowerCase();

	if (tagName === "br") return "\n";
	if (/^h[1-6]$/.test(tagName)) return asTextBlock(renderInlineHtml(node, listDepth));
	if (tagName === "p") return asTextBlock(renderInlineHtml(node, listDepth));
	if (tagName === "code" && node.closest("pre")) return node.textContent ?? "";
	if (tagName === "pre") return asTextBlock((node.textContent ?? "").trimEnd());
	if (tagName === "ul" || tagName === "ol") return renderList(node, tagName === "ol", listDepth);
	if (tagName === "blockquote") return asTextBlock(renderHtmlChildren(node, listDepth));
	if (tagName === "hr") return "\n\n";
	if (BLOCK_TAGS.has(tagName)) {
		const rendered = renderHtmlChildren(node, listDepth);
		return hasBlockChild(node) ? rendered : asTextBlock(rendered);
	}

	return renderHtmlChildren(node, listDepth);
}

function hasBlockChild(element: HTMLElement) {
	return Array.from(element.children).some((child) =>
		child instanceof HTMLElement && BLOCK_TAGS.has(child.tagName.toLowerCase())
	);
}

function renderInlineHtml(element: HTMLElement, listDepth: number) {
	return normalizeInline(renderHtmlChildren(element, listDepth));
}

function renderList(list: HTMLElement, ordered: boolean, listDepth: number) {
	let itemNumber = 1;
	const lines: string[] = [];

	Array.from(list.children).forEach((child) => {
		if (!(child instanceof HTMLElement) || child.tagName.toLowerCase() !== "li") return;

		const { content, nested } = renderListItem(child, listDepth);
		const marker = ordered ? `${itemNumber}. ` : "- ";
		const indent = "  ".repeat(listDepth);
		lines.push(`${indent}${marker}${content}`);
		nested.forEach((nestedList) => {
			if (nestedList) lines.push(nestedList.trimEnd());
		});
		itemNumber += 1;
	});

	return lines.length ? `${lines.join("\n")}\n\n` : "";
}

function renderListItem(item: HTMLElement, listDepth: number) {
	const contentParts: string[] = [];
	const nested: string[] = [];

	Array.from(item.childNodes).forEach((child) => {
		if (child instanceof HTMLElement) {
			const tagName = child.tagName.toLowerCase();
			if (LIST_TAGS.has(tagName)) {
				nested.push(renderList(child, tagName === "ol", listDepth + 1));
				return;
			}
			if (BLOCK_TAGS.has(tagName)) {
				contentParts.push(renderInlineHtml(child, listDepth));
				return;
			}
		}

		contentParts.push(renderHtmlNode(child, listDepth));
	});

	return { content: normalizeInline(contentParts.join(" ")), nested };
}

function asTextBlock(content: string) {
	const clean = normalizeInline(content);
	return clean ? `${clean}\n\n` : "";
}

function normalizeInline(value: string) {
	return value.replace(/\r\n?/g, "\n").replace(/\s+/g, " ").trim();
}

function normalizePromptText(value: string) {
	return value
		.replace(/\r\n?/g, "\n")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}
