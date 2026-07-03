"use client";

import type { PromptRecord } from "@/lib/stencil/types";
import { sortRecentlyUsed } from "@/lib/stencil/utils";
import type { RefObject } from "react";
import { EmptyState } from "./EmptyState";
import { PromptCard } from "./PromptCard";
import { RecentStrip } from "./RecentStrip";
import { SearchBar } from "./SearchBar";
import styles from "./LibraryView.module.scss";

export function LibraryView({
  prompts,
  search,
  activeTag,
  libFilter,
  isMobile,
  searchRef,
  onSearch,
  onNew,
  onClear,
  onFavorite,
  onUse,
  onEdit,
}: {
  prompts: PromptRecord[];
  search: string;
  activeTag: string;
  libFilter: "all" | "favorites" | "recent";
  isMobile: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
  onSearch: (value: string) => void;
  onNew: () => void;
  onClear: () => void;
  onFavorite: (id: string) => void;
  onUse: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const q = search.trim().toLowerCase();
  let list = prompts.slice();
  if (libFilter === "favorites") list = list.filter((prompt) => prompt.favorite);
  else if (libFilter === "recent") list = sortRecentlyUsed(list).filter((prompt) => prompt.lastUsedAt);
  if (activeTag !== "All") list = list.filter((prompt) => prompt.tags.includes(activeTag));
  if (q) {
    list = list.filter((prompt) => `${prompt.title} ${prompt.description} ${prompt.tags.join(" ")}`.toLowerCase().includes(q));
  }

  const sectionTitle = q
    ? `Results for “${search.trim()}”`
    : libFilter === "favorites"
      ? "Favorites"
      : libFilter === "recent"
        ? "Recently used"
        : "All prompts";

  const emptyKind = prompts.length === 0 ? "none" : list.length === 0 ? (q ? "noresults" : "nofilter") : null;
  const showRecentStrip = !isMobile && libFilter === "all" && activeTag === "All" && !q && prompts.some((prompt) => prompt.lastUsedAt);

  return (
    <div className={styles.libraryWrap}>
      <div className={styles.libraryHead}>
        <div>
          <h1>Prompt library</h1>
          <p>Save, refine and reuse the prompts you rely on.</p>
        </div>
        <SearchBar value={search} onChange={onSearch} inputRef={searchRef} />
      </div>

      {showRecentStrip ? <RecentStrip prompts={prompts} onOpen={onUse} /> : null}

      <div className={styles.sectionHeader}>
        <h2>{sectionTitle}</h2>
        <span>{list.length} {list.length === 1 ? "prompt" : "prompts"}</span>
      </div>

      {emptyKind === "none" ? <EmptyState kind="none" onNew={onNew} /> : null}
      {emptyKind === "noresults" ? <EmptyState kind="noresults" search={search.trim()} onClear={onClear} /> : null}
      {emptyKind === "nofilter" ? <EmptyState kind="nofilter" onClear={onClear} /> : null}

      <div className={styles.grid}>
        {list.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} onFavorite={onFavorite} onUse={onUse} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}
