import { useLocation, useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Settings, Plus, Check, Copy, Clipboard, CheckSquare, Square, Trash2, Link, SlidersHorizontal, X, Mail, Search } from "lucide-react";
import AI_LOGO from "@assets/AI_LOGO_1781758197757.png";
import {
  useGetCard,
  useListMessages,
  useListProspects,
  useCreateProspect,
  useBulkCreateProspects,
  useUpdateProspect,
  useDeleteProspect,
  useUpdateMessageStatus,
  useCreateEmailStep,
  useUpdateEmailStep,
  useDeleteEmailStep,
  getGetCardQueryKey,
  getListMessagesQueryKey,
  getListProspectsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "not_send", label: "Not Send", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  { value: "send", label: "Send", bg: "bg-blue-100", text: "text-blue-600", dot: "bg-blue-400" },
  { value: "accept", label: "Accept", bg: "bg-green-100", text: "text-green-600", dot: "bg-green-500" },
  { value: "reject", label: "Reject", bg: "bg-red-100", text: "text-red-500", dot: "bg-red-400" },
];

// 7 pastel color sequences used per row index
const ROW_COLORS = [
  { bg: "bg-blue-100",   text: "text-blue-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-pink-100",   text: "text-pink-700" },
  { bg: "bg-amber-100",  text: "text-amber-700" },
  { bg: "bg-teal-100",   text: "text-teal-700" },
  { bg: "bg-green-100",  text: "text-green-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
];

function rowColor(rowIdx: number) {
  return ROW_COLORS[rowIdx % ROW_COLORS.length];
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function renderMessage(content: string, name: string) {
  return content.replace(/#name/gi, getFirstName(name));
}

function truncateWords(text: string, wordCount = 3): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(" ") + "…";
}

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return Promise.resolve();
  } catch (err) {
    document.body.removeChild(textarea);
    return Promise.reject(err);
  }
}

function computeCountdown(
  messages: { id: number; isDefault: boolean; daysFromPrev: number | null; order: number }[],
  statuses: { messageTemplateId: number; done: boolean; doneAt: string | null }[],
  templateId: number
): number | null {
  const sorted = [...messages].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((m) => m.id === templateId);
  if (idx <= 0) return null;
  const t = sorted[idx];
  if (!t.daysFromPrev) return null;
  const prevTemplate = sorted[idx - 1];
  const prevStatus = statuses.find((s) => s.messageTemplateId === prevTemplate.id);
  if (!prevStatus?.done || !prevStatus.doneAt) return null;
  const doneAt = new Date(prevStatus.doneAt);
  const dueDate = new Date(doneAt);
  dueDate.setDate(dueDate.getDate() + t.daysFromPrev);
  const now = new Date();
  return Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function CountdownBadge({ days }: { days: number }) {
  const color = days > 10 ? "text-[#3ECF8E] bg-green-50" : days > 0 ? "text-[#FFC857] bg-yellow-50" : "text-[#FF6B6B] bg-red-50";
  return (
    <span className={`inline-block text-xs font-black px-2 py-0.5 rounded-full mt-1 ${color}`}>
      {days > 0 ? `${days}d left` : days === 0 ? "Due today" : `${Math.abs(days)}d overdue`}
    </span>
  );
}

type EmailStepRow = { id: number; prospectId: number; label: string; done: boolean; order: number; createdAt: string };

type ProspectRow = {
  id: number;
  cardId: number;
  rowNumber: number;
  name: string;
  email: string | null;
  linkedin: string | null;
  status: string;
  leadDone: boolean;
  createdAt: string;
  messageStatuses: { id: number; prospectId: number; messageTemplateId: number; done: boolean; doneAt: string | null }[];
  emailSteps: EmailStepRow[];
};

function EditableCell({
  value,
  onSave,
  placeholder,
  type = "text",
  colorClass = "",
  onPasteLines,
  testId,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  type?: string;
  colorClass?: string;
  onPasteLines?: (firstValue: string, rest: string[]) => void;
  testId?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setVal(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function finish() {
    setEditing(false);
    if (val !== value) onSave(val);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={finish}
        onPaste={(e) => {
          e.stopPropagation();
          if (!onPasteLines) return;
          const text = e.clipboardData.getData("text");
          const lines = text.split(/\r?\n/).map((l) => l.split("\t")[0].trim()).filter(Boolean);
          if (lines.length > 1) {
            e.preventDefault();
            const [first, ...rest] = lines;
            setVal(first);
            setEditing(false);
            onPasteLines(first, rest);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") finish();
          if (e.key === "Escape") { setEditing(false); setVal(value); }
        }}
        className="w-full px-2.5 py-1.5 rounded-xl bg-white border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm font-semibold text-gray-800"
        data-testid={testId}
      />
    );
  }

  return (
    <div
      onClick={startEdit}
      className={`inline-flex items-center px-2.5 py-1 rounded-xl cursor-text text-xs font-semibold truncate max-w-full transition-all hover:opacity-80 ${
        value
          ? colorClass
          : "bg-gray-50 text-gray-300"
      }`}
      title={value}
      data-testid={testId}
    >
      {value || <span className="italic text-xs">{placeholder}</span>}
    </div>
  );
}

function LinkedInCell({
  value,
  onSave,
  colorClass,
  onPasteLines,
  testId,
}: {
  value: string;
  onSave: (v: string) => void;
  colorClass: string;
  onPasteLines?: (firstValue: string, rest: string[]) => void;
  testId?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  function startEdit() {
    setVal(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function finish() {
    setEditing(false);
    if (val !== value) onSave(val);
  }

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    if (!value) return;
    copyToClipboard(value).then(() => {
      setCopied(true);
      toast.success("LinkedIn URL copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={finish}
        onPaste={(e) => {
          e.stopPropagation();
          if (!onPasteLines) return;
          const text = e.clipboardData.getData("text");
          const lines = text.split(/\r?\n/).map((l) => l.split("\t")[0].trim()).filter(Boolean);
          if (lines.length > 1) {
            e.preventDefault();
            const [first, ...rest] = lines;
            setVal(first);
            setEditing(false);
            onPasteLines(first, rest);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") finish();
          if (e.key === "Escape") { setEditing(false); setVal(value); }
        }}
        className="w-full px-2.5 py-1.5 rounded-xl bg-white border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm font-semibold text-gray-800"
        data-testid={testId}
      />
    );
  }

  return (
    <div className="flex items-center gap-1 group/li">
      <div
        onClick={startEdit}
        className={`flex-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl cursor-text text-xs font-semibold truncate transition-all hover:opacity-80 ${
          value ? colorClass : "bg-gray-50 text-gray-300"
        }`}
        title={value}
        data-testid={testId}
      >
        {value ? (
          <>
            <Link className="w-3 h-3 shrink-0" />
            <span className="truncate">{value.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "").replace(/\/$/, "") || value}</span>
          </>
        ) : (
          <span className="italic text-xs">linkedin.com/in/...</span>
        )}
      </div>
      {value && (
        <button
          onClick={handleCopy}
          className={`shrink-0 p-1 rounded-lg transition-all opacity-0 group-hover/li:opacity-100 ${copied ? "text-green-600 bg-green-100" : "text-blue-500 hover:bg-blue-100"}`}
          title="Copy LinkedIn URL"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
}

function StatusCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const opt = STATUS_OPTIONS.find((s) => s.value === value) ?? STATUS_OPTIONS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${opt.bg} ${opt.text} hover:opacity-80 transition-all whitespace-nowrap`}
        data-testid={`status-badge-${value}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
        {opt.label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute z-50 top-full mt-1 left-0 bg-white rounded-2xl p-1.5 shadow-xl border border-gray-100 min-w-[120px]"
          >
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => { onChange(s.value); setOpen(false); }}
                className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-xl text-xs font-bold ${s.text} hover:${s.bg} hover:opacity-80 transition-colors`}
                data-testid={`status-option-${s.value}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {s.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MessageCell({
  content,
  name,
  done,
  countdown,
  onToggleDone,
}: {
  content: string;
  name: string;
  done: boolean;
  countdown: number | null;
  onToggleDone: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const rendered = renderMessage(content, name);

  function handleCopy() {
    copyToClipboard(rendered).then(() => {
      setCopied(true);
      toast.success("Message copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const preview = truncateWords(rendered, 3);

  return (
    <div
      className={`relative min-w-[140px] max-w-[200px] px-3 py-2 rounded-2xl text-sm font-medium transition-all ${done ? "bg-green-50 border border-green-100" : "bg-blue-50/60 border border-blue-100/80"}`}
      title={rendered}
    >
      <p className={`text-gray-700 text-xs leading-relaxed truncate pr-6 ${done ? "line-through text-gray-400" : ""}`}>
        {preview || <span className="text-gray-300 italic">No content</span>}
      </p>
      {countdown !== null && !done && <CountdownBadge days={countdown} />}
      <button
        onClick={() => { handleCopy(); onToggleDone(); }}
        className={`absolute bottom-1.5 right-1.5 p-1 rounded-full transition-all ${done ? "bg-green-200 text-green-700 hover:bg-green-300" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}
        title={done ? "Mark undone" : "Mark done & copy"}
        data-testid="button-tick-message"
      >
        {copied ? <Copy className="w-3 h-3" /> : <Check className="w-3 h-3" />}
      </button>
    </div>
  );
}

function RenameInput({ value, done, onRename }: { value: string; done: boolean; onRename: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  function commit() { setEditing(false); if (val.trim() && val !== value) onRename(val.trim()); }
  if (editing) {
    return (
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setVal(value); setEditing(false); } }}
        className="flex-1 min-w-0 text-xs px-1.5 py-0.5 rounded border border-blue-300 focus:outline-none bg-white"
      />
    );
  }
  return (
    <span
      onClick={() => { setVal(value); setEditing(true); }}
      className={`flex-1 min-w-0 text-xs px-1 py-0.5 rounded cursor-pointer hover:bg-gray-50 truncate ${done ? "line-through text-gray-400" : "text-gray-700"}`}
    >
      {value}
    </span>
  );
}

function EMCell({
  steps,
  prospectId,
  cardId,
  onRefresh,
}: {
  steps: EmailStepRow[];
  prospectId: number;
  cardId: number;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const createStep = useCreateEmailStep();
  const updateStep = useUpdateEmailStep();
  const deleteStep = useDeleteEmailStep();
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const doneCount = sorted.filter((s) => s.done).length;

  async function handleToggle(step: EmailStepRow) {
    await updateStep.mutateAsync({ cardId, prospectId, stepId: step.id, data: { done: !step.done } });
    onRefresh();
  }
  async function handleAdd() {
    const label = newLabel.trim() || `Email ${steps.length + 1}`;
    await createStep.mutateAsync({ cardId, prospectId, data: { label } });
    setNewLabel("");
    onRefresh();
  }
  async function handleDelete(stepId: number) {
    await deleteStep.mutateAsync({ cardId, prospectId, stepId });
    onRefresh();
  }
  async function handleRename(step: EmailStepRow, label: string) {
    await updateStep.mutateAsync({ cardId, prospectId, stepId: step.id, data: { label } });
    onRefresh();
  }

  return (
    <div className="relative flex items-center justify-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-center gap-0.5 px-1 py-0.5 rounded-lg min-w-[24px] min-h-[20px] transition-colors ${open ? "bg-purple-100" : "hover:bg-purple-50"}`}
        title="Email steps"
      >
        {sorted.length === 0 ? (
          <Mail className="w-3.5 h-3.5 text-gray-300" />
        ) : (
          sorted.map((s) => (
            <Check key={s.id} className={`w-3 h-3 ${s.done ? "text-green-500" : "text-gray-200"}`} />
          ))
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[150]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 top-full mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[200] p-3 space-y-2"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Email Steps</span>
                {sorted.length > 0 && (
                  <span className="text-xs font-bold text-gray-400">{doneCount}/{sorted.length}</span>
                )}
              </div>

              {sorted.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-1">No steps — add one below</p>
              )}

              <div className="space-y-1">
                {sorted.map((s) => (
                  <div key={s.id} className="flex items-center gap-1.5 group/step">
                    <button
                      onClick={() => handleToggle(s)}
                      className={`shrink-0 w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-all ${s.done ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-green-400"}`}
                    >
                      {s.done && <Check className="w-2.5 h-2.5 text-white" />}
                    </button>
                    <RenameInput value={s.label} done={s.done} onRename={(v) => handleRename(s, v)} />
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="shrink-0 opacity-0 group-hover/step:opacity-100 p-0.5 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1 border-t border-gray-100">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder={`Email ${steps.length + 1}`}
                  className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300 bg-gray-50"
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <button
                  onClick={handleAdd}
                  className="shrink-0 p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProspectTable() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/cards/:cardId");
  const cardId = Number(params?.cardId);
  const queryClient = useQueryClient();

  const { data: card } = useGetCard(cardId, { query: { enabled: !!cardId, queryKey: getGetCardQueryKey(cardId) } });
  const { data: messages = [] } = useListMessages(cardId, { query: { enabled: !!cardId, queryKey: getListMessagesQueryKey(cardId) } });
  const { data: prospects = [], isLoading } = useListProspects(cardId, { query: { enabled: !!cardId, queryKey: getListProspectsQueryKey(cardId) } });

  const createProspect = useCreateProspect();
  const bulkCreate = useBulkCreateProspects();
  const updateProspect = useUpdateProspect();
  const deleteProspect = useDeleteProspect();
  const updateMsgStatus = useUpdateMessageStatus();

  const sortedMessages = [...messages].sort((a, b) => a.order - b.order);

  async function handleAddRow() {
    await createProspect.mutateAsync({ cardId, data: { name: "New Prospect", email: null, linkedin: null, status: "not_send", leadDone: false } });
    queryClient.invalidateQueries({ queryKey: getListProspectsQueryKey(cardId) });
  }

  async function handleUpdateProspect(prospectId: number, field: string, value: unknown) {
    await updateProspect.mutateAsync({ cardId, prospectId, data: { [field]: value } as any });
    queryClient.invalidateQueries({ queryKey: getListProspectsQueryKey(cardId) });
  }

  async function handleDeleteRow(prospectId: number) {
    await deleteProspect.mutateAsync({ cardId, prospectId });
    queryClient.invalidateQueries({ queryKey: getListProspectsQueryKey(cardId) });
    toast.success("Row deleted");
  }

  // Google-Sheets-style column paste:
  // - First value → updates the current row
  // - Remaining values → update existing rows below (if they exist), only create new rows when we run out
  async function handleColumnPaste(
    prospectId: number,
    field: "name" | "email" | "linkedin",
    firstValue: string,
    rest: string[]
  ) {
    // Update the row the user pasted into
    await updateProspect.mutateAsync({
      cardId,
      prospectId,
      data: { [field]: firstValue || null } as any,
    });

    if (rest.length === 0) {
      queryClient.invalidateQueries({ queryKey: getListProspectsQueryKey(cardId) });
      return;
    }

    // Find which rows already exist below the current one
    const allRows = (prospects as ProspectRow[]);
    const currentIdx = allRows.findIndex((p) => p.id === prospectId);
    const rowsBelow = allRows.slice(currentIdx + 1);

    const updateOps: Promise<unknown>[] = [];
    const newRows: { name: string; email: string | null; linkedin: string | null; status: "not_send"; leadDone: boolean }[] = [];

    rest.forEach((val, i) => {
      const existing = rowsBelow[i];
      if (existing) {
        // Row already exists — just update the one column, leave others untouched
        updateOps.push(
          updateProspect.mutateAsync({
            cardId,
            prospectId: existing.id,
            data: { [field]: val || null } as any,
          })
        );
      } else {
        // No row here yet — create a new one
        newRows.push({
          name: field === "name" ? val : "—",
          email: field === "email" ? val || null : null,
          linkedin: field === "linkedin" ? val || null : null,
          status: "not_send" as const,
          leadDone: false,
        });
      }
    });

    await Promise.all(updateOps);
    if (newRows.length > 0) {
      await bulkCreate.mutateAsync({ cardId, data: { rows: newRows } });
    }

    toast.success(`${rest.length + 1} rows filled!`);
    queryClient.invalidateQueries({ queryKey: getListProspectsQueryKey(cardId) });
  }

  async function handleToggleMsgStatus(prospect: ProspectRow, templateId: number) {
    const existing = prospect.messageStatuses.find((s) => s.messageTemplateId === templateId);
    const currentDone = existing?.done ?? false;
    await updateMsgStatus.mutateAsync({ cardId, prospectId: prospect.id, data: { messageTemplateId: templateId, done: !currentDone } });
    queryClient.invalidateQueries({ queryKey: getListProspectsQueryKey(cardId) });
  }

  // Container-level paste: only handles multi-row/multi-column spreadsheet pastes
  async function handlePaste(e: React.ClipboardEvent) {
    // If an input is focused inside (edit mode), let the input handle it
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;

    const text = e.clipboardData.getData("text");
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    // Only treat as bulk paste if multiple rows OR at least one line has a tab
    const hasMultipleRows = lines.length > 1;
    const hasTab = text.includes("\t");
    if (!hasMultipleRows && !hasTab) return;

    e.preventDefault();

    const rows = lines.map((line) => {
      const cols = line.split("\t");
      return {
        name: cols[0]?.trim() || "Unknown",
        email: cols[1]?.trim() || null,
        linkedin: cols[2]?.trim() || null,
        status: "not_send" as const,
        leadDone: false,
      };
    }).filter((r) => r.name && r.name !== "Unknown" || r.email);

    if (rows.length > 0) {
      await bulkCreate.mutateAsync({ cardId, data: { rows } });
      queryClient.invalidateQueries({ queryKey: getListProspectsQueryKey(cardId) });
      toast.success(`${rows.length} rows pasted!`);
    }
  }

  // ── Filter state ──────────────────────────────────────────────
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterMsgId, setFilterMsgId] = useState<number | null>(null); // templateId
  const [filterDueToday, setFilterDueToday] = useState(false);
  const [search, setSearch] = useState("");

  const typedProspects = prospects as ProspectRow[];

  // Apply filters + search
  const filteredProspects = typedProspects.filter((p) => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q) ||
        (p.linkedin ?? "").toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterMsgId !== null) {
      const msgStatus = p.messageStatuses.find((s) => s.messageTemplateId === filterMsgId);
      const done = msgStatus?.done ?? false;
      if (done) return false; // already done → exclude
      const msgIdx = sortedMessages.findIndex((m) => m.id === filterMsgId);
      if (msgIdx > 0) {
        // Has a predecessor → only show if overdue (countdown < 0)
        const days = computeCountdown(sortedMessages, p.messageStatuses, filterMsgId);
        if (days === null || days >= 0) return false;
      }
      // msgIdx === 0: first message → show all pending (not done)
    }
    if (filterDueToday) {
      const hasDueToday = sortedMessages.some((m) => {
        const days = computeCountdown(sortedMessages, p.messageStatuses, m.id);
        return days === 0;
      });
      if (!hasDueToday) return false;
    }
    return true;
  });

  const hasFilter = filterStatus !== null || filterMsgId !== null || filterDueToday;

  const colWidths = useRef<Record<string, number>>({});
  const [, forceUpdate] = useState(0);

  const startResize = useCallback((colKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = colWidths.current[colKey] ?? 140;
    function onMove(ev: MouseEvent) {
      colWidths.current[colKey] = Math.max(80, startW + ev.clientX - startX);
      forceUpdate((n) => n + 1);
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

  function getColWidth(key: string, def: number) {
    return colWidths.current[key] ?? def;
  }

  const cols = [
    { key: "no",       label: "#",        def: 40  },
    { key: "name",     label: "Name",     def: 140 },
    { key: "email",    label: "Email",    def: 160 },
    { key: "linkedin", label: "LinkedIn", def: 160 },
    { key: "status",   label: "Status",   def: 100 },
    { key: "lead",     label: "Lead",     def: 48  },
    { key: "em",       label: "EM",       def: 48  },
    ...sortedMessages.map((m) => ({ key: `msg_${m.id}`, label: m.label, def: 190 })),
    { key: "del",      label: "",         def: 40  },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-50 px-3 pt-2 pb-1.5 shrink-0 bg-white border-b border-gray-100 shadow-sm">
        <div className="rounded-xl px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setLocation("/dashboard")} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <img src={AI_LOGO} alt="Logo" className="w-6 h-6" />
          </div>
          <h1 className="text-sm font-black text-gradient truncate max-w-[200px]">{card?.name ?? "Loading..."}</h1>
          <div className="flex items-center gap-1">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-6 py-1.5 rounded-full text-xs font-semibold bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-gray-700 placeholder-gray-300 w-32 focus:w-44 transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter button */}
            <div className="relative">
              <button
                onClick={() => setShowFilter((v) => !v)}
                className={`p-1.5 rounded-full transition-colors relative group ${showFilter ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"}`}
                title="Filter"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {hasFilter && (
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
              </button>

              {/* Filter panel */}
              <AnimatePresence>
                {showFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[200] p-4 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-gray-700">Filters</span>
                      {hasFilter && (
                        <button
                          onClick={() => { setFilterStatus(null); setFilterMsgId(null); setFilterDueToday(false); }}
                          className="text-xs text-red-400 hover:text-red-600 font-semibold flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Clear all
                        </button>
                      )}
                    </div>

                    {/* Due Today */}
                    <div className="space-y-2">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Quick</p>
                      <button
                        onClick={() => setFilterDueToday((v) => !v)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          filterDueToday
                            ? "bg-amber-100 text-amber-700 border-amber-300 shadow-sm"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${filterDueToday ? "bg-amber-400" : "bg-gray-300"}`} />
                        Due today
                      </button>
                    </div>

                    {/* Status section */}
                    <div className="space-y-2">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Status</p>
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => setFilterStatus(filterStatus === s.value ? null : s.value)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                              filterStatus === s.value
                                ? `${s.bg} ${s.text} border-current shadow-sm`
                                : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === s.value ? s.dot : "bg-gray-300"}`} />
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Messages section */}
                    {sortedMessages.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Messages</p>
                        <div className="flex flex-wrap gap-1.5">
                          {sortedMessages.map((m, idx) => {
                            const label = idx === 0 ? `${m.label} – Pending` : `${m.label} – Overdue`;
                            const active = filterMsgId === m.id;
                            return (
                              <button
                                key={m.id}
                                onClick={() => setFilterMsgId(active ? null : m.id)}
                                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                                  active
                                    ? idx === 0
                                      ? "bg-purple-100 text-purple-700 border-purple-300 shadow-sm"
                                      : "bg-red-100 text-red-600 border-red-300 shadow-sm"
                                    : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Result count */}
                    {hasFilter && (
                      <p className="text-xs text-gray-400 border-t border-gray-100 pt-2">
                        Showing <span className="font-black text-gray-700">{filteredProspects.length}</span> of{" "}
                        <span className="font-black text-gray-700">{typedProspects.length}</span> prospects
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings button */}
            <button onClick={() => setLocation(`/cards/${cardId}/settings`)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group" data-testid="button-settings">
              <Settings className="w-4 h-4 text-gray-600 group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Table wrapper */}
      <div
        className="flex-1 overflow-auto"
        onPaste={handlePaste}
        data-testid="table-container"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="min-w-max px-4 pb-6">
            <table className="border-collapse w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  {cols.map((col) => (
                    <th
                      key={col.key}
                      className="relative text-left text-xs font-black text-gray-700 uppercase tracking-wider px-3 py-3 select-none whitespace-nowrap border-r border-gray-200 last:border-r-0"
                      style={{ width: getColWidth(col.key, col.def), minWidth: getColWidth(col.key, col.def) }}
                    >
                      {col.label}
                      {col.key !== "del" && col.key !== "no" && (
                        <div
                          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-300/50"
                          onMouseDown={(e) => startResize(col.key, e)}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProspects.map((p, rowIdx) => {
                  const rc = rowColor(rowIdx);
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: rowIdx * 0.03 }}
                      className="group hover:bg-blue-50/40 transition-colors border-b border-gray-200"
                      data-testid={`row-prospect-${p.id}`}
                    >
                      {/* No */}
                      <td className="px-3 py-1 border-r border-gray-100 text-xs font-bold text-gray-400 text-center" style={{ width: getColWidth("no", 48) }}>
                        {rowIdx + 1}
                      </td>

                      {/* Name */}
                      <td className="px-2 py-1 border-r border-gray-100" style={{ width: getColWidth("name", 170) }}>
                        <EditableCell
                          value={p.name}
                          onSave={(v) => handleUpdateProspect(p.id, "name", v)}
                          placeholder="Name"
                          colorClass={`${rc.bg} ${rc.text}`}
                          onPasteLines={(first, rest) => handleColumnPaste(p.id, "name", first, rest)}
                          testId={`input-name-${p.id}`}
                        />
                      </td>

                      {/* Email */}
                      <td className="px-2 py-1 border-r border-gray-100" style={{ width: getColWidth("email", 190) }}>
                        <EditableCell
                          value={p.email ?? ""}
                          onSave={(v) => handleUpdateProspect(p.id, "email", v || null)}
                          placeholder="email@example.com"
                          colorClass={`${rc.bg} ${rc.text}`}
                          onPasteLines={(first, rest) => handleColumnPaste(p.id, "email", first, rest)}
                          testId={`input-email-${p.id}`}
                        />
                      </td>

                      {/* LinkedIn */}
                      <td className="px-2 py-1 border-r border-gray-100" style={{ width: getColWidth("linkedin", 200) }}>
                        <LinkedInCell
                          value={p.linkedin ?? ""}
                          onSave={(v) => handleUpdateProspect(p.id, "linkedin", v || null)}
                          colorClass={`${rc.bg} ${rc.text}`}
                          onPasteLines={(first, rest) => handleColumnPaste(p.id, "linkedin", first, rest)}
                          testId={`input-linkedin-${p.id}`}
                        />
                      </td>

                      {/* Status */}
                      <td className="px-2 py-1 border-r border-gray-100" style={{ width: getColWidth("status", 120) }}>
                        <StatusCell
                          value={p.status}
                          onChange={(v) => handleUpdateProspect(p.id, "status", v)}
                        />
                      </td>

                      {/* Lead */}
                      <td className="px-2 py-1 border-r border-gray-100 text-center" style={{ width: getColWidth("lead", 60) }}>
                        <button
                          onClick={() => handleUpdateProspect(p.id, "leadDone", !p.leadDone)}
                          className={`p-1.5 rounded-xl transition-all ${p.leadDone ? "bg-green-100 text-green-600 shadow-sm" : "text-gray-300 hover:text-gray-500"}`}
                          data-testid={`button-lead-${p.id}`}
                        >
                          {p.leadDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* EM */}
                      <td className="px-2 py-1 border-r border-gray-100 text-center" style={{ width: getColWidth("em", 60) }}>
                        <EMCell
                          steps={p.emailSteps}
                          prospectId={p.id}
                          cardId={cardId}
                          onRefresh={() => queryClient.invalidateQueries({ queryKey: getListProspectsQueryKey(cardId) })}
                        />
                      </td>

                      {/* Message columns */}
                      {sortedMessages.map((m) => {
                        const msgStatus = p.messageStatuses.find((s) => s.messageTemplateId === m.id);
                        const done = msgStatus?.done ?? false;
                        const countdown = computeCountdown(sortedMessages as any, p.messageStatuses as any, m.id);
                        return (
                          <td key={m.id} className="px-2 py-1.5 border-r border-gray-100" style={{ width: getColWidth(`msg_${m.id}`, 210) }}>
                            <MessageCell
                              content={m.content}
                              name={p.name}
                              done={done}
                              countdown={countdown}
                              onToggleDone={() => handleToggleMsgStatus(p, m.id)}
                            />
                          </td>
                        );
                      })}

                      {/* Delete */}
                      <td className="px-2 py-1 text-center" style={{ width: getColWidth("del", 48) }}>
                        <button
                          onClick={() => handleDeleteRow(p.id)}
                          className="p-1.5 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Delete row"
                          data-testid={`button-delete-${p.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {/* Add row */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddRow}
              disabled={createProspect.isPending}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-200/80 to-purple-200/80 hover:from-blue-300/80 hover:to-purple-300/80 text-blue-700 font-bold text-sm shadow-md transition-all disabled:opacity-60"
              data-testid="button-add-row"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </motion.button>

            {typedProspects.length === 0 && !isLoading && (
              <div className="text-center py-16 text-gray-400">
                <Clipboard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-bold text-lg">No prospects yet</p>
                <p className="text-sm mt-1">Click "Add Row" or paste from a spreadsheet (Ctrl+V)</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
