"use client";

import {
  deleteAccountAction,
  deletePromptAction,
  savePromptAction,
  signOutAction,
  toggleFavoriteAction,
  touchPromptAction,
} from "@/app/actions";
import type { ImproveResult, PromptDraft, PromptRecord, PromptVariable } from "@/lib/stencil/types";
import {
  MOBILE_BREAKPOINT,
  blankDraft,
  camel,
  cloneDraft,
  finalText,
  guessMultiline,
  syncVars,
  titleCase,
  uniqueName,
} from "@/lib/stencil/utils";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AIPanel } from "./AIPanel";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { DeletePromptModal } from "./DeletePromptModal";
import { LibraryView } from "./LibraryView";
import { MobileTopBar } from "./MobileTopBar";
import { PromptEditor } from "./PromptEditor";
import { PromptRunner } from "./PromptRunner";
import { SessionOverlay } from "./SessionOverlay";
import { Sidebar } from "./Sidebar";
import styles from "./StencilApp.module.scss";
import { VariableModal, type VariableModalState } from "./VariableModal";

type View = "library" | "editor" | "use";
type LibFilter = "all" | "favorites" | "recent";
type SessionState = "active" | "out" | "deleted";
type AIContext = "editor" | "use";

const emptyModal: VariableModalState = {
  editingIndex: null,
  name: "",
  label: "",
  placeholder: "",
  default: "",
  required: true,
  multiline: false,
  range: null,
};

export function StencilApp({
  initialPrompts,
  email,
  userName,
  appVersion,
}: {
  initialPrompts: PromptRecord[];
  email: string;
  userName: string;
  appVersion: string;
}) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<View>("library");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<PromptRecord | null>(null);
  const [deleteAck, setDeleteAck] = useState(false);
  const [session, setSession] = useState<SessionState>("active");
  const [libFilter, setLibFilter] = useState<LibFilter>("all");
  const [prompts, setPrompts] = useState(initialPrompts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraftState] = useState<PromptDraft>(blankDraft());
  const [titleError, setTitleError] = useState("");
  const [selStart, setSelStart] = useState(0);
  const [selEnd, setSelEnd] = useState(0);
  const [showVarModal, setShowVarModal] = useState(false);
  const [varModal, setVarModal] = useState<VariableModalState>(emptyModal);
  const [tagInput, setTagInput] = useState("");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiContext, setAIContext] = useState<AIContext>("editor");
  const [aiSourceId, setAISourceId] = useState<string | null>(null);
  const [aiStatus, setAIStatus] = useState<"idle" | "done" | "error">("idle");
  const [aiError, setAIError] = useState("");
  const [aiOriginal, setAIOriginal] = useState("");
  const [aiResult, setAIResult] = useState<ImproveResult | null>(null);
  const [aiRunning, setAIRunning] = useState(false);
  const [useTarget, setUseTarget] = useState<PromptDraft | null>(null);
  const [useSourceId, setUseSourceId] = useState<string | null>(null);
  const [useOrigin, setUseOrigin] = useState<"library" | "editor">("library");
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingPrompt, setDeletingPrompt] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "k" && view === "library") {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape") {
        if (promptToDelete && !deletingPrompt) setPromptToDelete(null);
        else if (showDeleteModal) setShowDeleteModal(false);
        else if (showAccountMenu) setShowAccountMenu(false);
        else if (showVarModal) setShowVarModal(false);
        else if (showAIPanel) setShowAIPanel(false);
      }
    };

    const onResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };

    onResize();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [deletingPrompt, promptToDelete, showAIPanel, showAccountMenu, showDeleteModal, showVarModal, view]);

  const hasSelection = selEnd > selStart;
  const aiContextLabel = aiContext === "use"
    ? "Improving before copy"
    : editingId
      ? draft.title || "Untitled prompt"
      : "New prompt";

  function defaultValuesFor(target: PromptDraft) {
    return Object.fromEntries(target.variables.filter((variable) => variable.default).map((variable) => [variable.name, variable.default]));
  }

  function goLibrary() {
    setView("library");
    setShowAIPanel(false);
    setTitleError("");
  }

  function openEditor(nextDraft: PromptDraft, id: string | null) {
    setShowAIPanel(false);
    setTitleError("");
    setTagInput("");
    setSelStart(0);
    setSelEnd(0);
    setMenuOpen(false);
    setEditingId(id);
    setDraftState(nextDraft);
    setView("editor");
  }

  function newPrompt() {
    openEditor(blankDraft(), null);
  }

  function newExamplePrompt(example: PromptDraft) {
    openEditor(cloneDraft(example), null);
  }

  function editPrompt(id: string) {
    const prompt = prompts.find((item) => item.id === id);
    if (prompt) openEditor(cloneDraft(prompt), id);
  }

  function enterUse(target: PromptRecord | PromptDraft, sourceId: string | null, origin: "library" | "editor") {
    const prompt = cloneDraft(target);
    setView("use");
    setUseTarget(prompt);
    setUseSourceId(sourceId);
    setUseOrigin(origin);
    setValues(defaultValuesFor(prompt));
    setCopied(false);
    setShowAIPanel(false);
    setMenuOpen(false);
  }

  async function usePrompt(id: string) {
    const prompt = prompts.find((item) => item.id === id);
    if (!prompt) return;

    if (prompt.variables.length > 0) {
      enterUse(prompt, id, "library");
      return;
    }

    await copyText(prompt.body);
    setCopiedPromptId(id);
    window.setTimeout(() => setCopiedPromptId((current) => (current === id ? null : current)), 1800);

    try {
      const lastUsedAt = await touchPromptAction(id);
      setPrompts((current) => current.map((item) => item.id === id ? { ...item, lastUsedAt } : item));
    } catch {
      return;
    }
  }

  function backFromUse() {
    if (useOrigin === "editor") setView("editor");
    else goLibrary();
  }

  function setDraft(patch: Partial<PromptDraft>) {
    if (typeof patch.title === "string" && patch.title.trim()) setTitleError("");
    setDraftState((current) => {
      const next = { ...current, ...patch };
      if (typeof patch.body === "string") next.variables = syncVars(patch.body, current.variables);
      return next;
    });
  }

  function requirePromptTitle(target: PromptDraft) {
    if (target.title.trim()) return true;
    setTitleError("Please give the prompt a title before saving or improving the prompt.");
    setShowAIPanel(false);
    return false;
  }

  function parseTagInput() {
    return tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  function draftWithPendingTags(source: PromptDraft) {
    const nextTags = parseTagInput();
    if (!nextTags.length) return source;

    const existing = new Set(source.tags.map((tag) => tag.toLowerCase()));
    const tagsToAdd = nextTags.filter((tag) => {
      const key = tag.toLowerCase();
      if (existing.has(key)) return false;
      existing.add(key);
      return true;
    });

    return tagsToAdd.length ? { ...source, tags: [...source.tags, ...tagsToAdd] } : source;
  }

  function addTag() {
    setDraftState((current) => draftWithPendingTags(current));
    setTagInput("");
  }

  function removeTag(index: number) {
    setDraftState((current) => ({ ...current, tags: current.tags.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function handleBodySelection(event: React.SyntheticEvent<HTMLTextAreaElement>) {
    const target = event.currentTarget;
    setSelStart(target.selectionStart);
    setSelEnd(target.selectionEnd);
  }

  function markSelection() {
    if (selEnd <= selStart) return;
    const sourceText = draft.body.slice(selStart, selEnd);
    const name = uniqueName(camel(sourceText), draft.variables, null);
    const guessMulti = sourceText.length > 40 || /\n/.test(sourceText);
    setVarModal({
      editingIndex: null,
      name,
      label: titleCase(sourceText),
      placeholder: sourceText.trim(),
      default: "",
      required: true,
      multiline: guessMulti,
      range: { start: selStart, end: selEnd },
    });
    setShowVarModal(true);
  }

  function openVariableEdit(index: number) {
    const variable = draft.variables[index];
    setVarModal({
      editingIndex: index,
      name: variable.name,
      label: variable.label,
      placeholder: variable.placeholder,
      default: variable.default,
      required: variable.required,
      multiline: guessMultiline(variable),
      range: null,
    });
    setShowVarModal(true);
  }

  function saveVariable() {
    const modal = varModal;
    const clean = camel(modal.name || modal.label || "variable");
    const name = uniqueName(clean, draft.variables, modal.editingIndex);
    const nextVariable: PromptVariable = {
      name,
      label: modal.label.trim() || titleCase(name),
      placeholder: modal.placeholder,
      default: modal.default,
      required: !!modal.required,
      multiline: !!modal.multiline,
    };

    setDraftState((current) => {
      let body = current.body;
      let variables: PromptVariable[];
      if (modal.editingIndex == null) {
        variables = [...current.variables, nextVariable];
        if (modal.range) {
          body = `${body.slice(0, modal.range.start)}{{${name}}}${body.slice(modal.range.end)}`;
        }
      } else {
        const old = current.variables[modal.editingIndex];
        variables = current.variables.map((variable, index) => index === modal.editingIndex ? nextVariable : variable);
        if (old.name !== name) body = body.split(`{{${old.name}}}`).join(`{{${name}}}`);
      }

      return { ...current, variables: syncVars(body, variables), body };
    });
    setShowVarModal(false);
  }

  function setFieldType(index: number, multiline: boolean) {
    setDraftState((current) => ({
      ...current,
      variables: current.variables.map((variable, itemIndex) => itemIndex === index ? { ...variable, multiline } : variable),
    }));
  }

  function deleteVariable(index: number) {
    setDraftState((current) => {
      const variable = current.variables[index];
      const body = current.body.split(`{{${variable.name}}}`).join(variable.label || variable.name);
      return { ...current, variables: current.variables.filter((_, itemIndex) => itemIndex !== index), body };
    });
  }

  async function saveCurrentPrompt() {
    const draftToSave = draftWithPendingTags(draft);
    if (!requirePromptTitle(draftToSave)) return;

    setSaving(true);
    try {
      setDraftState(draftToSave);
      setTagInput("");
      const saved = await savePromptAction(draftToSave, editingId);
      rememberSavedPrompt(saved);
      setView("library");
      setLibFilter("all");
      setActiveTag("All");
      setSearch("");
    } finally {
      setSaving(false);
    }
  }

  function rememberSavedPrompt(saved: PromptRecord) {
    setPrompts((current) => [saved, ...current.filter((prompt) => prompt.id !== saved.id)]);
  }

  async function toggleFavorite(id: string) {
    const prompt = prompts.find((item) => item.id === id);
    if (!prompt) return;
    const favorite = !prompt.favorite;
    setPrompts((current) => current.map((item) => item.id === id ? { ...item, favorite } : item));
    try {
      await toggleFavoriteAction(id, favorite);
    } catch {
      setPrompts((current) => current.map((item) => item.id === id ? { ...item, favorite: !favorite } : item));
    }
  }

  function requestPromptDelete(id: string) {
    const prompt = prompts.find((item) => item.id === id);
    if (!prompt) return;
    setPromptToDelete(prompt);
    setShowAIPanel(false);
  }

  async function confirmPromptDelete() {
    if (!promptToDelete || deletingPrompt) return;

    const id = promptToDelete.id;
    setDeletingPrompt(true);
    try {
      await deletePromptAction(id);
      setPrompts((current) => current.filter((prompt) => prompt.id !== id));
      setPromptToDelete(null);

      if (editingId === id) {
        setEditingId(null);
        setDraftState(blankDraft());
        goLibrary();
      }

      if (useSourceId === id) setUseSourceId(null);
      if (aiSourceId === id) setAISourceId(null);
    } finally {
      setDeletingPrompt(false);
    }
  }

  function setValue(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function resetValues() {
    if (!useTarget) return;
    setValues(defaultValuesFor(useTarget));
  }

  async function copyFinal() {
    if (!useTarget) return;
    const text = finalText(useTarget.body, values);
    await copyText(text);

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);

    if (useSourceId) {
      try {
        const lastUsedAt = await touchPromptAction(useSourceId);
        setPrompts((current) => current.map((prompt) => prompt.id === useSourceId ? { ...prompt, lastUsedAt } : prompt));
      } catch {
        return;
      }
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }

  function activeBody() {
    return aiContext === "use" ? useTarget?.body ?? "" : draft.body;
  }

  function activeTitle() {
    return aiContext === "use" ? useTarget?.title ?? "Untitled prompt" : draft.title || "Untitled prompt";
  }

  function setActiveBody(body: string) {
    if (aiContext === "use") {
      setUseTarget((current) => current ? { ...current, body } : current);
    } else {
      setDraft({ body });
    }
  }

  function openAI(context: AIContext) {
    if (context === "editor" && !requirePromptTitle(draft)) return;
    if (context === "use" && useOrigin === "editor" && useTarget && !requirePromptTitle(useTarget)) {
      setView("editor");
      return;
    }

    setShowAIPanel(true);
    setAIContext(context);
    setAISourceId(context === "use" ? useSourceId : editingId);
    setAIStatus("idle");
    setAIError("");
    setAIOriginal("");
    setAIResult(null);
  }

  async function ensurePromptSavedForAI() {
    if (aiContext === "editor") {
      const draftToSave = draftWithPendingTags(draft);
      if (!requirePromptTitle(draftToSave)) return null;
      setDraftState(draftToSave);
      setTagInput("");
      const saved = await savePromptAction(draftToSave, editingId);
      rememberSavedPrompt(saved);
      setEditingId(saved.id);
      setAISourceId(saved.id);
      setDraftState(cloneDraft(saved));
      return saved.id;
    }

    if (aiContext === "use" && useTarget && useOrigin === "editor") {
      if (!requirePromptTitle(useTarget)) return null;
      const saved = await savePromptAction(useTarget, useSourceId ?? editingId);
      rememberSavedPrompt(saved);
      setEditingId(saved.id);
      setUseSourceId(saved.id);
      setAISourceId(saved.id);
      return saved.id;
    }

    if (aiSourceId) return aiSourceId;

    return null;
  }

  async function runImprove() {
    const body = activeBody();
    if (!body.trim()) {
      setAIOriginal(body);
      setAIResult(null);
      setAIError("Add prompt text before asking for improvements.");
      setAIStatus("error");
      return;
    }

    setAIRunning(true);
    setAIError("");
    try {
      const promptId = await ensurePromptSavedForAI();
      if (!promptId) {
        throw new Error("Could not auto-save this prompt before improving it.");
      }

      const sourcePrompt = prompts.find((prompt) => prompt.id === promptId);
      if (sourcePrompt?.aiImprovedAt) {
        setAIOriginal(body);
        setAIResult(null);
        setAIError("This prompt has already been improved with AI.");
        setAIStatus("error");
        return;
      }

      const response = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId,
          body,
          title: activeTitle(),
        }),
      });
      const payload = (await response.json()) as Partial<ImproveResult> & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "AI improvements failed.");
      }

      if (typeof payload.improved !== "string") {
        throw new Error("AI improvements returned an invalid response.");
      }

      const result: ImproveResult = {
        improved: payload.improved,
        aiImprovedAt: typeof payload.aiImprovedAt === "string" ? payload.aiImprovedAt : undefined,
      };
      if (result.aiImprovedAt) {
        setPrompts((current) => current.map((prompt) => prompt.id === promptId ? { ...prompt, aiImprovedAt: result.aiImprovedAt ?? prompt.aiImprovedAt } : prompt));
      }
      setAIOriginal(body);
      setAIResult(result);
      setAIStatus("done");
    } catch (error) {
      setAIOriginal(body);
      setAIResult(null);
      setAIError(error instanceof Error ? error.message : "AI improvements failed.");
      setAIStatus("error");
    } finally {
      setAIRunning(false);
    }
  }

  function applyImproved() {
    if (aiResult) setActiveBody(aiResult.improved);
    setShowAIPanel(false);
  }

  async function logout() {
    try {
      await signOutAction();
    } finally {
      setSession("out");
      setShowAccountMenu(false);
      setShowDeleteModal(false);
      setShowAIPanel(false);
      setShowVarModal(false);
    }
  }

  async function confirmDelete() {
    if (!deleteAck) return;
    setDeleting(true);
    try {
      await deleteAccountAction();
      setPrompts([]);
      setSession("deleted");
      setShowDeleteModal(false);
      setDeleteAck(false);
      setShowAccountMenu(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={styles.root}>
      {isMobile && menuOpen ? <div className={styles.drawerBackdrop} onClick={() => setMenuOpen(false)} /> : null}
      <Sidebar
        prompts={prompts}
        activeTag={activeTag}
        libFilter={libFilter}
        tagsExpanded={tagsExpanded}
        accountOpen={showAccountMenu}
        mobileOpen={menuOpen}
        email={email}
        userName={userName}
        appVersion={appVersion}
        onNew={newPrompt}
        onTag={(tag) => {
          setActiveTag(tag);
          setMenuOpen(false);
        }}
        onToggleTags={() => setTagsExpanded((value) => !value)}
        onFilter={(filter) => {
          setLibFilter(filter);
          setActiveTag("All");
          setSearch("");
          setMenuOpen(false);
        }}
        onToggleAccount={() => setShowAccountMenu((value) => !value)}
        onLogout={logout}
        onDelete={() => {
          setShowDeleteModal(true);
          setShowAccountMenu(false);
          setDeleteAck(false);
        }}
      />

      <main className={styles.main}>
        <MobileTopBar onMenu={() => setMenuOpen((value) => !value)} onNew={newPrompt} />

        {view === "library" ? (
          <LibraryView
            prompts={prompts}
            search={search}
            activeTag={activeTag}
            libFilter={libFilter}
            isMobile={isMobile}
            searchRef={searchRef}
            copiedPromptId={copiedPromptId}
            onSearch={setSearch}
            onNew={newPrompt}
            onClear={() => {
              setSearch("");
              setActiveTag("All");
              setLibFilter("all");
            }}
            onExample={newExamplePrompt}
            onFavorite={toggleFavorite}
            onUse={usePrompt}
            onEdit={editPrompt}
          />
        ) : null}

        {view === "editor" ? (
          <PromptEditor
            draft={draft}
            editing={!!editingId}
            tagInput={tagInput}
            hasSelection={hasSelection}
            saving={saving}
            deleting={deletingPrompt && promptToDelete?.id === editingId}
            titleError={titleError}
            canImprove={!editingId || !prompts.find((prompt) => prompt.id === editingId)?.aiImprovedAt}
            onDraft={setDraft}
            onBodySelect={handleBodySelection}
            onTagInput={setTagInput}
            onTagKey={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                addTag();
              }
            }}
            onTagCommit={addTag}
            onRemoveTag={removeTag}
            onMark={markSelection}
            onBack={goLibrary}
            onAI={() => openAI("editor")}
            onSave={saveCurrentPrompt}
            onDelete={() => editingId && requestPromptDelete(editingId)}
            onFieldType={setFieldType}
            onEditVariable={openVariableEdit}
            onRemoveVariable={deleteVariable}
          />
        ) : null}

        {view === "use" && useTarget ? (
          <PromptRunner
            target={useTarget}
            values={values}
            copied={copied}
            canImprove={!useSourceId || !prompts.find((prompt) => prompt.id === useSourceId)?.aiImprovedAt}
            onBack={backFromUse}
            onValue={setValue}
            onReset={resetValues}
            onCopy={copyFinal}
            onImprove={() => openAI("use")}
          />
        ) : null}
      </main>

      {showAccountMenu ? <div className={styles.accountBackdrop} onClick={() => setShowAccountMenu(false)} /> : null}
      {showVarModal ? (
        <VariableModal
          value={varModal}
          onChange={(patch) => setVarModal((current) => ({ ...current, ...patch }))}
          onCancel={() => setShowVarModal(false)}
          onSave={saveVariable}
        />
      ) : null}
      {showAIPanel ? (
        <AIPanel
          contextLabel={aiContextLabel}
          status={aiStatus}
          error={aiError}
          original={aiOriginal}
          result={aiResult}
          running={aiRunning}
          onClose={() => setShowAIPanel(false)}
          onRun={runImprove}
          onApplyImproved={applyImproved}
          onKeepOriginal={() => setShowAIPanel(false)}
        />
      ) : null}
      {promptToDelete ? (
        <DeletePromptModal
          title={promptToDelete.title}
          deleting={deletingPrompt}
          onCancel={() => {
            if (!deletingPrompt) setPromptToDelete(null);
          }}
          onConfirm={confirmPromptDelete}
        />
      ) : null}
      {showDeleteModal ? (
        <DeleteAccountModal
          count={prompts.length}
          acknowledged={deleteAck}
          deleting={deleting}
          onToggle={() => setDeleteAck((value) => !value)}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteAck(false);
          }}
          onConfirm={confirmDelete}
        />
      ) : null}
      {session !== "active" ? <SessionOverlay status={session} onAction={() => router.refresh()} /> : null}
    </div>
  );
}
