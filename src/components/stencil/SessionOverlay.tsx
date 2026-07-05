"use client";

import { Button, Icon } from "@/components/atoms";
import Image from "next/image";
import styles from "./SessionOverlay.module.scss";

export function SessionOverlay({
	status,
	onAction,
}: {
	status: "out" | "deleted";
	onAction: () => void;
}) {
	return (
		<div className={styles.sessionOverlay}>
			<div className={styles.sessionCard}>
				<div className={styles.sessionBrand}>
					<Image src="/assets/stencil-logo-transparent.png?v=3" alt="Stencil" width={28} height={28} unoptimized />
					<span>Stencil</span>
				</div>
				<div className={styles.sessionIcon}>
					<Icon name={status === "deleted" ? "trash" : "logout"} size={26} />
				</div>
				<h1>{status === "deleted" ? "Your account was deleted" : "You’ve been signed out"}</h1>
				<p>
					{status === "deleted"
						? "Your library and all saved prompts have been permanently removed."
						: "Your prompts are saved locally and will be here when you return."}
				</p>
				<Button variant="primary" size="large" onClick={onAction}>
					{status === "deleted" ? "Start a new library" : "Sign back in"}
				</Button>
			</div>
		</div>
	);
}
