// src/pages/Students.tsx
import React, { useState, useMemo, useRef } from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdDelete, MdMail, MdEdit, MdPayment } from "react-icons/md";
import { BsThreeDotsVertical, BsPersonPlus } from "react-icons/bs";
import { TbAdjustmentsHorizontal, TbColumns3, TbCalendar } from "react-icons/tb";
import { HiChevronDown } from "react-icons/hi";
import { IoClose, IoSearchOutline } from "react-icons/io5";
import {
  FiPhone, FiKey, FiUser, FiMail, FiSend,
  FiBookOpen, FiMapPin, FiCreditCard,
} from "react-icons/fi";

import { type FlatStudent, formatDate } from "../../types/crm";
import { useData } from "../../Context/DataContext";
import { useNavigate } from "react-router-dom";

import { SendSmsModal } from "../../components/SendSmsModal";

/* ─── TYPES ─────────────────────────────────────────── */
type SortDir = "asc" | "desc";
type SortKey = keyof FlatStudent | "";

interface Filters {
  search: string;
  course: string;
  status: "active" | "inactive" | "";
  teacher: string;
  startDate: string;
  endDate: string;
}

const ALL_COLUMNS = [
  { key: "photo",    label: "Photo" },
  { key: "name",     label: "Name" },
  { key: "phone",    label: "Phone" },
  { key: "groups",   label: "Groups" },
  { key: "teachers", label: "Teachers" },
  { key: "training", label: "Training dates" },
  { key: "balance",  label: "Balance" },
  { key: "comment",  label: "Comment" },
];

const PAY_METHODS = [
  { value: "cash",  label: "Cash" },
  { value: "click", label: "Click" },
  { value: "card",  label: "Card" },
  { value: "uzum",  label: "Uzum" },
  { value: "bank",  label: "Bank account" },
  { value: "humo",  label: "Humo" },
  { value: "payme", label: "Payme" },
];

const CONTACT_ICONS = [
  { icon: <FiPhone size={16} />,    label: "Phone" },
  { icon: <FiKey size={16} />,      label: "Key" },
  { icon: <FiUser size={16} />,     label: "Profile" },
  { icon: <FiMail size={16} />,     label: "Email" },
  { icon: <FiSend size={16} />,     label: "Telegram" },
  { icon: <FiBookOpen size={16} />, label: "Education" },
  { icon: <FiMapPin size={16} />,   label: "Location" },
  { icon: <FiCreditCard size={16} />, label: "Card" },
];

const todayISO = new Date().toISOString().slice(0, 10);

/* ─── STYLES ─────────────────────────────────────────── */
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    fontSize: 13,
    bgcolor: "var(--surface)",
    "& fieldset": { borderColor: "var(--border)" },
    "&:hover fieldset": { borderColor: "var(--border-strong)" },
    "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
  },
};

/* ─── DROPDOWN FILTER ────────────────────────────────── */
interface DropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  onClear: () => void;
}

const DropdownFilter = ({ label, value, options, onChange, onClear }: DropdownProps) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  return (
    <>
      <Button
        variant="outlined"
        size="small"
        endIcon={!value ? <HiChevronDown size={13} /> : undefined}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          borderRadius: "6px",
          borderColor: value ? "var(--primary)" : "var(--border)",
          color: value ? "var(--primary)" : "var(--muted)",
          bgcolor: value ? "var(--primary-tint)" : "var(--surface)",
          fontWeight: 400, fontSize: 13, px: 1.5, py: 0.6,
          textTransform: "none", whiteSpace: "nowrap",
          "&:hover": { borderColor: "var(--primary)", bgcolor: "var(--primary-tint)" },
        }}
      >
        {value ? (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <span>{options.find((o) => o.value === value)?.label || value}</span>
            <IoClose size={13} onClick={(e) => { e.stopPropagation(); onClear(); }} />
          </Stack>
        ) : label}
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 160, mt: 0.5, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" } }}
      >
        {options.map((o) => (
          <MenuItem
            key={o.value} selected={value === o.value}
            onClick={() => { onChange(o.value); setAnchor(null); }}
            sx={{ fontSize: 13 }}
          >
            {o.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

/* ─── ADD TO GROUP MODAL ─────────────────────────────── */
const AddToGroupModal = ({
  open,
  onClose,
  onSubmit,
  groups,
  selectedCount,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (groupId: string) => void;
  groups: { id: string; name: string }[];
  selectedCount: number;
}) => {
  const [groupId, setGroupId] = useState("");

  const handleSubmit = () => {
    if (groupId) {
      onSubmit(groupId);
      setGroupId("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: "12px", width: 580, maxWidth: "95vw", p: 0 } }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 3, py: 2.5 }}
      >
        <Box>
          <Typography fontWeight={600} fontSize={16} color="var(--ink)">
            Add student to group
          </Typography>
          {selectedCount > 0 && (
            <Typography fontSize={12} color="var(--muted)" mt={0.3}>
              {selectedCount} student{selectedCount > 1 ? "s" : ""} selected
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "var(--muted)" }}>
          <IoClose size={20} />
        </IconButton>
      </Stack>

      <Divider />

      <Box sx={{ px: 3, py: 3 }}>
        <TextField
          select
          fullWidth
          size="small"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          SelectProps={{ displayEmpty: true }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: 14,
              bgcolor: "var(--surface)",
              "& fieldset": { borderColor: "var(--border)" },
              "&:hover fieldset": { borderColor: "var(--border-strong)" },
              "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
            },
          }}
        >
          <MenuItem value="" disabled sx={{ fontSize: 14, color: "var(--muted)" }}>
            Select group
          </MenuItem>
          {groups.map((g) => (
            <MenuItem key={g.id} value={g.id} sx={{ fontSize: 14 }}>
              {g.name}
            </MenuItem>
          ))}
        </TextField>

        <Box mt={3}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!groupId}
            sx={{
              borderRadius: "20px",
              py: 1.1, px: 3,
              fontWeight: 600, fontSize: 14,
              bgcolor: "var(--primary)",
              "&:hover": { bgcolor: "var(--primary-dark)" },
              "&.Mui-disabled": { bgcolor: "var(--border)", color: "white" },
              boxShadow: "none",
              textTransform: "none",
            }}
          >
            Add student to group
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

/* ─── ADD PAYMENT DRAWER ─────────────────────────────── */
const AddPaymentDrawer = ({
  open,
  student,
  onClose,
  onSubmit,
}: {
  open: boolean;
  student: FlatStudent | null;
  onClose: () => void;
  onSubmit: (data: { studentId: number; amount: number; method: string; date: string; comment: string }) => Promise<boolean>;
}) => {
  const [payMethod, setPayMethod] = useState("cash");
  const [amount,    setAmount]    = useState("");
  const [date,      setDate]      = useState(todayISO);
  const [comment,   setComment]   = useState("");

  const handleSubmit = async () => {
    if (!student || !(Number(amount) > 0)) return;
    const methodLabel = PAY_METHODS.find((m) => m.value === payMethod)?.label ?? "Cash";
    const ok = await onSubmit({ studentId: student.id, amount: Number(amount), method: methodLabel, date, comment });
    if (!ok) return;
    onClose();
    setAmount("");
    setComment("");
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 420 } }}>
      <Stack
        direction="row" justifyContent="space-between" alignItems="center"
        sx={{ px: 3, py: 2.5, borderBottom: "1px solid var(--border)", bgcolor: "var(--surface)" }}
      >
        <Typography fontWeight={700} fontSize={17}>Add payment</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "var(--muted)" }}>
          <IoClose size={20} />
        </IconButton>
      </Stack>

      <Box sx={{ px: 3, py: 2.5, overflowY: "auto", flex: 1, bgcolor: "var(--surface-2)" }}>
        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Student</Typography>
          <Box sx={{ border: "1px solid var(--border)", borderRadius: "6px", px: 1.5, py: 1.1, bgcolor: "var(--surface)", fontSize: 13, color: "var(--muted)" }}>
            {student?.name || "—"}
          </Box>
        </Box>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Balance</Typography>
          <Box sx={{ display: "inline-flex", alignItems: "center", bgcolor: "var(--primary)", color: "white", borderRadius: "20px", px: 2, py: 0.4, fontSize: 13, fontWeight: 600 }}>
            {student?.balance?.toLocaleString("ru-RU") ?? 0} UZS
          </Box>
        </Box>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Group</Typography>
          <Box sx={{ border: "1px solid var(--border)", borderRadius: "6px", px: 1.5, py: 1.1, bgcolor: "var(--surface)", fontSize: 13, color: "var(--text)" }}>
            {student?.groupName} — {student?.groupSchedule}
          </Box>
        </Box>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={1}>Method pay</Typography>
          <RadioGroup
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.5 }}
          >
            {PAY_METHODS.map((m) => (
              <FormControlLabel
                key={m.value} value={m.value}
                control={<Radio size="small" sx={{ color: "var(--border-strong)", "&.Mui-checked": { color: "var(--primary)" }, p: 0.5 }} />}
                label={<Typography fontSize={13} color="var(--text)">{m.label}</Typography>}
                sx={{ m: 0, gap: 0.5 }}
              />
            ))}
          </RadioGroup>
        </Box>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Amount</Typography>
          <TextField fullWidth size="small" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={inputSx} />
        </Box>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Date</Typography>
          <TextField fullWidth size="small" type="date" value={date} onChange={(e) => setDate(e.target.value)} sx={inputSx} />
        </Box>

        <Box mb={3}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Comment</Typography>
          <TextField fullWidth size="small" multiline rows={3} value={comment} onChange={(e) => setComment(e.target.value)} sx={inputSx} />
        </Box>

        <Button
          variant="contained" fullWidth onClick={handleSubmit}
          sx={{ borderRadius: "20px", py: 1.2, fontWeight: 600, fontSize: 14, bgcolor: "var(--primary)", "&:hover": { bgcolor: "var(--primary-dark)" }, boxShadow: "none", textTransform: "none" }}
        >
          Submit
        </Button>
      </Box>
    </Drawer>
  );
};

/* ─── EDIT STUDENT DRAWER ────────────────────────────── */
const EditStudentDrawer = ({
  open, student, onClose, onSave,
}: {
  open: boolean;
  student: FlatStudent | null;
  onClose: () => void;
  onSave: (student: FlatStudent, data: { name: string; phone: string; dob: string; gender: string }) => Promise<boolean>;
}) => {
  const [name,   setName]   = useState("");
  const [phone,  setPhone]  = useState("");
  const [dob,    setDob]    = useState("");
  const [gender, setGender] = useState("male");

  React.useEffect(() => {
    if (student) { setName(student.name); setPhone(student.phone); }
  }, [student]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 420 } }}>
      <Stack
        direction="row" justifyContent="space-between" alignItems="center"
        sx={{ px: 3, py: 2.5, borderBottom: "1px solid var(--border)", bgcolor: "var(--surface)" }}
      >
        <Typography fontWeight={700} fontSize={17}>Edit Student</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "var(--muted)" }}><IoClose size={20} /></IconButton>
      </Stack>

      <Box sx={{ px: 3, py: 2.5, overflowY: "auto", flex: 1, bgcolor: "var(--surface-2)" }}>
        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Phone</Typography>
          <Stack direction="row" gap={1}>
            <Box sx={{ border: "1px solid var(--border)", borderRadius: "6px", px: 1.5, display: "flex", alignItems: "center", bgcolor: "var(--surface)", fontSize: 13, color: "var(--text)", whiteSpace: "nowrap", minWidth: 60, justifyContent: "center" }}>
              +998
            </Box>
            <TextField fullWidth size="small" value={phone} onChange={(e) => setPhone(e.target.value)} sx={inputSx} />
          </Stack>
        </Box>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Name</Typography>
          <TextField fullWidth size="small" value={name} onChange={(e) => setName(e.target.value)} sx={inputSx} />
        </Box>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Date of birth</Typography>
          <TextField fullWidth size="small" type="date" value={dob} onChange={(e) => setDob(e.target.value)} InputLabelProps={{ shrink: true }} sx={inputSx} />
        </Box>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Gender</Typography>
          <RadioGroup row value={gender} onChange={(e) => setGender(e.target.value)} sx={{ gap: 3 }}>
            {["Male", "Female"].map((g) => (
              <FormControlLabel key={g} value={g.toLowerCase()}
                control={<Radio size="small" sx={{ color: "var(--border-strong)", "&.Mui-checked": { color: "var(--primary)" }, p: 0.5 }} />}
                label={<Typography fontSize={13} color="var(--text)">{g}</Typography>}
                sx={{ m: 0, gap: 0.5 }}
              />
            ))}
          </RadioGroup>
        </Box>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={1}>Additional contacts</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {CONTACT_ICONS.map((item, i) => (
              <Tooltip key={i} title={item.label} arrow>
                <IconButton size="small" sx={{ width: 40, height: 40, border: "1.5px solid var(--border-strong)", borderRadius: "50%", color: "var(--primary)", bgcolor: "var(--surface)" }}>
                  {item.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        </Box>

        <Stack alignItems="flex-end" gap={0.5} mb={3}>
          <Button variant="text" size="small" sx={{ fontSize: 13, color: "var(--primary)", textTransform: "none", p: 0, minWidth: 0 }}>+ Add to the group</Button>
          <Button variant="text" size="small" sx={{ fontSize: 13, color: "var(--primary)", textTransform: "none", p: 0, minWidth: 0 }}>+ Set password</Button>
        </Stack>

        <Button
          variant="contained" fullWidth
          onClick={async () => {
            if (!student) return;
            const ok = await onSave(student, { name, phone, dob, gender: gender === "female" ? "Female" : "Male" });
            if (ok) onClose();
          }}
          sx={{ borderRadius: "20px", py: 1.2, fontWeight: 600, fontSize: 14, bgcolor: "var(--primary)", "&:hover": { bgcolor: "var(--primary-dark)" }, boxShadow: "none", textTransform: "none" }}
        >
          Submit
        </Button>
      </Box>
    </Drawer>
  );
};

/* ─── ADD STUDENT DRAWER ─────────────────────────────── */
const AddStudentDrawer = ({
  open, onClose, onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { phone: string; name: string; dob: string; gender: string; comment: string }) => Promise<boolean>;
}) => {
  const [phone,   setPhone]   = useState("");
  const [name,    setName]    = useState("");
  const [dob,     setDob]     = useState("");
  const [gender,  setGender]  = useState("male");
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    const ok = await onSubmit({ phone, name, dob, gender: gender === "female" ? "Female" : "Male", comment });
    if (!ok) return;
    setPhone(""); setName(""); setDob(""); setGender("male"); setComment("");
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 420, bgcolor: "var(--surface-2)" } }}>
      <Stack
        direction="row" justifyContent="space-between" alignItems="center"
        sx={{ px: 3, py: 2.5, bgcolor: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <Typography fontWeight={600} fontSize={17} color="var(--ink)">Add New Student</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "var(--muted)" }}><IoClose size={20} /></IconButton>
      </Stack>

      <Box sx={{ px: 3, py: 3, overflowY: "auto", flex: 1 }}>
        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Phone</Typography>
          <Stack direction="row" gap={1}>
            <Box sx={{ border: "1px solid var(--border)", borderRadius: "6px", px: 1.5, display: "flex", alignItems: "center", bgcolor: "var(--surface)", fontSize: 14, color: "var(--text)", whiteSpace: "nowrap", minWidth: 64, justifyContent: "center" }}>
              +998
            </Box>
            <TextField fullWidth size="small" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="93 650 87 92" sx={inputSx} />
          </Stack>
        </Box>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Name</Typography>
          <TextField fullWidth size="small" value={name} onChange={(e) => setName(e.target.value)} sx={inputSx} />
        </Box>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Date of birth</Typography>
          <TextField fullWidth size="small" type="date" value={dob} onChange={(e) => setDob(e.target.value)} InputLabelProps={{ shrink: true }} sx={inputSx} />
        </Box>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Gender</Typography>
          <RadioGroup row value={gender} onChange={(e) => setGender(e.target.value)} sx={{ gap: 3 }}>
            {["Male", "Female"].map((g) => (
              <FormControlLabel key={g} value={g.toLowerCase()}
                control={<Radio size="small" sx={{ color: "var(--border-strong)", "&.Mui-checked": { color: "var(--primary)" }, p: 0.5 }} />}
                label={<Typography fontSize={14} color="var(--text)">{g}</Typography>}
                sx={{ m: 0, gap: 0.5 }}
              />
            ))}
          </RadioGroup>
        </Box>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={0.8}>Comment</Typography>
          <TextField fullWidth size="small" multiline rows={3} value={comment} onChange={(e) => setComment(e.target.value)} sx={inputSx} />
        </Box>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={500} color="var(--text)" mb={1.2}>Additional contacts</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {CONTACT_ICONS.map((item, i) => (
              <Tooltip key={i} title={item.label} arrow>
                <IconButton size="small" sx={{ width: 40, height: 40, border: "1.5px solid var(--border-strong)", borderRadius: "50%", color: "var(--primary)", bgcolor: "var(--surface)" }}>
                  {item.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        </Box>

        <Stack alignItems="flex-end" gap={0.5} mb={3}>
          <Button variant="text" size="small" sx={{ fontSize: 13, color: "var(--primary)", textTransform: "none", p: 0, minWidth: 0 }}>+ Add to the group</Button>
          <Button variant="text" size="small" sx={{ fontSize: 13, color: "var(--primary)", textTransform: "none", p: 0, minWidth: 0 }}>+ Set password</Button>
        </Stack>

        <Button
          variant="contained" onClick={handleSubmit}
          sx={{ borderRadius: "20px", py: 1.2, px: 4, fontWeight: 600, fontSize: 14, bgcolor: "var(--primary)", "&:hover": { bgcolor: "var(--primary-dark)" }, boxShadow: "none", textTransform: "none" }}
        >
          Submit
        </Button>
      </Box>
    </Drawer>
  );
};

/* ─── MAIN COMPONENT ─────────────────────────────────── */
export const Students = () => {
  const navigate = useNavigate();

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef   = useRef<HTMLInputElement>(null);
  const [sendSmsOpen, setSendSmsOpen] = useState(false);

  const { students, groups, teachers, createStudent, updateStudent, deleteStudents, addStudentToGroup, addPayment } = useData();

  const [selected,          setSelected]          = useState<string[]>([]);
  const [sortKey,           setSortKey]           = useState<SortKey>("");
  const [sortDir,           setSortDir]           = useState<SortDir>("asc");
  const [visibleCols,       setVisibleCols]       = useState<string[]>(ALL_COLUMNS.map((c) => c.key));
  const [columnsAnchor,     setColumnsAnchor]     = useState<null | HTMLElement>(null);
  const [actionMenu,        setActionMenu]        = useState<{ el: HTMLElement; uid: string } | null>(null);
  const [deleteUid,         setDeleteUid]         = useState<string | null>(null);
  const [addDrawerOpen,     setAddDrawerOpen]     = useState(false);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [editDrawerOpen,    setEditDrawerOpen]    = useState(false);
  const [activeStudent,     setActiveStudent]     = useState<FlatStudent | null>(null);
  const [addToGroupOpen,    setAddToGroupOpen]    = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: "", course: "", status: "", teacher: "", startDate: "", endDate: "",
  });

  const setFilter = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setFilters((p) => ({ ...p, [key]: val }));

  const clearAll = () =>
    setFilters({ search: "", course: "", status: "", teacher: "", startDate: "", endDate: "" });

  const hasFilters = Object.values(filters).some(Boolean);

  const COURSES = useMemo(() => [...new Set(groups.map((g) => g.course))], [groups]);
  const TEACHERS_LIST = useMemo(() => teachers.map((t) => t.fullName), [teachers]);
  const ALL_GROUPS = useMemo(
    () => groups.map((g) => ({ id: String(g.id), name: g.name })),
    [groups]
  );

  const filtered = useMemo(() => {
    return students
      .filter((s) => {
        const search = filters.search.toLowerCase();
        return (
          (!search || s.name.toLowerCase().includes(search) || s.phone.includes(search)) &&
          (!filters.course  || s.course  === filters.course) &&
          (!filters.status  || (filters.status === "active" ? s.active : !s.active)) &&
          (!filters.teacher || s.teacher === filters.teacher) &&
          (!filters.startDate || (s.startDate && s.startDate >= filters.startDate)) &&
          (!filters.endDate   || (s.endDate   && s.endDate   <= filters.endDate))
        );
      })
      .sort((a, b) => {
        if (!sortKey) return 0;
        const av = String(a[sortKey as keyof FlatStudent] ?? "");
        const bv = String(b[sortKey as keyof FlatStudent] ?? "");
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [students, filters, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const allSelected = filtered.length > 0 && filtered.every((s) => selected.includes(s.uid));
  const toggleAll   = () => setSelected(allSelected ? [] : filtered.map((s) => s.uid));
  const toggleOne   = (uid: string) =>
    setSelected((p) => p.includes(uid) ? p.filter((x) => x !== uid) : [...p, uid]);

  const handleDeleteConfirm = async () => {
    const target = students.find((s) => s.uid === deleteUid);
    if (target && (await deleteStudents([target.id]))) {
      setSelected((p) => p.filter((x) => students.find((s) => s.uid === x)?.id !== target.id));
    }
    setDeleteUid(null);
  };

  const handleSaveEdit = (student: FlatStudent, data: { name: string; phone: string; dob: string; gender: string }) =>
    updateStudent(student.id, { name: data.name, phone: data.phone, dob: data.dob, gender: data.gender });

  const handleAddStudent = (data: { phone: string; name: string; dob: string; gender: string; comment: string }) =>
    createStudent({ name: data.name, phone: data.phone, dob: data.dob, gender: data.gender, comment: data.comment });

  const handleBulkDelete = async () => {
    const ids = [...new Set(students.filter((s) => selected.includes(s.uid)).map((s) => s.id))];
    if (ids.length === 0) return;
    if (!window.confirm(`${ids.length} ta o'quvchi o'chiriladi (to'lov tarixi bilan). Davom etasizmi?`)) return;
    if (await deleteStudents(ids)) setSelected([]);
  };

  const handleAddSelectedToGroup = async (groupId: string) => {
    const ids = [...new Set(students.filter((s) => selected.includes(s.uid)).map((s) => s.id))];
    for (const id of ids) await addStudentToGroup(Number(groupId), id);
    setSelected([]);
  };

  const openActionMenu = (e: React.MouseEvent<HTMLButtonElement>, uid: string) => {
    e.stopPropagation();
    const student = students.find((s) => s.uid === uid) || null;
    setActiveStudent(student);
    setActionMenu(actionMenu?.uid === uid ? null : { el: e.currentTarget, uid });
  };

  const col = (key: string) => visibleCols.includes(key);

  const badgeColors: Record<string, { bg: string; color: string }> = {
    blue:  { bg: "#dbeafe", color: "#1d4ed8" },
    green: { bg: "#dcfce7", color: "#15803d" },
    amber: { bg: "#fef3c7", color: "#92400e" },
  };

  /* ── UI ─────────────────────────────────────────────── */
  return (
    <Box sx={{ p: 3, bgcolor: "transparent", minHeight: "100%" }}>

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Stack direction="row" alignItems="baseline" gap={1.5}>
          <Typography variant="h5" fontWeight={700} fontSize={26} color="var(--ink)">Students</Typography>
          <Typography fontSize={14} color="var(--muted)">Quantity — {filtered.length}</Typography>
        </Stack>
        <Button
          variant="contained"
          onClick={() => setAddDrawerOpen(true)}
          sx={{
            bgcolor: "var(--primary)", color: "white", borderRadius: "8px",
            px: 3, py: 1.1, fontWeight: 700, fontSize: 13, letterSpacing: 0.5,
            textTransform: "uppercase", "&:hover": { bgcolor: "#1e3340" }, boxShadow: "none",
          }}
        >
          Add New
        </Button>
      </Stack>

      {/* FILTER ROW */}
      <Stack
        direction="row" flexWrap="wrap" gap={1} mb={1.5}
        sx={{ bgcolor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", p: 1.5 }}
      >
        {/* Search */}
        <Box
          sx={{
            display: "flex", alignItems: "center", gap: 0.5,
            border: "1px solid var(--border)", borderRadius: "6px",
            px: 1.2, py: 0.6, bgcolor: "var(--surface)", minWidth: 220,
          }}
        >
          <IoSearchOutline size={15} color="var(--muted)" />
          <input
            placeholder="Search by name or phone"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            style={{ border: "none", outline: "none", fontSize: 13, color: "var(--text)", background: "transparent", width: "100%" }}
          />
          {filters.search && (
            <IoClose size={13} color="var(--muted)" style={{ cursor: "pointer" }} onClick={() => setFilter("search", "")} />
          )}
        </Box>

        <DropdownFilter
          label="By Courses" value={filters.course}
          options={COURSES.map((c) => ({ value: c, label: c }))}
          onChange={(v) => setFilter("course", v)} onClear={() => setFilter("course", "")}
        />
        <DropdownFilter
          label="Status" value={filters.status}
          options={[{ value: "active", label: "🟢 Active" }, { value: "inactive", label: "🔴 Inactive" }]}
          onChange={(v) => setFilter("status", v as "active" | "inactive")}
          onClear={() => setFilter("status", "")}
        />
        <DropdownFilter
          label="By Teacher" value={filters.teacher}
          options={TEACHERS_LIST.map((t) => ({ value: t, label: t }))}
          onChange={(v) => setFilter("teacher", v)} onClear={() => setFilter("teacher", "")}
        />
        <DropdownFilter
          label="Financial" value=""
          options={[{ value: "paid", label: "Paid" }, { value: "debt", label: "In debt" }]}
          onChange={() => {}} onClear={() => {}}
        />
        <DropdownFilter
          label="By Tags" value=""
          options={[{ value: "new", label: "New" }, { value: "vip", label: "VIP" }]}
          onChange={() => {}} onClear={() => {}}
        />

        {/* Start date */}
        <Button
          variant="outlined" size="small"
          startIcon={<TbCalendar size={13} />}
          onClick={() => startDateRef.current?.showPicker()}
          sx={{
            borderRadius: "6px",
            borderColor: filters.startDate ? "var(--primary)" : "var(--border)",
            color: filters.startDate ? "var(--primary)" : "var(--muted)",
            fontSize: 13, fontWeight: 400, px: 1.5,
            textTransform: "none", position: "relative",
          }}
        >
          {filters.startDate ? (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <span>{formatDate(filters.startDate)}</span>
              <IoClose size={13} onClick={(e) => { e.stopPropagation(); setFilter("startDate", ""); }} />
            </Stack>
          ) : "Start date"}
          <input
            ref={startDateRef} type="date" value={filters.startDate}
            onChange={(e) => setFilter("startDate", e.target.value)}
            style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
          />
        </Button>

        {/* End date */}
        <Button
          variant="outlined" size="small"
          startIcon={<TbCalendar size={13} />}
          onClick={() => endDateRef.current?.showPicker()}
          sx={{
            borderRadius: "6px",
            borderColor: filters.endDate ? "var(--primary)" : "var(--border)",
            color: filters.endDate ? "var(--primary)" : "var(--muted)",
            fontSize: 13, fontWeight: 400, px: 1.5,
            textTransform: "none", position: "relative",
          }}
        >
          {filters.endDate ? (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <span>{formatDate(filters.endDate)}</span>
              <IoClose size={13} onClick={(e) => { e.stopPropagation(); setFilter("endDate", ""); }} />
            </Stack>
          ) : "End date"}
          <input
            ref={endDateRef} type="date" value={filters.endDate}
            onChange={(e) => setFilter("endDate", e.target.value)}
            style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
          />
        </Button>

        {hasFilters && (
          <Button
            size="small" startIcon={<IoClose />} onClick={clearAll} variant="outlined"
            sx={{ borderRadius: "6px", borderColor: "var(--border)", color: "var(--muted)", fontSize: 12, px: 1.5, textTransform: "none" }}
          >
            Clear all
          </Button>
        )}
      </Stack>

      {/* COLUMNS + BULK ACTIONS */}
      <Stack direction="row" justifyContent="flex-end" alignItems="center" mb={1.5} gap={1}>
        {selected.length > 0 && (
          <Typography fontSize={13} color="text.secondary" sx={{ mr: "auto" }}>
            {selected.length} selected
          </Typography>
        )}
        <Button
          size="small" startIcon={<TbAdjustmentsHorizontal size={14} />} variant="outlined"
          sx={{ borderRadius: "6px", borderColor: "var(--border)", color: "var(--muted)", fontSize: 12, px: 1.5, textTransform: "none" }}
        >
          Filters
        </Button>
        <Button
          size="small" startIcon={<TbColumns3 size={14} />} variant="outlined"
          onClick={(e) => setColumnsAnchor(e.currentTarget)}
          sx={{ borderRadius: "6px", borderColor: "var(--border)", color: "var(--muted)", fontSize: 12, px: 1.5, textTransform: "none" }}
        >
          Columns
        </Button>
        <Menu
          anchorEl={columnsAnchor} open={Boolean(columnsAnchor)}
          onClose={() => setColumnsAnchor(null)}
          PaperProps={{ sx: { borderRadius: 2, minWidth: 160, mt: 0.5 } }}
        >
          {ALL_COLUMNS.map((c) => (
            <MenuItem
              key={c.key}
              onClick={() => setVisibleCols((p) => p.includes(c.key) ? p.filter((k) => k !== c.key) : [...p, c.key])}
              sx={{ fontSize: 13, gap: 1 }}
            >
              <Checkbox size="small" checked={visibleCols.includes(c.key)} sx={{ p: 0 }} />
              {c.label}
            </MenuItem>
          ))}
        </Menu>
      </Stack>

      {/* TABLE */}
      <Paper sx={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid var(--border)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{ "& th": { fontWeight: 600, fontSize: 13, color: "var(--text)", py: 1.5, borderBottom: "1px solid var(--border)", bgcolor: "var(--surface)" } }}
              >
                <TableCell sx={{ width: 32, pr: 0 }} />
                <TableCell sx={{ width: 32, pl: 0 }}>
                  <Checkbox size="small" checked={allSelected} onChange={toggleAll} sx={{ p: 0 }} />
                </TableCell>
                {col("photo")    && <TableCell>Photo</TableCell>}
                {col("name")     && <TableCell><TableSortLabel active={sortKey === "name"} direction={sortDir} onClick={() => handleSort("name")}>Name</TableSortLabel></TableCell>}
                {col("phone")    && <TableCell>Phone</TableCell>}
                {col("groups")   && <TableCell>Groups</TableCell>}
                {col("teachers") && <TableCell>Teachers</TableCell>}
                {col("training") && <TableCell>Training dates</TableCell>}
                {col("balance")  && <TableCell>Balance</TableCell>}
                {col("comment")  && <TableCell>Comment</TableCell>}
                <TableCell align="right">
                  <Stack direction="row" justifyContent="flex-end" gap={0.5}>
                    {/* Add to group */}
                    <Tooltip title="Add to group">
                      <IconButton
                        size="small"
                        sx={{
                          color: selected.length > 0 ? "var(--primary)" : "var(--muted)",
                          "&:hover": { bgcolor: selected.length > 0 ? "var(--primary-tint)" : "transparent" },
                        }}
                        onClick={() => { if (selected.length > 0) setAddToGroupOpen(true); }}
                      >
                        <BsPersonPlus size={15} />
                      </IconButton>
                    </Tooltip>  

                    {/* Mail */}
                    <Tooltip title="Mail selected">
                      <IconButton size="small" sx={{ color: "var(--muted)" }} onClick={() => { if (selected.length > 0) setSendSmsOpen(true); }}>
                        <MdMail />
                      </IconButton>
                    </Tooltip>

                    {/* Delete selected */}
                    <Tooltip title="Delete selected">
                      <IconButton
                        size="small" sx={{ color: "var(--muted)" }}
                        onClick={handleBulkDelete}
                      >
                        <MdDelete size={15} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((s, i) => {
                const badge      = badgeColors[s.groupBadgeColor] ?? badgeColors.blue;
                const isSelected = selected.includes(s.uid);
                return (
                  <TableRow
                    key={s.uid}
                    hover
                    onClick={() => navigate(`/students/${s.uid}`)}
                    sx={{
                      "& td": { borderBottom: "1px solid var(--border)", py: 1.4, fontSize: 13 },
                      "&:last-child td": { borderBottom: "none" },
                      bgcolor: isSelected ? "var(--primary-tint)" : "var(--surface)",
                      "&:hover": { bgcolor: isSelected ? "#e8f2ff" : "var(--surface-2)", cursor: "pointer" },
                    }}
                  >
                    <TableCell sx={{ color: "var(--muted)", fontSize: 12, pr: 0, width: 32 }}>{i + 1}.</TableCell>
                    <TableCell sx={{ pl: 0, width: 32 }} onClick={(e) => e.stopPropagation()}>
                      <Checkbox size="small" checked={isSelected} onChange={() => toggleOne(s.uid)} sx={{ p: 0 }} />
                    </TableCell>

                    {col("photo") && (
                      <TableCell>
                        <Avatar sx={{ width: 34, height: 34, fontSize: 13, fontWeight: 700, bgcolor: "#d1d9e0", color: "var(--muted)" }}>
                          <FiUser size={16} />
                        </Avatar>
                      </TableCell>
                    )}
                    {col("name") && (
                      <TableCell sx={{ fontWeight: 500, color: "var(--ink)", minWidth: 160 }}>{s.name}</TableCell>
                    )}
                    {col("phone") && (
                      <TableCell><Typography fontSize={13} color="var(--primary)" sx={{ whiteSpace: "nowrap" }}>{s.phone}</Typography></TableCell>
                    )}
                    {col("groups") && (
                      <TableCell sx={{ minWidth: 220 }}>
                        <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
                          <Chip
                            label={s.groupBadge} size="small"
                            sx={{ fontSize: 10, height: 20, fontWeight: 600, bgcolor: badge.bg, color: badge.color, borderRadius: "4px" }}
                          />
                          <Typography fontSize={13} color="var(--text)">{s.groupName}</Typography>
                          <Typography fontSize={12} color="var(--muted)">({s.groupSchedule.split("• ")[1] || ""})</Typography>
                        </Stack>
                      </TableCell>
                    )}
                    {col("teachers") && (
                      <TableCell sx={{ minWidth: 140, color: "var(--text)" }}>{s.teacher}</TableCell>
                    )}
                    {col("training") && (
                      <TableCell sx={{ minWidth: 120 }}>
                        <Typography fontSize={13} color="var(--muted)">{formatDate(s.startDate)} —</Typography>
                        <Typography fontSize={13} color="var(--muted)">{formatDate(s.endDate)}</Typography>
                      </TableCell>
                    )}
                    {col("balance") && (
                      <TableCell>
                        <Typography fontSize={13} fontWeight={500} color={(s.balance ?? 0) < 0 ? "#ef4444" : "#16a34a"}>
                          {(s.balance ?? 0).toLocaleString("ru-RU")}
                        </Typography>
                      </TableCell>
                    )}
                    {col("comment") && <TableCell />}

                    {/* ACTIONS */}
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" onClick={(e) => openActionMenu(e, s.uid)} sx={{ color: "var(--muted)" }}>
                        <BsThreeDotsVertical size={15} />
                      </IconButton>
                      <Menu
                        anchorEl={actionMenu?.uid === s.uid ? actionMenu.el : null}
                        open={actionMenu?.uid === s.uid}
                        onClose={() => setActionMenu(null)}
                        PaperProps={{ sx: { borderRadius: 2, minWidth: 170, boxShadow: "0 4px 20px rgba(0,0,0,0.13)", border: "1px solid var(--border)" } }}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                      >
                        <MenuItem onClick={() => { setActionMenu(null); setEditDrawerOpen(true); }} sx={{ fontSize: 13, gap: 1.2, py: 1.2, color: "var(--text)" }}>
                          <MdEdit size={16} color="var(--muted)" /> Edit Student
                        </MenuItem>
                        <Divider sx={{ my: 0.5 }} />
                        <MenuItem onClick={() => { setActionMenu(null); setPaymentDrawerOpen(true); }} sx={{ fontSize: 13, gap: 1.2, py: 1.2, color: "#16a34a" }}>
                          <MdPayment size={16} color="#16a34a" /> Add payment
                        </MenuItem>
                        <Divider sx={{ my: 0.5 }} />
                        <MenuItem onClick={() => { setActionMenu(null); setDeleteUid(s.uid); }} sx={{ fontSize: 13, gap: 1.2, py: 1.2, color: "#ef4444" }}>
                          <MdDelete size={16} /> Remove
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 6, color: "var(--muted)" }}>
                    No students found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 1.5, borderTop: "1px solid var(--border)" }}>
          <Typography fontSize={13} color="text.secondary">
            1–{Math.min(filtered.length, 20)} of {filtered.length}
          </Typography>
          <Stack direction="row" gap={0.5}>
            {["<", ">"].map((lbl) => (
              <Button key={lbl} size="small" variant="outlined"
                sx={{ minWidth: 32, px: 1, borderColor: "var(--border)", color: "var(--text)", borderRadius: "6px", fontSize: 13 }}>
                {lbl}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Paper>

      {/* ── MODALS & DRAWERS ─────────────────────────────── */}

      <AddStudentDrawer
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        onSubmit={handleAddStudent}
      />
      <AddPaymentDrawer
        open={paymentDrawerOpen}
        student={activeStudent}
        onClose={() => setPaymentDrawerOpen(false)}
        onSubmit={addPayment}
      />
      <EditStudentDrawer
        open={editDrawerOpen}
        student={activeStudent}
        onClose={() => setEditDrawerOpen(false)}
        onSave={handleSaveEdit}
      />
      <AddToGroupModal
        open={addToGroupOpen}
        onClose={() => setAddToGroupOpen(false)}
        groups={ALL_GROUPS}
        selectedCount={selected.length}
        onSubmit={handleAddSelectedToGroup}
      />

      <SendSmsModal
        open={sendSmsOpen}
        onClose={() => setSendSmsOpen(false)}
        selectedCount={selected.length}
      />

      {/* Delete dialog */}
      <Dialog open={Boolean(deleteUid)} onClose={() => setDeleteUid(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Student</DialogTitle>
        <DialogContent>
          <Typography fontSize={14} color="text.secondary">Bu o'quvchi va uning to'lov tarixi butunlay o'chiriladi. Davom etasizmi?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteUid(null)} sx={{ color: "var(--muted)" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} sx={{ borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};