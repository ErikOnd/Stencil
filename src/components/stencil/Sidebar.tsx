"use client";

import { Chip, Icon } from "@/components/atoms";
import type { PromptRecord } from "@/lib/stencil/types";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import styles from "./Sidebar.module.scss";

type SidebarProps = {
  prompts: PromptRecord[];
  activeTag: string;
  libFilter: "all" | "favorites" | "recent";
  tagsExpanded: boolean;
  accountOpen: boolean;
  mobileOpen: boolean;
  email: string;
  userName: string;
  appVersion: string;
  onNew: () => void;
  onTag: (tag: string) => void;
  onToggleTags: () => void;
  onFilter: (filter: "all" | "favorites" | "recent") => void;
  onToggleAccount: () => void;
  onLogout: () => void;
  onDelete: () => void;
};

export function Sidebar({
  prompts,
  activeTag,
  libFilter,
  tagsExpanded,
  accountOpen,
  mobileOpen,
  email,
  userName,
  appVersion,
  onNew,
  onTag,
  onToggleTags,
  onFilter,
  onToggleAccount,
  onLogout,
  onDelete,
}: SidebarProps) {
  const allTags = ["All"];
  prompts.forEach((prompt) => prompt.tags.forEach((tag) => {
    if (!allTags.includes(tag)) allTags.push(tag);
  }));

  const tagLimit = 10;
  const overflow = allTags.length > tagLimit;
  let shownTags = allTags;
  if (overflow && !tagsExpanded) {
    shownTags = allTags.slice(0, tagLimit);
    if (!shownTags.includes(activeTag)) shownTags = shownTags.concat(activeTag);
  }
  const displayName = userName.trim() || email || "You";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className={clsx(styles.sidebar, mobileOpen && styles.sidebarOpen)}>
      <div className={styles.brandRow}>
        <Image src="/assets/stencil-logo.png" alt="Stencil" width={28} height={28} />
        <div className={styles.brandText}>Stencil</div>
        <div className={styles.version}>v{appVersion}</div>
      </div>

      <button className={styles.newButton} onClick={onNew} type="button">
        <Icon name="plus" size={17} />
        New prompt
      </button>

      <nav className={styles.nav}>
        <NavItem active={libFilter === "all" && activeTag === "All"} icon="grid" label="All prompts" onClick={() => onFilter("all")} />
        <NavItem active={libFilter === "favorites" && activeTag === "All"} icon="star" label="Favorites" onClick={() => onFilter("favorites")} />
        <NavItem active={libFilter === "recent" && activeTag === "All"} icon="clock" label="Recently used" onClick={() => onFilter("recent")} />
      </nav>

      <div className={styles.tagsBlock}>
        <div className={styles.tagTitle}>Tags</div>
        <div className={styles.tagList}>
          {shownTags.map((tag) => (
            <Chip key={tag} active={activeTag === tag} onClick={() => onTag(tag)}>
              {tag}
            </Chip>
          ))}
          {overflow ? (
            <button className={styles.tagToggle} type="button" onClick={onToggleTags}>
              {tagsExpanded ? "Show less" : `+${allTags.length - tagLimit} more`}
            </button>
          ) : null}
        </div>
      </div>

      <div className={styles.accountWrap}>
        {accountOpen ? <AccountMenu displayName={displayName} email={email} onLogout={onLogout} onDelete={onDelete} /> : null}

        <button className={clsx(styles.accountButton, accountOpen && styles.accountButtonOpen)} onClick={onToggleAccount} type="button">
          <div className={styles.avatar}>{avatarInitial}</div>
          <div className={styles.accountText}>
            <strong>{displayName}</strong>
            {email ? <span>{email}</span> : null}
          </div>
          <span className={clsx(styles.caret, accountOpen && styles.caretOpen)}>⌄</span>
        </button>
      </div>
    </aside>
  );
}

function AccountMenu({
  displayName,
  email,
  onLogout,
  onDelete,
}: {
  displayName: string;
  email: string;
  onLogout: () => void;
  onDelete: () => void;
}) {
  const [manageOpen, setManageOpen] = useState(false);

  return (
    <div className={styles.accountMenu}>
      <div className={styles.accountHeader}>
        <strong>{displayName}</strong>
        {email ? <span>{email}</span> : null}
      </div>
      <button className={styles.accountAction} onClick={onLogout} type="button">
        <Icon name="logout" size={16} />
        Log out
      </button>
      <button
        className={styles.accountAction}
        onClick={() => setManageOpen((value) => !value)}
        aria-expanded={manageOpen}
        type="button"
      >
        <Icon name="settings" size={16} />
        Manage account
        <span className={clsx(styles.caret, styles.manageCaret, manageOpen && styles.caretOpen)}>⌄</span>
      </button>
      {manageOpen ? (
        <button className={clsx(styles.accountAction, styles.deleteAction)} onClick={onDelete} type="button">
          <Icon name="trash" size={15} />
          Delete account…
        </button>
      ) : null}
    </div>
  );
}

function NavItem({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: "grid" | "star" | "clock";
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={clsx(styles.navItem, active && styles.navItemActive)} onClick={onClick} type="button">
      <Icon name={icon} size={17} className={styles.navIcon} fill={icon === "star" && active ? "currentColor" : "none"} />
      {label}
    </button>
  );
}
