"use client";

import { Button, Icon } from "@/components/atoms";
import type { PromptDraft } from "@/lib/stencil/types";
import clsx from "clsx";
import styles from "./EmptyState.module.scss";

type EmptyStateProps =
	| {
		kind: "none";
		examples: PromptDraft[];
		onExample: (draft: PromptDraft) => void;
		onNew: () => void;
		onClear?: never;
		search?: never;
	}
	| { kind: "noresults"; onClear: () => void; search: string; onNew?: never }
	| { kind: "nofilter"; onClear: () => void; onNew?: never; search?: never };

export function EmptyState(props: EmptyStateProps) {
	if (props.kind === "none") {
		return (
			<div className={styles.empty}>
				<div className={styles.emptyIcon}>
					<Icon name="plus" size={26} />
				</div>
				<h3>Your library is empty</h3>
				<p>
					Create your first prompt template, mark the parts that change as variables, and reuse it whenever you need it.
				</p>
				<div className={styles.examples} aria-label="Starter prompt examples">
					{props.examples.map((example) => (
						<button
							className={styles.exampleButton}
							key={example.title}
							onClick={() => props.onExample(example)}
							type="button"
						>
							<span>
								<strong>{example.title}</strong>
								<small>{example.description}</small>
							</span>
							<Icon name="plus" size={15} />
						</button>
					))}
				</div>
				<Button variant="primary" onClick={props.onNew}>Create your first prompt</Button>
			</div>
		);
	}

	if (props.kind === "noresults") {
		return (
			<div className={clsx(styles.empty, styles.emptySmall)}>
				<div className={clsx(styles.emptyIcon, styles.emptyIconRound)}>
					<Icon name="search" size={22} />
				</div>
				<h3>No prompts match “{props.search}”</h3>
				<p>Try a different word, or clear the search to see everything again.</p>
				<Button variant="secondary" onClick={props.onClear}>Clear search</Button>
			</div>
		);
	}

	return (
		<div className={clsx(styles.empty, styles.emptySmall)}>
			<h3>Nothing here yet</h3>
			<p>No prompts match this filter.</p>
			<Button variant="secondary" onClick={props.onClear}>Show all prompts</Button>
		</div>
	);
}
