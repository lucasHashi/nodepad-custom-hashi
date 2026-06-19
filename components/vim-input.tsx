"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trello, Grid, Trash2, Clipboard, Download,
  FolderOpen, FolderPlus, BookOpen, Sparkles,
  FolderDown, FolderInput, GitFork
} from "lucide-react"
import { Command } from "cmdk"
import { useModKey } from "@/lib/utils"
import { translations } from "@/lib/translations"

// ─── Props ───────────────────────────────────────────────────────────────────

interface VimInputProps {
  onSubmit: (text: string) => void
  onCommand: (cmd: string, text?: string) => void
  isCommandKOpen: boolean
  setIsCommandKOpen: (open: boolean) => void
  language?: "en" | "pt-BR"
}

// ─── Component ───────────────────────────────────────────────────────────────

export function VimInput({ onSubmit, onCommand, isCommandKOpen, setIsCommandKOpen, language }: VimInputProps) {
  const [value, setValue] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [focusedIdx, setFocusedIdx] = React.useState(0)
  const mod = useModKey()
  const t = translations[language || "en"]

  const mainInputRef = React.useRef<HTMLInputElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  // ── Items (mod-key aware) ───────────────────────────────────────────────

  const VIEW_ITEMS = React.useMemo(() => [
    { id: "tiling", icon: Grid,    label: t.cmdTiling, sub: "" },
    { id: "kanban", icon: Trello,  label: t.cmdKanban, sub: "" },
    { id: "graph",  icon: GitFork, label: t.cmdGraph,  sub: "" },
  ], [t])

  const NAV_ITEMS = React.useMemo(() => [
    { id: "open-projects",  icon: FolderOpen, label: t.cmdProjects,    sub: "" },
    { id: "new-project",    icon: FolderPlus, label: t.cmdNewProject, sub: "" },
    { id: "open-index",     icon: BookOpen,   label: t.cmdIndex,       sub: "" },
    { id: "open-synthesis", icon: Sparkles,   label: t.cmdSynthesis,   sub: "" },
  ], [t])

  const actionItemsRaw = React.useMemo(() => [
    { id: "export-nodepad", icon: FolderDown,  label: t.cmdExportNodepad,  sub: ".nodepad"  },
    { id: "import-nodepad", icon: FolderInput, label: t.cmdImportNodepad,  sub: ".nodepad"  },
    { id: "export-md",      icon: Download,    label: t.cmdExportMarkdown, sub: "markdown"  },
    { id: "copy-md",        icon: Clipboard,   label: t.cmdCopyMarkdown,   sub: "markdown"  },
    { id: "clear",          icon: Trash2,      label: t.cmdClearCanvas,    sub: t.clear    },
  ], [t])

  // ── Filtered items ──────────────────────────────────────────────────────

  const q = search.toLowerCase()
  const viewItems   = q ? VIEW_ITEMS.filter(i => i.label.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q))   : VIEW_ITEMS
  const navItems    = q ? NAV_ITEMS.filter(i  => i.label.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q))    : NAV_ITEMS
  const actionItems = q ? actionItemsRaw.filter(i => i.label.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q)) : actionItemsRaw

  const viewCount   = viewItems.length
  const navCount    = navItems.length
  const actionCount = actionItems.length
  const totalItems  = viewCount + navCount + actionCount

  // Section boundaries for keyboard nav
  // Section 0: views   [0 .. viewCount)
  // Section 1: nav     [viewCount .. viewCount+navCount)
  // Section 2: actions [viewCount+navCount .. total)
  const sections = React.useMemo(() => [
    { start: 0,                    count: viewCount,   cols: 3 },
    { start: viewCount,            count: navCount,    cols: 4 },
    { start: viewCount + navCount, count: actionCount, cols: 5 },
  ], [viewCount, navCount, actionCount])

  const getSectionForIdx = React.useCallback((idx: number) => {
    return sections.find(s => idx >= s.start && idx < s.start + s.count) ?? sections[0]
  }, [sections])

  // ── Lifecycle ───────────────────────────────────────────────────────────

  React.useEffect(() => {
    if (isCommandKOpen) {
      setSearch("")
      setFocusedIdx(0)
      requestAnimationFrame(() => searchInputRef.current?.focus())
    }
  }, [isCommandKOpen])

  React.useEffect(() => { setFocusedIdx(0) }, [search])

  // Scroll focused item into view
  React.useEffect(() => {
    itemRefs.current[focusedIdx]?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [focusedIdx])

  // ── Helpers ─────────────────────────────────────────────────────────────

  const close = React.useCallback(() => {
    setIsCommandKOpen(false)
    requestAnimationFrame(() => mainInputRef.current?.focus())
  }, [setIsCommandKOpen])

  const handleSelect = React.useCallback((cmd: string) => {
    onCommand(cmd, value)
    setSearch("")
    close()
  }, [onCommand, value, close])

  // ── Grid keyboard navigation ─────────────────────────────────────────────

  const getItemAtIdx = React.useCallback((idx: number): string | null => {
    if (idx < viewCount)                        return viewItems[idx]?.id ?? null
    if (idx < viewCount + navCount)             return navItems[idx - viewCount]?.id ?? null
    if (idx < viewCount + navCount + actionCount) return actionItems[idx - viewCount - navCount]?.id ?? null
    return null
  }, [viewCount, navCount, actionCount, viewItems, navItems, actionItems])

  const handlePopupKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (totalItems === 0) return
    const sec      = getSectionForIdx(focusedIdx)
    const localIdx = focusedIdx - sec.start
    const rowStart = sec.start + Math.floor(localIdx / sec.cols) * sec.cols
    const rowEnd   = Math.min(rowStart + sec.cols - 1, sec.start + sec.count - 1)

    switch (e.key) {
      case "Escape":
        e.preventDefault()
        close()
        break

      case "Enter": {
        e.preventDefault()
        const id = getItemAtIdx(focusedIdx)
        if (id) handleSelect(id)
        break
      }

      case "ArrowRight":
        e.preventDefault()
        setFocusedIdx(focusedIdx >= rowEnd ? rowStart : focusedIdx + 1)
        break

      case "ArrowLeft":
        e.preventDefault()
        setFocusedIdx(focusedIdx <= rowStart ? rowEnd : focusedIdx - 1)
        break

      case "ArrowDown": {
        e.preventDefault()
        const nextInSec = focusedIdx + sec.cols
        if (nextInSec < sec.start + sec.count) {
          setFocusedIdx(nextInSec)
        } else {
          // Move to first item of next section
          const nextSecStart = sec.start + sec.count
          if (nextSecStart < totalItems) {
            const col = localIdx % sec.cols
            const ns  = getSectionForIdx(nextSecStart)
            setFocusedIdx(Math.min(nextSecStart + col, nextSecStart + ns.count - 1))
          }
        }
        break
      }

      case "ArrowUp": {
        e.preventDefault()
        const prevInSec = focusedIdx - sec.cols
        if (prevInSec >= sec.start) {
          setFocusedIdx(prevInSec)
        } else if (sec.start > 0) {
          // Move to last row of previous section
          const prevSecEnd   = sec.start - 1
          const ps           = getSectionForIdx(prevSecEnd)
          const col          = localIdx % sec.cols
          const lastRowStart = ps.start + Math.floor((ps.count - 1) / ps.cols) * ps.cols
          setFocusedIdx(Math.min(lastRowStart + col, ps.start + ps.count - 1))
        }
        break
      }
    }
  }, [focusedIdx, totalItems, getSectionForIdx, getItemAtIdx, close, handleSelect])

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full relative z-[110] flex flex-col items-center">
      <Command
        className="w-full"
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim() && !isCommandKOpen) {
            onSubmit(value.trim())
            setValue("")
          }
          if (e.key === "Escape") setIsCommandKOpen(false)
        }}
      >
        {/* ── Command Popup ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {isCommandKOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute bottom-full left-0 right-0 w-full border-t border-border bg-popover/95 backdrop-blur-3xl shadow-[0_-24px_60px_-12px_rgba(0,0,0,0.15)]"
              onKeyDown={handlePopupKeyDown}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground select-none shrink-0">{mod}K</span>
                <input
                  ref={searchInputRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t.searchCommands}
                  className="flex-1 bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-muted-foreground/60 hover:text-foreground transition-colors text-[10px] font-mono"
                  >
                    {t.clear}
                  </button>
                )}
              </div>

              <div className="p-3 max-h-[360px] overflow-y-auto scrollbar-none space-y-3">

                {/* ── Views ──────────────────────────────────────────────── */}
                {viewItems.length > 0 && (
                  <div>
                    <p className="px-1 pb-2 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t.views}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {viewItems.map((item, i) => {
                        const focused = focusedIdx === i
                        return (
                          <button
                            key={item.id}
                            ref={el => { itemRefs.current[i] = el }}
                            onClick={() => handleSelect(item.id)}
                            onMouseEnter={() => setFocusedIdx(i)}
                            className={`group flex flex-col items-center justify-center gap-2 rounded-sm border py-4 px-2 transition-all duration-100 outline-none ${focused ? "bg-primary/12 border-primary/35 text-primary shadow-[0_0_0_1px_var(--primary),inset_0_1px_0_rgba(255,255,255,0.05)]" : "bg-secondary/40 border-border/40 text-muted-foreground hover:bg-secondary/60 hover:border-border/60 hover:text-foreground"}`}
                          >
                            <item.icon className={`h-[18px] w-[18px] transition-transform duration-100 ${focused ? "scale-110" : "group-hover:scale-105"}`} />
                            <div className="text-center leading-tight">
                              <div className="font-mono text-[10px] font-bold tracking-tight">{item.label}</div>
                              {item.sub && <div className={`font-mono text-[7px] uppercase tracking-[0.15em] mt-0.5 ${focused ? "text-primary/70" : "text-muted-foreground/50"}`}>{item.sub}</div>}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── Navigate ───────────────────────────────────────────── */}
                {navItems.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="px-1 pb-2 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t.navigate}</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {navItems.map((item, i) => {
                        const idx     = viewCount + i
                        const focused = focusedIdx === idx
                        return (
                          <button
                            key={item.id}
                            ref={el => { itemRefs.current[idx] = el }}
                            onClick={() => handleSelect(item.id)}
                            onMouseEnter={() => setFocusedIdx(idx)}
                            className={`group flex flex-col items-center justify-center gap-2 rounded-sm border py-4 px-2 transition-all duration-100 outline-none ${focused ? "bg-primary/12 border-primary/35 text-primary shadow-[0_0_0_1px_var(--primary),inset_0_1px_0_rgba(255,255,255,0.05)]" : "bg-secondary/40 border-border/40 text-muted-foreground hover:bg-secondary/60 hover:border-border/60 hover:text-foreground"}`}
                          >
                            <item.icon className={`h-[18px] w-[18px] transition-transform duration-100 ${focused ? "scale-110" : "group-hover:scale-105"}`} />
                            <div className="text-center leading-tight">
                              <div className="font-mono text-[10px] font-bold tracking-tight">{item.label}</div>
                              {item.sub && <div className={`font-mono text-[7px] uppercase tracking-[0.15em] mt-0.5 ${focused ? "text-primary/70" : "text-muted-foreground/50"}`}>{item.sub}</div>}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── Actions ────────────────────────────────────────────── */}
                {actionItems.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="px-1 pb-2 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t.actions}</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {actionItems.map((item, i) => {
                        const idx     = viewCount + navCount + i
                        const focused = focusedIdx === idx
                        return (
                          <button
                            key={item.id}
                            ref={el => { itemRefs.current[idx] = el }}
                            onClick={() => handleSelect(item.id)}
                            onMouseEnter={() => setFocusedIdx(idx)}
                            className={`group flex flex-col items-center justify-center gap-2 rounded-sm border py-4 px-2 transition-all duration-100 outline-none ${focused ? "bg-primary/12 border-primary/35 text-primary shadow-[0_0_0_1px_var(--primary),inset_0_1px_0_rgba(255,255,255,0.05)]" : "bg-secondary/40 border-border/40 text-muted-foreground hover:bg-secondary/60 hover:border-border/60 hover:text-foreground"}`}
                          >
                            <item.icon className={`h-[18px] w-[18px] transition-transform duration-100 ${focused ? "scale-110" : "group-hover:scale-105"}`} />
                            <div className="text-center leading-tight">
                              <div className="font-mono text-[10px] font-bold tracking-tight">{item.label}</div>
                              <div className={`font-mono text-[7px] uppercase tracking-[0.15em] mt-0.5 ${focused ? "text-primary/70" : "text-muted-foreground/50"}`}>{item.sub}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── Empty state ────────────────────────────────────────── */}
                {totalItems === 0 && (
                  <div className="py-10 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                    {t.noCommandsMatch}
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-end gap-4 px-5 py-2 border-t border-border">
                {[
                  ["↑↓", t.kbdRows],
                  ["←→", t.kbdTiles],
                  ["↵",  t.kbdSelect],
                  ["esc", t.kbdClose],
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <kbd className="font-mono text-[9px] text-muted-foreground bg-secondary/50 border border-border rounded px-1 py-0.5">{key}</kbd>
                    <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Input Bar ─────────────────────────────────────────────── */}
        <div className="w-full border-t border-border bg-card/95 backdrop-blur-3xl px-6 py-5 flex items-center gap-4 transition-all duration-300 focus-within:border-primary/40 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="flex items-center gap-3 flex-1">
            <div className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] select-none">
              {t.entry}
            </div>
            <Command.Input
              ref={mainInputRef}
              value={value}
              onValueChange={setValue}
              placeholder={t.capturePlaceholder}
              className="flex-1 bg-transparent font-mono text-sm tracking-tight text-foreground outline-none placeholder:text-muted-foreground/60"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <kbd className="flex h-5 items-center rounded border border-border bg-secondary/50 px-1.5 font-mono text-[9px] text-muted-foreground">
                <span className="text-[11px] mr-1">⌘</span>
                <span>Z</span>
              </kbd>
              <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-tighter">{t.undo}</span>
            </div>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-2">
              <kbd className="flex h-5 items-center rounded border border-border bg-secondary/50 px-1.5 font-mono text-[9px] text-muted-foreground">
                <span className="text-[11px] mr-1">⌘</span>
                <span>K</span>
              </kbd>
              <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-tighter">{t.commands}</span>
            </div>

            <div className="h-4 w-px bg-border" />

            <button
              onClick={() => {
                if (value.trim()) {
                  onSubmit(value.trim())
                  setValue("")
                  setIsCommandKOpen(false)
                }
              }}
              className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest hover:brightness-125 transition-all active:scale-95 disabled:opacity-20"
              disabled={!value.trim()}
            >
              {t.submit}
            </button>
          </div>
        </div>
      </Command>
    </div>
  )
}
