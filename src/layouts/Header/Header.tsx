// src/layouts/Header/Header.tsx

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Avatar, Badge, Box, Divider, Menu, MenuItem, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useBranch } from "../../Context/BranchContext";
import { useData } from "../../Context/DataContext";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { RightDrawer } from "../../components/RightDrawer";
import { SIDEBAR_WIDTH, HEADER_HEIGHT } from "../Sidebar/Sidebar";
import { notificationsApi, type ApiNotification } from "../../api";

import {
  MdSearch, MdFullscreen, MdFullscreenExit,
  MdHelpOutline, MdNotificationsNone,
  MdKeyboardArrowDown, MdAdd, MdCalendarToday, MdLogout, MdPersonOutline, MdSettings, MdDarkMode, MdLightMode,
} from "react-icons/md";

import logo from "../../assets/logo.svg";
import logoWhite from "../../assets/logo_ya.png";
import { useThemeMode } from "../../Context/ThemeModeContext";
import { LangMenu } from "../../components/PreferenceToggles";

/* ─── shared styles ─── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
  boxSizing: "border-box",
  background: "var(--surface)",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text)",
  marginBottom: 6,
  display: "block",
};

const submitBtn = (disabled: boolean): React.CSSProperties => ({
  background: disabled ? "#a5b4fc" : "var(--primary)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 28px",
  fontSize: 14,
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "background .15s",
});

const PAYMENT_METHODS = ["Cash", "Card", "Bank account", "Payme", "Click", "Uzum", "Humo"];

/* ══════════════════════════════════════════
   Add Student Drawer
══════════════════════════════════════════ */
const AddStudentDrawer = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { groups, createStudent } = useData();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "">("");
  const [comment, setComment] = useState("");
  const [showGroupField, setShowGroupField] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [group, setGroup] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const phoneOk = phone.replace(/\D/g, "").length === 9;
  const canSubmit = name.trim().length >= 2 && phoneOk && !saving;

  const handleClose = () => {
    setPhone(""); setName(""); setDob(""); setGender("");
    setComment(""); setGroup(""); setPassword("");
    setShowGroupField(false); setShowPasswordField(false);
    onClose();
  };

  const handleSubmit = async () => {
    setSaving(true);
    const ok = await createStudent({
      name, phone, dob, gender, comment, password,
      groupId: group ? Number(group) : undefined,
    });
    setSaving(false);
    if (ok) handleClose();
  };

  return (
    <RightDrawer open={open} onClose={handleClose} title="Add new student">
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>Phone</label>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{
              ...inputStyle, width: 72, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--muted)", fontWeight: 600, background: "var(--bg)",
            }}>+998</div>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="90 123 45 67"
              type="tel"
              maxLength={13}
            />
          </div>
          {phone && !phoneOk && <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>9 ta raqam kiriting</div>}
        </div>

        <div>
          <label style={labelStyle}>Name</label>
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Date of birth</label>
          <div style={{ position: "relative" }}>
            <MdCalendarToday size={14} style={{
              position: "absolute", left: 12, top: "50%",
              transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none",
            }} />
            <input
              type="date"
              style={{ ...inputStyle, paddingLeft: 34 }}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Gender</label>
          <div style={{ display: "flex", gap: 24 }}>
            {(["Male", "Female"] as const).map((g) => (
              <label key={g} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="add-student-gender"
                  checked={gender === g}
                  onChange={() => setGender(g)}
                  style={{ accentColor: "var(--primary)", width: 16, height: 16 }}
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Comment</label>
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowGroupField((p) => !p)}
            style={{ fontSize: 13, color: "var(--primary)", cursor: "pointer", border: "none", background: "none", fontWeight: 600, padding: 0 }}
          >
            + Add to the group
          </button>
          {showGroupField && (
            <select
              style={{ ...inputStyle, marginTop: 8 }}
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              <option value="">Select group...</option>
              {groups.map((g) => (
                <option key={g.id} value={String(g.id)}>{g.name} — {g.schedule}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowPasswordField((p) => !p)}
            style={{ fontSize: 13, color: "var(--primary)", cursor: "pointer", border: "none", background: "none", fontWeight: 600, padding: 0 }}
          >
            + Set password
          </button>
          {showPasswordField && (
            <input
              type="password"
              style={{ ...inputStyle, marginTop: 8 }}
              placeholder="Password (min 6)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </div>

        <div style={{ marginTop: 4 }}>
          <button onClick={handleSubmit} disabled={!canSubmit} style={submitBtn(!canSubmit)}>
            {saving ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </RightDrawer>
  );
};

/* ══════════════════════════════════════════
   Add Payment Drawer
══════════════════════════════════════════ */
const AddPaymentDrawer = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { apiStudents, addPayment } = useData();
  const today = () => new Date().toISOString().split("T")[0];
  const [method, setMethod] = useState("Cash");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [comment, setComment] = useState("");
  const [studentId, setStudentId] = useState("");
  const [saving, setSaving] = useState(false);

  const student = apiStudents.find((s) => String(s.id) === studentId);
  const canSubmit = !!student && Number(amount) > 0 && !saving;

  const handleClose = () => {
    setMethod("Cash"); setAmount(""); setComment("");
    setStudentId(""); setDate(today());
    onClose();
  };

  const handleSubmit = async () => {
    if (!student) return;
    setSaving(true);
    const ok = await addPayment({ studentId: student.id, amount: Number(amount), method, date, comment: comment || undefined });
    setSaving(false);
    if (ok) handleClose();
  };

  return (
    <RightDrawer open={open} onClose={handleClose} title="Add payment" width={440}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={labelStyle}>Student</label>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} style={inputStyle}>
            <option value="">Select student</option>
            {apiStudents.map((s) => (
              <option key={s.id} value={s.id}>{s.fullName}</option>
            ))}
          </select>
        </div>

        {student && (
          <div style={{
            background: student.balance < 0 ? "#fee2e2" : "var(--primary-tint)",
            color: student.balance < 0 ? "#b91c1c" : "var(--primary-dark)",
            borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600,
            display: "inline-flex", alignSelf: "flex-start",
          }}>
            Balance: {student.balance.toLocaleString("ru-RU")} UZS
          </div>
        )}

        <div>
          <label style={labelStyle}>Method pay</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {PAYMENT_METHODS.map((m) => (
              <label key={m} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="pay-method"
                  checked={method === m}
                  onChange={() => setMethod(m)}
                  style={{ accentColor: "var(--primary)", width: 16, height: 16 }}
                />
                {m}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Amount (UZS)</label>
          <input
            style={inputStyle}
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Comment</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div>
          <button onClick={handleSubmit} disabled={!canSubmit} style={submitBtn(!canSubmit)}>
            {saving ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </RightDrawer>
  );
};

/* ══════════════════════════════════════════
   Small building blocks
══════════════════════════════════════════ */
const IconBtn = ({ children, onClick, active, title }: {
  children: ReactNode; onClick?: () => void; active?: boolean; title?: string;
}) => (
  <button
    title={title}
    aria-label={title}
    onClick={onClick}
    style={{
      width: 38, height: 38, border: "1px solid var(--border)", borderRadius: 10,
      background: active ? "var(--primary-tint)" : "var(--surface)", display: "flex",
      alignItems: "center", justifyContent: "center", cursor: "pointer",
      color: active ? "var(--primary)" : "var(--muted)", flexShrink: 0, transition: "all 0.15s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "var(--primary-tint)";
      e.currentTarget.style.color = "var(--primary)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = active ? "var(--primary-tint)" : "var(--surface)";
      e.currentTarget.style.color = active ? "var(--primary)" : "var(--muted)";
    }}
  >
    {children}
  </button>
);

/** Tashqariga bosilganda yopish */
const useClickAway = (open: boolean, close: () => void) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, close]);
  return ref;
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute", top: "calc(100% + 8px)",
  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
  boxShadow: "var(--shadow-md)", zIndex: 500,
  animation: "dropDown 0.15s ease", overflow: "hidden",
};

/* ─── Branch Dropdown ─── */
const BranchDropdown = () => {
  const { branch, setBranch, options } = useBranch();
  const [open, setOpen] = useState(false);
  const ref = useClickAway(open, () => setOpen(false));
  const current = options.find((o) => o.value === branch);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer",
          padding: "0 12px", height: 38, borderRadius: 10, fontSize: 14,
          fontWeight: 600, color: "var(--ink)", transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-tint)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
      >
        {current?.label ?? "Branch"}
        <MdKeyboardArrowDown
          size={18} color="var(--muted)"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        />
      </button>
      {open && (
        <div style={{ ...dropdownStyle, left: 0, minWidth: 220 }}>
          <style>{`@keyframes dropDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { setBranch(opt.value); setOpen(false); }}
              style={{
                padding: "10px 14px", fontSize: 14, cursor: "pointer",
                fontWeight: opt.value === branch ? 600 : 400,
                color: opt.value === branch ? "var(--primary)" : "var(--ink)",
                background: opt.value === branch ? "var(--primary-tint)" : "var(--surface)",
              }}
              onMouseEnter={(e) => { if (opt.value !== branch) e.currentTarget.style.background = "var(--bg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = opt.value === branch ? "var(--primary-tint)" : "var(--surface)"; }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Global Search (o'quvchi / o'qituvchi / guruh) ─── */
const SearchBar = () => {
  const navigate = useNavigate();
  const { apiStudents, teachers, groups } = useData();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const ref = useClickAway(focused, () => setFocused(false));

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    const students = apiStudents
      .filter((s) => s.fullName.toLowerCase().includes(t) || s.phone.includes(t.replace(/\D/g, "") || "—"))
      .slice(0, 5)
      .map((s) => ({ key: `s${s.id}`, label: s.fullName, sub: "Student", to: `/students/${s.id}` }));
    const ts = teachers
      .filter((x) => x.fullName.toLowerCase().includes(t))
      .slice(0, 3)
      .map((x) => ({ key: `t${x.id}`, label: x.fullName, sub: "Teacher", to: `/teachers/${x.id}` }));
    const gs = groups
      .filter((g) => g.name.toLowerCase().includes(t))
      .slice(0, 3)
      .map((g) => ({ key: `g${g.id}`, label: g.name, sub: `Group · ${g.teacher}`, to: `/groups/${g.id}` }));
    return [...students, ...ts, ...gs];
  }, [q, apiStudents, teachers, groups]);

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, maxWidth: 520 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: focused ? "var(--surface)" : "var(--bg)", border: `1px solid ${focused ? "var(--primary)" : "transparent"}`,
        boxShadow: focused ? "0 0 0 3px rgba(59,91,219,.12)" : "none",
        borderRadius: 10, padding: "0 14px", height: 38, transition: "all 0.15s",
      }}>
        <MdSearch size={18} color="var(--muted)" />
        <input
          placeholder="Search students, teachers, groups..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          style={{
            border: "none", background: "none", outline: "none",
            fontSize: 14, color: "var(--ink)", width: "100%", fontFamily: "inherit",
          }}
        />
      </div>
      {focused && q.trim().length >= 2 && (
        <div style={{ ...dropdownStyle, left: 0, right: 0 }}>
          {results.length === 0 ? (
            <div style={{ padding: "14px 16px", fontSize: 13, color: "var(--muted)" }}>Hech narsa topilmadi</div>
          ) : (
            results.map((r) => (
              <div
                key={r.key}
                onClick={() => { navigate(r.to); setQ(""); setFocused(false); }}
                style={{ padding: "10px 16px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 2 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{r.label}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{r.sub}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Notifications (backenddan) ─── */
const NotificationBtn = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ApiNotification[]>([]);
  const ref = useClickAway(open, () => setOpen(false));

  useEffect(() => {
    let alive = true;
    notificationsApi.list().then((n) => alive && setItems(n)).catch(() => {});
    return () => { alive = false; };
  }, []);

  const unread = items.filter((n) => !n.read).length;
  const toggle = () => {
    setOpen((p) => !p);
    if (!open && unread > 0) {
      notificationsApi.readAll().then(() => setItems((l) => l.map((n) => ({ ...n, read: true })))).catch(() => {});
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <IconBtn onClick={toggle} title="Notifications" active={open}>
        <Badge color="error" variant="dot" invisible={unread === 0} overlap="circular">
          <MdNotificationsNone size={20} />
        </Badge>
      </IconBtn>
      {open && (
        <div style={{ ...dropdownStyle, right: 0, width: 320 }}>
          <div style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "var(--ink)", borderBottom: "1px solid var(--border)" }}>
            Notifications
          </div>
          {items.length === 0 ? (
            <div style={{ padding: "18px 16px", fontSize: 13, color: "var(--muted)" }}>Yangi xabarlar yo'q</div>
          ) : (
            items.slice(0, 6).map((n) => (
              <div key={n.id} style={{ padding: "10px 16px", borderBottom: "1px solid var(--bg)" }}>
                <div style={{ fontSize: 13, color: "var(--ink)", marginBottom: 2 }}>{n.text}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(n.createdAt).toLocaleString("uz-UZ")}</div>
              </div>
            ))
          )}
          <Link to="/notifications" onClick={() => setOpen(false)} style={{ display: "block", padding: "12px 16px", textAlign: "center", fontSize: 13, color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            View all
          </Link>
        </div>
      )}
    </div>
  );
};

/* ─── Quick Add (➕) ─── */
const QuickAddBtn = ({ onAddStudent, onAddPayment }: {
  onAddStudent: () => void; onAddPayment: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useClickAway(open, () => setOpen(false));

  const items = [
    { label: "Add student", emoji: "🎓", action: onAddStudent },
    { label: "Add payment", emoji: "💳", action: onAddPayment },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        title="Quick add"
        aria-label="Quick add"
        style={{
          width: 38, height: 38, border: "none", borderRadius: 10,
          background: "var(--primary)", color: "#fff", display: "flex",
          alignItems: "center", justifyContent: "center", cursor: "pointer",
          boxShadow: "0 4px 12px rgba(59,91,219,.3)", transition: "background .15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-dark)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
      >
        <MdAdd size={22} />
      </button>
      {open && (
        <div style={{ ...dropdownStyle, left: 0, minWidth: 190 }}>
          {items.map((item) => (
            <div
              key={item.label}
              onClick={() => { setOpen(false); item.action(); }}
              style={{ padding: "11px 16px", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "var(--ink)", fontWeight: 500 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
            >
              <span style={{ fontSize: 16 }}>{item.emoji}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   Main Header
══════════════════════════════════════════ */
export const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { mode, toggle: toggleMode } = useThemeMode();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);

  // Escape bosilganda fullscreen holatini sinxronlash
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  };

  const canManage = user && ["ceo", "admin", "manager"].includes(user.role);
  const canPay = user && ["ceo", "admin", "manager", "accountant"].includes(user.role);
  const initial = (user?.fullName ?? "?").charAt(0).toUpperCase();

  return (
    <>
      <Box
        component="header"
        sx={{
          position: "fixed", top: 0, left: 0, right: 0,
          height: HEADER_HEIGHT, zIndex: 100,
          backgroundColor: "var(--header-bg)", backdropFilter: "saturate(180%) blur(12px)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center",
        }}
      >
        <Box sx={{
          width: SIDEBAR_WIDTH, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          height: "100%", px: 1.5,
        }}>
          <Link to="/dashboard" style={{ display: "flex", alignItems: "center" }}>
            <img
              src={mode === "dark" ? logoWhite : logo} alt="logo"
              style={{ width: SIDEBAR_WIDTH - 28, height: "auto", maxHeight: 38, objectFit: "contain", display: "block" }}
            />
          </Link>
        </Box>

        <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1.5, pr: 3, pl: 1, height: "100%", minWidth: 0 }}>
          <BranchDropdown />
          {(canManage || canPay) && (
            <QuickAddBtn
              onAddStudent={() => (canManage ? setAddStudentOpen(true) : toast("Sizda bu amal uchun ruxsat yo'q", "warning"))}
              onAddPayment={() => (canPay ? setAddPaymentOpen(true) : toast("Sizda bu amal uchun ruxsat yo'q", "warning"))}
            />
          )}
          <SearchBar />
          <Box sx={{ flex: 1 }} />

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            <IconBtn onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              {isFullscreen ? <MdFullscreenExit size={20} /> : <MdFullscreen size={20} />}
            </IconBtn>
            <IconBtn title="Help"><MdHelpOutline size={20} /></IconBtn>
          </Box>
          <LangMenu />
          <IconBtn onClick={toggleMode} title={mode === "dark" ? "Light mode" : "Dark mode"}>
            {mode === "dark" ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </IconBtn>
          <NotificationBtn />

          <Divider orientation="vertical" flexItem sx={{ my: 2.2 }} />

          <button
            onClick={(e) => setUserMenuAnchor(e.currentTarget)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              border: "none", background: "none", cursor: "pointer",
              borderRadius: 12, padding: "4px 6px 4px 10px", transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", lineHeight: 1.2 }}>
                {user?.fullName}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "var(--muted)", textTransform: "capitalize" }}>
                {user?.role}
              </Typography>
            </Box>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "var(--primary)", fontSize: 14, fontWeight: 700 }}>
              {initial}
            </Avatar>
          </button>

          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={() => setUserMenuAnchor(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{ paper: { sx: { mt: 1, minWidth: 190 } } }}
          >
            <MenuItem sx={{ fontSize: 14, gap: 1.2 }} onClick={() => { setUserMenuAnchor(null); navigate("/profile"); }}>
              <MdPersonOutline size={18} /> My Profile
            </MenuItem>
            <MenuItem sx={{ fontSize: 14, gap: 1.2 }} onClick={() => { setUserMenuAnchor(null); navigate("/settings"); }}>
              <MdSettings size={18} /> Settings
            </MenuItem>
            <Divider />
            <MenuItem
              sx={{ fontSize: 14, gap: 1.2, color: "var(--danger, #e5484d)" }}
              onClick={() => { setUserMenuAnchor(null); logout(); navigate("/", { replace: true }); }}
            >
              <MdLogout size={18} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <AddStudentDrawer open={addStudentOpen} onClose={() => setAddStudentOpen(false)} />
      <AddPaymentDrawer open={addPaymentOpen} onClose={() => setAddPaymentOpen(false)} />
    </>
  );
};
