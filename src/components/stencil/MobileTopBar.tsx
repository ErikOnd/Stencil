"use client";

import { Icon } from "@/components/atoms";
import Image from "next/image";
import styles from "./MobileTopBar.module.scss";

export function MobileTopBar({ onMenu, onNew }: { onMenu: () => void; onNew: () => void }) {
  return (
    <div className={styles.mobileTop}>
      <button className={styles.mobileIconButton} aria-label="Menu" onClick={onMenu} type="button">
        <Icon name="menu" size={20} />
      </button>
      <div className={styles.mobileBrand}>
        <Image src="/assets/stencil-logo.png" alt="Stencil" width={24} height={24} />
        <span>Stencil</span>
      </div>
      <button className={styles.mobileNew} aria-label="New prompt" onClick={onNew} type="button">
        <Icon name="plus" size={20} />
      </button>
    </div>
  );
}
