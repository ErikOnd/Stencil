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

export type PromptTextChange = {
	text: string;
	start: number;
	end: number;
};

export function continuePromptList(text: string, start: number, end: number): PromptTextChange | null {
	if (start !== end) return null;

	const lineStart = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
	const nextLineBreak = text.indexOf("\n", start);
	const lineEnd = nextLineBreak === -1 ? text.length : nextLineBreak;
	const beforeCursor = text.slice(lineStart, start);
	const afterCursor = text.slice(start, lineEnd);
	const emptyNumbered = beforeCursor.match(/^(\s*)\d+\.\s*$/);
	const emptyBulleted = beforeCursor.match(/^(\s*)[-*+]\s*$/);

	if ((emptyNumbered || emptyBulleted) && !afterCursor.trim()) {
		const indent = emptyNumbered?.[1] ?? emptyBulleted?.[1] ?? "";
		const nextText = `${text.slice(0, lineStart)}${indent}${text.slice(lineEnd)}`;
		const nextStart = lineStart + indent.length;
		return { text: nextText, start: nextStart, end: nextStart };
	}

	const numbered = beforeCursor.match(/^(\s*)(\d+)\.\s+(.+)$/);
	if (numbered?.[3].trim()) {
		const nextNumber = Number(numbered[2]) + 1;
		const insert = `\n${numbered[1]}${nextNumber}. `;
		const nextText = `${text.slice(0, start)}${insert}${text.slice(start)}`;
		const nextStart = start + insert.length;
		return { text: nextText, start: nextStart, end: nextStart };
	}

	const bulleted = beforeCursor.match(/^(\s*)([-*+])\s+(.+)$/);
	if (bulleted?.[3].trim()) {
		const insert = `\n${bulleted[1]}${bulleted[2]} `;
		const nextText = `${text.slice(0, start)}${insert}${text.slice(start)}`;
		const nextStart = start + insert.length;
		return { text: nextText, start: nextStart, end: nextStart };
	}

	return null;
}

export function htmlToPromptText(html: string) {
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
