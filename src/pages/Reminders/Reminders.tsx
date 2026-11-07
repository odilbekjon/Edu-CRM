import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputLabel,
  FormControl,
  IconButton,
  // Popover,
} from "@mui/material";
import {
  MdAdd,
  MdClose,
  MdCheck,
  MdAccessTime,
  MdPerson,
  MdGroup,
  MdCalendarToday,
} from "react-icons/md";
import { useEffect, useState, useRef } from "react";
import { remindersApi, errorMessage, type ApiReminder } from "../../api";
import { useData } from "../../Context/DataContext";
import { useToast } from "../../Context/ToastContext";

type ReminderStatus = "overdue" | "today" | "future";
type FilterStatus = "active" | "done" | "";

type Reminder = {
  id: number;
  title: string;
  description: string;
  date: string;
  dateValue: string; // "YYYY-MM-DD"
  status: ReminderStatus;
  assigneeId: number | "";
  tags: string;
  isDone: boolean;
};

const emptyForm = {
  title: "",
  description: "",
  tags: "",
  priority: "",
  datetime: new Date(new Date().setHours(23, 59, 0, 0))
    .toISOString()
    .slice(0, 16),
  assigneeId: "" as number | "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcStatus(datetimeStr: string): ReminderStatus {
  const selected = new Date(datetimeStr);
  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  if (selected < now) return "overdue";
  if (selected >= todayStart && selected < tomorrowStart) return "today";
  return "future";
}

function formatDate(datetimeStr: string): string {
  return datetimeStr.replace("T", " ");
}

// ─── Filter select style ──────────────────────────────────────────────────────
const filterSelectSx = {
  bgcolor: "var(--surface)",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
  "& .MuiSelect-select": { py: "7px", px: "12px", fontSize: 13.5, color: "var(--text)" },
  borderRadius: "6px",
  minWidth: 150,
};

// ─── Date filter button (no external lib) ─────────────────────────────────────
function DateFilterButton({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string; // "YYYY-MM-DD" or ""
  onChange: (v: string) => void;
}) {
  const [, setAnchor] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = value
    ? value.split("-").reverse().join(".")
    : null;

  return (
    <>
      <Box
        onClick={(e) => {
          setAnchor(e.currentTarget);
          // native calendar ni ochish uchun kichik timeout
          setTimeout(() => inputRef.current?.showPicker?.(), 50);
        }}
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 0.8,
          bgcolor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          px: 1.5,
          py: "7px",
          fontSize: 13.5,
          color: displayValue ? "var(--ink)" : "var(--text)",
          cursor: "pointer",
          minWidth: 160,
          userSelect: "none",
          "&:hover": { borderColor: "var(--border-strong)" },
        }}
      >
        <MdCalendarToday size={15} color="var(--muted)" />
        {displayValue ?? label}
        {displayValue && (
          <Box
            component="span"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            sx={{
              ml: "auto",
              display: "flex",
              color: "var(--muted)",
              "&:hover": { color: "var(--text)" },
            }}
          >
            <MdClose size={14} />
          </Box>
        )}
        {/* Hidden native date input */}
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setAnchor(null);
          }}
          style={{
            position: "absolute",
            opacity: 0,
            width: 0,
            height: 0,
            pointerEvents: "none",
          }}
        />
      </Box>
    </>
  );
}

// ─── CountBox ─────────────────────────────────────────────────────────────────
const CountBox = ({ count, color }: { count: number; color: string }) => (
  <Box
    sx={{
      width: 34,
      height: 34,
      border: `2px solid ${color}`,
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color,
      fontWeight: 700,
      fontSize: 17,
    }}
  >
    {count}
  </Box>
);

const NoMore = () => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    gap={0.8}
    py={2}
    sx={{ color: "var(--muted)", fontSize: 13 }}
  >
    <MdCheck color="#4caf50" size={14} />
    No more
  </Box>
);

const toReminder = (r: ApiReminder): Reminder => ({
  id: r.id,
  title: r.title,
  description: r.note ?? "",
  date: formatDate(r.dueAt),
  dateValue: r.dueAt.slice(0, 10),
  status: calcStatus(r.dueAt),
  assigneeId: r.assignee?.id ?? "",
  tags: r.tags ?? "",
  isDone: r.done,
});

// ─── Column ───────────────────────────────────────────────────────────────────
function Column({
  label,
  color,
  items,
  onDone,
}: {
  label: string;
  color: string;
  items: Reminder[];
  onDone: (id: number) => void;
}) {
  const { staff } = useData();
  const TEACHERS = staff.map((u) => ({ id: u.id, name: u.fullName }));
  return (
    <Box flex={1} pr={3} sx={{ "&:last-child": { pr: 0 } }}>
      <Box
        display="flex"
        alignItems="center"
        gap={1.2}
        pb={1.5}
        mb={1.5}
        borderBottom="1.5px solid #e0e3ea"
      >
        <CountBox count={items.length} color={color} />
        <Typography fontWeight={600} fontSize={16} color="var(--text)">
          {label}
        </Typography>
      </Box>
      {items.map((r) => (
        <Box
          key={r.id}
          sx={{
            bgcolor: r.isDone ? "var(--surface-2)" : "var(--surface)",
            borderRadius: "8px",
            p: 2,
            mb: 1.5,
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            opacity: r.isDone ? 0.7 : 1,
          }}
        >
          <Box display="flex" alignItems="flex-start" justifyContent="space-between">
            <Typography
              fontWeight={600}
              fontSize={14}
              mb={0.5}
              sx={{
                textDecoration: r.isDone ? "line-through" : "none",
                color: r.isDone ? "var(--muted)" : "var(--ink)",
              }}
            >
              {r.title}
            </Typography>
            {!r.isDone && (
              <IconButton
                size="small"
                title="Mark as done"
                onClick={() => onDone(r.id)}
                sx={{ ml: 1, color: "#4caf50", p: 0.3 }}
              >
                <MdCheck size={16} />
              </IconButton>
            )}
          </Box>
          <Box
            display="flex"
            alignItems="center"
            gap={0.6}
            sx={{ color: "var(--muted)", fontSize: 12 }}
          >
            <MdAccessTime size={13} />
            {r.date}
          </Box>
          {r.description && (
            <Typography fontSize={12} color="text.secondary" mt={0.5}>
              {r.description}
            </Typography>
          )}
          {r.assigneeId !== "" && (
            <Box display="flex" alignItems="center" gap={0.5} mt={0.8}>
              <MdPerson size={13} color="var(--muted)" />
              <Typography fontSize={12} color="var(--muted)">
                {TEACHERS.find((t) => t.id === r.assigneeId)?.name}
              </Typography>
            </Box>
          )}
          {r.tags && (
            <Chip
              label={r.tags}
              size="small"
              sx={{
                mt: 0.8,
                fontSize: 11,
                height: 20,
                bgcolor: "var(--primary-tint)",
                color: "var(--primary)",
              }}
            />
          )}
        </Box>
      ))}
      {items.length === 0 && <NoMore />}
    </Box>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export const Reminders = () => {
  const { staff } = useData();
  const { toast } = useToast();
  const TEACHERS = staff.map((u) => ({ id: u.id, name: u.fullName }));
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const load = () =>
    remindersApi
      .list()
      .then((rows) => setReminders(rows.map(toReminder)))
      .catch((e) => toast(errorMessage(e), "error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Filters
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("");
  const [filterAssignee, setFilterAssignee] = useState<number | "">("");
  const [filterTags, setFilterTags] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Active chips
  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (filterStatus)
    activeChips.push({
      key: "status",
      label: filterStatus === "active" ? "Active" : "Done",
      clear: () => setFilterStatus(""),
    });
  if (filterAssignee)
    activeChips.push({
      key: "assignee",
      label: TEACHERS.find((t) => t.id === filterAssignee)?.name ?? "",
      clear: () => setFilterAssignee(""),
    });
  if (filterTags)
    activeChips.push({ key: "tags", label: filterTags, clear: () => setFilterTags("") });
  if (filterDateFrom)
    activeChips.push({
      key: "from",
      label: `From: ${filterDateFrom.split("-").reverse().join(".")}`,
      clear: () => setFilterDateFrom(""),
    });
  if (filterDateTo)
    activeChips.push({
      key: "to",
      label: `To: ${filterDateTo.split("-").reverse().join(".")}`,
      clear: () => setFilterDateTo(""),
    });

  // Filter logic
  const filtered = reminders.filter((r) => {
    if (filterStatus === "active" && r.isDone) return false;
    if (filterStatus === "done" && !r.isDone) return false;
    if (filterAssignee && r.assigneeId !== filterAssignee) return false;
    if (filterTags && r.tags !== filterTags) return false;
    if (filterDateFrom && r.dateValue < filterDateFrom) return false;
    if (filterDateTo && r.dateValue > filterDateTo) return false;
    return true;
  });

  const overdue = filtered.filter((r) => r.status === "overdue");
  const today = filtered.filter((r) => r.status === "today");
  const future = filtered.filter((r) => r.status === "future");

  const allTags = Array.from(
    new Set(reminders.map((r) => r.tags).filter(Boolean))
  );

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      await remindersApi.create({
        title: form.title.trim(),
        note: form.description || undefined,
        dueAt: form.datetime,
        tags: form.tags || undefined,
        assigneeId: form.assigneeId === "" ? null : form.assigneeId,
      });
      setForm(emptyForm);
      setOpen(false);
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  const handleDone = async (id: number) => {
    try {
      await remindersApi.update(id, { done: true });
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  return (
    <Box p={4} minHeight="100%">
      {/* HEADER */}
      <Typography variant="h5" fontWeight={700} color="var(--ink)" mb={2.5}>
        Reminders
      </Typography>

      {/* FILTERS */}
      <Box display="flex" flexWrap="wrap" alignItems="center" gap={1.2} mb={activeChips.length ? 1.5 : 4}>
        {/* Status */}
        <Select
          displayEmpty
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          sx={filterSelectSx}
        >
          <MenuItem value="" disabled sx={{ fontSize: 13.5, color: "var(--text)" }}>
            Select status
          </MenuItem>
          <MenuItem value="active" sx={{ fontSize: 13.5 }}>
            Active
          </MenuItem>
          <MenuItem value="done" sx={{ fontSize: 13.5 }}>
            Done
          </MenuItem>
        </Select>

        {/* Assignee */}
        <Select
          displayEmpty
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value as number | "")}
          sx={filterSelectSx}
        >
          <MenuItem value="" disabled sx={{ fontSize: 13.5, color: "var(--text)" }}>
            Select assignee
          </MenuItem>
          {TEACHERS.map((t) => (
            <MenuItem key={t.id} value={t.id} sx={{ fontSize: 13.5 }}>
              {t.name}
            </MenuItem>
          ))}
        </Select>

        {/* Tags */}
        <Select
          displayEmpty
          value={filterTags}
          onChange={(e) => setFilterTags(e.target.value)}
          sx={filterSelectSx}
        >
          <MenuItem value="" disabled sx={{ fontSize: 13.5, color: "var(--text)" }}>
            Select tags
          </MenuItem>
          {allTags.map((tag) => (
            <MenuItem key={tag} value={tag} sx={{ fontSize: 13.5 }}>
              {tag}
            </MenuItem>
          ))}
        </Select>

        {/* Date from */}
        <DateFilterButton
          label="Select date (from)"
          value={filterDateFrom}
          onChange={setFilterDateFrom}
        />

        {/* Date to */}
        <DateFilterButton
          label="Select date (to)"
          value={filterDateTo}
          onChange={setFilterDateTo}
        />

        <Button
          variant="contained"
          startIcon={<MdAdd />}
          onClick={() => setOpen(true)}
          sx={{
            ml: "auto",
            bgcolor: "var(--primary)",
            borderRadius: "6px",
            textTransform: "none",
            fontWeight: 500,
            px: 2.5,
            "&:hover": { bgcolor: "var(--primary)" },
          }}
        >
          Add
        </Button>
      </Box>

      {/* FILTER CHIPS */}
      {activeChips.length > 0 && (
        <Box display="flex" flexWrap="wrap" gap={0.8} mb={3}>
          {activeChips.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              onDelete={chip.clear}
              deleteIcon={<MdClose />}
              size="small"
              sx={{
                bgcolor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: 12.5,
                "& .MuiChip-deleteIcon": { fontSize: 15 },
              }}
            />
          ))}
          <Chip
            label="Clear all"
            onClick={() => {
              setFilterStatus("");
              setFilterAssignee("");
              setFilterTags("");
              setFilterDateFrom("");
              setFilterDateTo("");
            }}
            size="small"
            sx={{
              bgcolor: "#ffebee",
              color: "#f44336",
              border: "1px solid #ffcdd2",
              borderRadius: "6px",
              fontSize: 12.5,
              cursor: "pointer",
            }}
          />
        </Box>
      )}

      {/* COLUMNS */}
      <Box display="flex" gap={0}>
        <Column label="Overdue" color="#f44336" items={overdue} onDone={handleDone} />
        <Column label="Today" color="var(--primary)" items={today} onDone={handleDone} />
        <Column label="Future" color="var(--muted)" items={future} onDone={handleDone} />
      </Box>

      {/* CREATE MODAL */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { borderRadius: "10px", width: 460, maxWidth: "95vw", p: "4px" },
        }}
      >
        <DialogTitle sx={{ fontSize: 19, fontWeight: 600, color: "var(--ink)", pb: 1 }}>
          Create reminder
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", right: 12, top: 12, color: "var(--muted)" }}
          >
            <MdClose />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: "8px !important" }}>
          <InputLabel sx={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)", mb: 0.6 }}>
            <span style={{ color: "#f44336" }}>*</span>Title
          </InputLabel>
          <TextField
            fullWidth
            placeholder="Enter title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            size="small"
            sx={{ mb: 2 }}
          />

          <InputLabel sx={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)", mb: 0.6 }}>
            Description
          </InputLabel>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Enter description"
            inputProps={{ maxLength: 255 }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            size="small"
            sx={{ mb: 0.5 }}
          />
          <Typography fontSize={12} color="text.secondary" textAlign="right" mb={2}>
            {form.description.length}/255
          </Typography>

          <InputLabel sx={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)", mb: 0.6 }}>
            Tags
          </InputLabel>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Select
              displayEmpty
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            >
              <MenuItem value="">Select tags</MenuItem>
              <MenuItem value="Payment">Payment</MenuItem>
              <MenuItem value="Meeting">Meeting</MenuItem>
              <MenuItem value="Urgent">Urgent</MenuItem>
              <MenuItem value="Follow-up">Follow-up</MenuItem>
            </Select>
          </FormControl>

          <Typography fontSize={13.5} fontWeight={600} color="var(--text)" mb={1}>
            Details
          </Typography>

          <Box display="flex" alignItems="center" gap={1.2} mb={1.2}>
            <MdPerson size={18} color="var(--muted)" />
            <FormControl fullWidth size="small">
              <Select
                displayEmpty
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                sx={{ bgcolor: "var(--surface-2)" }}
              >
                <MenuItem value="">Not selected</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box display="flex" alignItems="center" gap={1.2} mb={1.2}>
            <MdAccessTime size={18} color="var(--muted)" />
            <TextField
              fullWidth
              type="datetime-local"
              value={form.datetime}
              onChange={(e) => setForm({ ...form, datetime: e.target.value })}
              size="small"
              sx={{ bgcolor: "var(--surface-2)", borderRadius: 1 }}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={1.2}>
            <MdGroup size={18} color="var(--muted)" />
            <FormControl fullWidth size="small">
              <Select
                displayEmpty
                value={form.assigneeId}
                onChange={(e) =>
                  setForm({ ...form, assigneeId: e.target.value as number | "" })
                }
                sx={{ bgcolor: "var(--surface-2)" }}
              >
                <MenuItem value="">Select assignee</MenuItem>
                {TEACHERS.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setForm(emptyForm)}
            sx={{
              border: "1.5px solid var(--border)",
              color: "var(--text)",
              borderRadius: "6px",
              textTransform: "none",
              px: 2.5,
              "&:hover": { bgcolor: "var(--surface-2)" },
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!form.title.trim()}
            sx={{
              bgcolor: "var(--primary)",
              borderRadius: "6px",
              textTransform: "none",
              px: 3,
              "&:hover": { bgcolor: "var(--primary)" },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};