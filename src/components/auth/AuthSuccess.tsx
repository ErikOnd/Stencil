"use client";

import { Icon } from "@/components/atoms";
import styles from "./AuthSuccess.module.scss";

export function AuthSuccess({ title, subtitle, onReset }: { title: string; subtitle: string; onReset: () => void }) {
  return (
    <div className={styles.success}>
      <div className={styles.successIcon}>
        <Icon name="check" size={30} color="#fff" />
      </div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button className={styles.submit} onClick={onReset} type="button" style={{ width: "auto", paddingInline: 22 }}>
        Back to sign in
      </button>
    </div>
  );
}
