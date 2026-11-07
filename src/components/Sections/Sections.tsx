import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  TextField,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { leadsApi, errorMessage, formatPhone, type ApiLead } from "../../api";
import { useToast } from "../../Context/ToastContext";
import { FiList, FiMoreHorizontal, FiInfo, FiClock } from "react-icons/fi";
import { HiOutlineUserAdd } from "react-icons/hi";

type ColumnKey = "leads" | "expectation" | "set";

interface LeadCard {
  id: number;
  name: string;
  phone: string;
  date: string;
  hasTask: boolean;
  col: ColumnKey;
}

const COLUMN_LABELS: Record<ColumnKey, string> = {
  leads: "LEADS",
  expectation: "EXPECTATION",
  set: "SET",
};

// Avatar color by index
const AVATAR_COLORS = [
  "#f59e42", "#4f8ef7", "#a78bfa", "#34d399", "#f87171",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const COL_STATUS: Record<ColumnKey, ApiLead["status"]> = { leads: "new", expectation: "contacted", set: "trial" };
const STATUS_COL: Partial<Record<ApiLead["status"], ColumnKey>> = { new: "leads", contacted: "expectation", trial: "set" };

const toCard = (l: ApiLead): LeadCard | null => {
  const col = STATUS_COL[l.status];
  if (!col) return null; // converted / lost kanbanda ko'rinmaydi
  return {
    id: l.id,
    name: l.name,
    phone: formatPhone(l.phone),
    date: l.createdAt.slice(0, 10).split("-").reverse().join("."),
    hasTask: false,
    col,
  };
};

interface AddFormProps {
  onSave: (data: { name: string; phone: string; source: string; comment: string }) => void;
  onClose: () => void;
}

const AddForm = ({ onSave, onClose }: AddFormProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fromWhere, setFromWhere] = useState("");
  const [section, setSection] = useState("");
  const [comment, setComment] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // slight delay so the open-click doesn't immediately close it
    const t = setTimeout(() => document.addEventListener("mousedown", handleClick), 100);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  return (
    <Paper
      ref={ref}
      variant="outlined"
      sx={{ p: 1.5, borderRadius: 1.5, mt: 0.5 }}
    >
      <TextField
        size="small"
        fullWidth
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 1, "& input": { fontSize: 13 } }}
        autoFocus
      />
      <TextField
        size="small"
        fullWidth
        placeholder="+998"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        sx={{ mb: 1, "& input": { fontSize: 13 } }}
      />
      <TextField
        size="small"
        fullWidth
        placeholder="From where"
        value={fromWhere}
        onChange={(e) => setFromWhere(e.target.value)}
        sx={{ mb: 1, "& input": { fontSize: 13 } }}
      />
      <TextField
        size="small"
        fullWidth
        placeholder="Section"
        value={section}
        onChange={(e) => setSection(e.target.value)}
        sx={{ mb: 1, "& input": { fontSize: 13 } }}
      />
      <TextField
        size="small"
        fullWidth
        placeholder="Comment"
        multiline
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        sx={{ mb: 1, "& textarea": { fontSize: 13 } }}
      />
      <Button
        fullWidth
        variant="contained"
        size="small"
        disabled={!name.trim()}
        onClick={() => {
          onSave({ name: name.trim(), phone: phone.trim(), source: fromWhere.trim(), comment: comment.trim() });
        }}
        sx={{ fontSize: 13, textTransform: "none", borderRadius: 1 }}
      >
        Send
      </Button>
    </Paper>
  );
};

export const Sections = () => {
  const { toast } = useToast();
  const [cards, setCards] = useState<LeadCard[]>([]);
  const [activeFormCol, setActiveFormCol] = useState<ColumnKey | null>(null);
  const [menu, setMenu] = useState<{ el: HTMLElement; card: LeadCard } | null>(null);

  const load = () =>
    leadsApi
      .list()
      .then((rows) => setCards(rows.map(toCard).filter((c): c is LeadCard => c !== null).reverse()))
      .catch((e) => toast(errorMessage(e), "error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const act = async (fn: () => Promise<unknown>, ok?: string) => {
    try {
      await fn();
      if (ok) toast(ok, "success");
      await load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  const handleSave = async (col: ColumnKey, d: { name: string; phone: string; source: string; comment: string }) => {
    await act(
      () => leadsApi.create({ name: d.name, phone: d.phone, status: COL_STATUS[col], source: d.source || undefined, comment: d.comment || undefined }),
      "Lead qo'shildi",
    );
    setActiveFormCol(null);
  };

  const colCards = (col: ColumnKey) => cards.filter((c) => c.col === col);

  const colTitle = (col: ColumnKey) => {
    const list = colCards(col);
    return `${COLUMN_LABELS[col]} (${list.length} / ${list.length})`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 0,
        mr: 2,
        border: "0.5px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "var(--surface)",
        minHeight: 500,
      }}
    >
      {(["leads", "expectation", "set"] as ColumnKey[]).map((col, i) => {
        const list = colCards(col);

        return (
          <Box
            key={col}
            sx={{
              flex: 1,
              borderRight: i < 2 ? "0.5px solid" : "none",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "0.5px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: "text.primary",
                }}
              >
                {colTitle(col)}
              </Typography>
              <IconButton size="small" sx={{ color: "text.disabled" }}>
                <FiList size={14} />
              </IconButton>
            </Box>

            {/* Body */}
            <Box
              sx={{
                px: 1.5,
                py: 1.5,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                overflowY: "auto",
              }}
            >
              {/* Add button */}
              <Button
                fullWidth
                variant="contained"
                onClick={() =>
                  setActiveFormCol(activeFormCol === col ? null : col)
                }
                sx={{
                  backgroundColor: "var(--primary)",
                  minHeight: 40,
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "var(--primary)" },
                }}
              >
                <HiOutlineUserAdd size={20} />
              </Button>

              {/* Inline Add Form */}
              {activeFormCol === col && (
                <AddForm
                  onSave={(d) => handleSave(col, d)}
                  onClose={() => setActiveFormCol(null)}
                />
              )}

              {/* Cards */}
              {list.map((card, idx) => (
                <Paper
                  key={card.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 1.5,
                    overflow: "hidden",
                    "&:hover": { borderColor: "var(--primary)", boxShadow: "0 1px 6px rgba(33,150,243,0.10)" },
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                >
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 12,
                        fontWeight: 700,
                        backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(card.name)}
                    </Avatar>

                    {/* Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, color: "text.primary" }}
                        noWrap
                      >
                        {card.name}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.3 }}
                        noWrap
                      >
                        {card.phone}
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "text.disabled",
                        flexShrink: 0,
                      }}
                    >
                      <IconButton size="small" sx={{ p: 0.25, color: "text.disabled" }}>
                        <FiInfo size={13} />
                      </IconButton>
                      <IconButton size="small" sx={{ p: 0.25, color: "text.disabled" }}>
                        <FiClock size={13} />
                      </IconButton>
                      <IconButton size="small" sx={{ p: 0.25, color: "text.disabled" }} onClick={(e) => setMenu({ el: e.currentTarget, card })}>
                        <FiMoreHorizontal size={13} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Footer */}
                  <Box
                    sx={{
                      backgroundColor: "var(--surface-2)",
                      borderTop: "0.5px solid",
                      borderColor: "divider",
                      px: 1.5,
                      py: 0.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                      {card.date}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                        No
                      </Typography>
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: card.hasTask ? "#4caf50" : "#f59e42",
                        }}
                      />
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Column footer — total count */}
            {col === "leads" && list.length > 0 && (
              <Box
                sx={{
                  borderTop: "0.5px solid",
                  borderColor: "divider",
                  px: 2,
                  py: 1,
                  textAlign: "center",
                  backgroundColor: "var(--surface-2)",
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}>
                  {list.length} / {list.length}
                </Typography>
              </Box>
            )}
          </Box>
        );
      })}
      <Menu anchorEl={menu?.el} open={Boolean(menu)} onClose={() => setMenu(null)}>
        {menu &&
          (Object.keys(COL_STATUS) as ColumnKey[])
            .filter((c) => c !== menu.card.col)
            .map((c) => (
              <MenuItem
                key={c}
                sx={{ fontSize: 13 }}
                onClick={() => { const id = menu.card.id; setMenu(null); act(() => leadsApi.update(id, { status: COL_STATUS[c] })); }}
              >
                Move to {COLUMN_LABELS[c].toLowerCase()}
              </MenuItem>
            ))}
        <Divider />
        <MenuItem
          sx={{ fontSize: 13 }}
          onClick={() => { const id = menu!.card.id; setMenu(null); act(() => leadsApi.convert(id), "O'quvchiga aylantirildi"); }}
        >
          Convert to student
        </MenuItem>
        <MenuItem
          sx={{ fontSize: 13 }}
          onClick={() => { const id = menu!.card.id; setMenu(null); act(() => leadsApi.update(id, { status: "lost" }), "Lead yopildi"); }}
        >
          Mark as lost
        </MenuItem>
        <MenuItem
          sx={{ fontSize: 13, color: "error.main" }}
          onClick={() => {
            const id = menu!.card.id;
            setMenu(null);
            if (window.confirm("Lead o'chirilsinmi?")) act(() => leadsApi.remove(id), "O'chirildi");
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};