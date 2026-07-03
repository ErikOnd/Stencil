"use client";

import { Icon } from "@/components/atoms";
import type { RefObject } from "react";
import styles from "./SearchBar.module.scss";

export function SearchBar({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className={styles.searchWrap}>
      <span className={styles.searchIcon}>
        <Icon name="search" size={16} />
      </span>
      <input
        ref={inputRef}
        className={styles.searchInput}
        value={value}
        onInput={(event) => onChange(event.currentTarget.value)}
        placeholder="Search prompts…"
      />
      <span className={styles.kbd}>⌘K</span>
    </div>
  );
}
