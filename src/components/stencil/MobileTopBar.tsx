"use client";

import { Icon, IconButton } from "@/components/atoms";
import Image from "next/image";
import styles from "./MobileTopBar.module.scss";

export function MobileTopBar({ onMenu, onNew }: { onMenu: () => void; onNew: () => void }) {
	return (
		<div className={styles.mobileTop}>
			<IconButton className={styles.mobileIconButton} aria-label="Menu" onClick={onMenu}>
				<Icon name="menu" size={20} />
			</IconButton>
			<div className={styles.mobileBrand}>
				<Image src="/assets/stencil-logo-transparent.png?v=3" alt="Stencil" width={24} height={24} unoptimized />
				<span>Stencil</span>
			</div>
			<IconButton className={styles.mobileNew} aria-label="New prompt" onClick={onNew}>
				<Icon name="plus" size={20} />
			</IconButton>
		</div>
	);
}
