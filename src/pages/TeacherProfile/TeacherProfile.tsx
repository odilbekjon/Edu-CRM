// src/pages/teachers/TeacherProfile.tsx

import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IconButton, Button } from "@mui/material";
import { IoArrowBack } from "react-icons/io5";
import { MdEdit, MdClose } from "react-icons/md";
import { BsFlag } from "react-icons/bs";
import { type Group, type Teacher, type FlatStudent, formatDate } from "../../types/crm";
import { useData } from "../../Context/DataContext";
import { RightDrawer } from "../../components/RightDrawer";

const BADGE_STYLES = {
  blue:  { bg: "#E6F1FB", color: "var(--primary)", border: "#B5D4F4" },
  green: { bg: "#E1F5EE", color: "#0F6E56", border: "#9FE1CB" },
  amber: { bg: "#FAEEDA", color: "#BA7517", border: "#FAC775" },
};

const AVATAR_COLORS = [
  { bg: "#E6F1FB", text: "var(--primary)" },
  { bg: "#E1F5EE", text: "#0F6E56" },
  { bg: "#FAEEDA", text: "#BA7517" },
  { bg: "#FBEAF0", text: "#993556" },
  { bg: "#EAF3DE", text: "#3B6D11" },
];

function getAvatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}
function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

type TabType = "profile" | "history" | "salary";

/* ── Edit Drawer ── */
const EditDrawer = ({
  teacher, open, onClose,
}: {
  teacher: Teacher;
  open: boolean;
  onClose: () => void;
}) => {
  const [phone, setPhone] = useState(teacher.phone ?? "");
  const [name, setName] = useState(teacher.fullName ?? "");
  const [gender, setGender] = useState(teacher.gender ?? "Male");
  const [dob, setDob] = useState(teacher.dob ?? "");
  const { branches, updateTeacher } = useData();
  const [branch, setBranch] = useState<string>(teacher.branch ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    const ok = await updateTeacher(teacher.id, { fullName: name, phone, dob, gender, branch });
    setSaving(false);
    if (ok) onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1px solid var(--border)", borderRadius: 8,
    padding: "10px 12px", fontSize: 13, color: "var(--ink)", outline: "none",
    boxSizing: "border-box", background: "var(--surface)",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 6, display: "block",
  };

  return (
    <RightDrawer open={open} onClose={onClose} title="Edit Teacher" width={440}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>Phone</label>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ ...inputStyle, width: 72, flexShrink: 0, color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center" }}>+998</div>
              <input style={{ ...inputStyle, flex: 1 }} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="93 986 66 76" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Name</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Branch</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
              {branches.map((b) => (
                <label key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink)", cursor: "pointer" }}>
                  <input type="radio" name="teacher-branch" checked={branch === b.name} onChange={() => setBranch(b.name)} style={{ accentColor: "var(--primary)", width: 15, height: 15 }} />
                  {b.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Date of birth</label>
            <input type="date" style={{ ...inputStyle, color: dob ? "var(--ink)" : "var(--muted)" }} value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Gender</label>
            <div style={{ display: "flex", gap: 20 }}>
              {["Male", "Female"].map((g) => (
                <label key={g} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                  <input type="radio" name="gender" checked={gender === g} onChange={() => setGender(g)} style={{ accentColor: "var(--primary)" }} />
                  {g}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Photo</label>
            <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ flex: 1, padding: "10px 12px", fontSize: 13, color: "var(--muted)" }}>No file chosen</div>
              <label style={{ padding: "10px 18px", background: "var(--surface-2)", borderLeft: "1px solid var(--border)", fontSize: 13, color: "var(--ink)", cursor: "pointer", userSelect: "none" }}>
                Browse<input type="file" style={{ display: "none" }} />
              </label>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 12, color: "var(--primary)", cursor: "pointer" }}>+ Set password</span>
          </div>
          <button onClick={submit} disabled={saving} style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: saving ? "wait" : "pointer", alignSelf: "flex-start" }}>{saving ? "Saving..." : "Submit"}</button>
        </div>
    </RightDrawer>
  );
};

/* ── Flag Dropdown ── */
const FlagDropdown = ({ open, onClose, anchorRef }: { open: boolean; onClose: () => void; anchorRef: React.RefObject<HTMLDivElement> }) => {
  const [comment, setComment] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left });
    }
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node) && anchorRef.current && !anchorRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, anchorRef]);

  if (!open) return null;
  return (
    <div ref={dropRef} style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 1400, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.13)", padding: "16px", width: 280, animation: "dropDown 0.18s ease" }}>
      <style>{`@keyframes dropDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
          <BsFlag size={14} color="#e05c5c" /> Add Comment
        </span>
        <MdClose size={16} color="var(--muted)" style={{ cursor: "pointer" }} onClick={onClose} />
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." style={{ width: "100%", minHeight: 90, border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--ink)", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
        <button onClick={onClose} style={{ padding: "8px 14px", fontSize: 12, border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", cursor: "pointer", color: "var(--muted)" }}>Cancel</button>
        <button onClick={() => { onClose(); setComment(""); }} style={{ padding: "8px 14px", fontSize: 12, border: "none", borderRadius: 8, background: "var(--primary)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Save</button>
      </div>
    </div>
  );
};

/* ── GroupCard ── */
const GroupCard = ({ group, isSelected, onSelect }: { group: Group; isSelected: boolean; onSelect: () => void }) => {
  const badgeStyle = BADGE_STYLES[group.badgeColor];
  return (
    <div onClick={onSelect} style={{ border: isSelected ? "1.5px solid var(--primary)" : "1px solid var(--border)", borderRadius: 10, padding: "11px 14px", cursor: "pointer", background: isSelected ? "var(--primary-tint)" : "var(--surface)", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flexShrink: 0, width: 110 }}>
        <span style={{ display: "inline-block", fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 5, background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}`, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{group.badge}</span>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{group.name}</div>
      </div>
      <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
        <div>{formatDate(group.startDate)} — {formatDate(group.endDate)}</div>
        <div>{group.schedule}</div>
      </div>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
        {group.students.length}
      </div>
    </div>
  );
};

/* ── StudentTooltip ── */
const StudentTooltip = ({
  flatStudent, visible, position,
}: {
  flatStudent: FlatStudent | undefined;
  visible: boolean;
  position: { top: number; left: number };
}) => {
  if (!visible || !flatStudent) return null;
  const balance = flatStudent.balance ?? 0;

  return (
    <div style={{ position: "fixed", top: position.top, left: position.left, zIndex: 2000, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", padding: "16px", width: 240, pointerEvents: "none", animation: "tooltipFadeIn 0.15s ease" }}>
      <style>{`@keyframes tooltipFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{flatStudent.name}</div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>(id: {flatStudent.uid})</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: flatStudent.active ? "#0F6E56" : "var(--muted)", fontWeight: 500 }}>
          {flatStudent.active ? "Active (Learns)" : "Inactive"}
        </span>
        {balance < 0 && (
          <span style={{ background: "#ef4444", color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Debtor</span>
        )}
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "10px 0" }} />

      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Phone</div>
      <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, marginBottom: 10 }}>{flatStudent.phone}</div>

      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Balance</div>
      <div style={{ marginBottom: 10 }}>
        <span style={{ display: "inline-block", background: balance < 0 ? "#ef4444" : "#16a34a", color: "#fff", borderRadius: 8, padding: "4px 12px", fontSize: 13, fontWeight: 700 }}>
          {balance > 0 ? "+" : ""}{balance.toLocaleString("ru-RU")} UZS
        </span>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "10px 0" }} />

      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Group</div>
      <div style={{ fontSize: 13, color: "var(--ink)", marginBottom: 10 }}>{flatStudent.groupName}</div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, textAlign: "right" }}>
        <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>Go to profile →</span>
      </div>
    </div>
  );
};

/* ── StudentRow ── */
const StudentRow = ({
  student, groupId, isLast, onNavigate, allFlatStudents,
}: {
  student: Group["students"][number];
  groupId: number;
  isLast: boolean;
  onNavigate: (uid: string) => void;
  allFlatStudents: FlatStudent[];
}) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const rowRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // uid = `${groupId}-${student.id}` — buildFlatStudents() bilan to'liq mos
  const uid = `${groupId}-${student.id}`;
  const flatStudent = allFlatStudents.find((s) => s.uid === uid);

  const handleMouseEnter = () => {
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      const leftCandidate = rect.left - 256;
      setTooltipPos({
        top: Math.min(rect.top, window.innerHeight - 380),
        left: leftCandidate > 0 ? leftCandidate : rect.right + 8,
      });
    }
    timerRef.current = setTimeout(() => setHovered(true), 200);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHovered(false);
  };

  return (
    <>
      <div
        ref={rowRef}
        onClick={() => onNavigate(uid)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", borderBottom: !isLast ? "1px solid var(--border)" : "none", cursor: "pointer", background: hovered ? "var(--primary-tint)" : "transparent", transition: "background 0.12s" }}
      >
        <span style={{ fontSize: 12, color: hovered ? "var(--primary)" : "var(--ink)", fontWeight: hovered ? 500 : 400, transition: "color 0.12s" }}>{student.name}</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{student.phone}</span>
      </div>
      <StudentTooltip flatStudent={flatStudent} visible={hovered} position={tooltipPos} />
    </>
  );
};

/* ── StudentsList ── */
const StudentsList = ({
  group, onGoToGroup, onNavigateToStudent, allFlatStudents,
}: {
  group: Group;
  onGoToGroup: () => void;
  onNavigateToStudent: (uid: string) => void;
  allFlatStudents: FlatStudent[];
}) => {
  const badgeStyle = BADGE_STYLES[group.badgeColor];
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--surface)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
        <span style={{ display: "inline-block", fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 6, background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}`, marginBottom: 6 }}>{group.badge}</span>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>{group.name}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
          Room: <strong style={{ color: "var(--ink)" }}>{group.room}</strong>
          &nbsp;&nbsp; Start: <strong style={{ color: "var(--ink)" }}>{group.schedule.split("• ")[1]}</strong>
        </div>
      </div>
      <div style={{ overflowY: "auto", maxHeight: 360 }}>
        {group.students.map((s, idx) => (
          <StudentRow
            key={s.id}
            student={s}
            groupId={group.id}
            isLast={idx === group.students.length - 1}
            onNavigate={onNavigateToStudent}
            allFlatStudents={allFlatStudents}
          />
        ))}
      </div>
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", textAlign: "right" }}>
        <span onClick={onGoToGroup} style={{ fontSize: 12, color: "var(--primary)", cursor: "pointer", fontWeight: 500 }}>Go to group →</span>
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════
   HistoryTab
══════════════════════════════════════════ */
// Harakatlar tarixi (audit log) hali backendda yo'q
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HistoryTab = ({ teacher: _teacher }: { teacher: Teacher }) => (
  <div style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
    No data available
  </div>
);

/* ══════════════════════════════════════════
   SalaryTab
══════════════════════════════════════════ */
interface SalaryRow {
  no: number;
  groupName: string;
  course: string;
  student: string;
  lessons: number;
  present: number;
  absent: number;
  notMarked: number;
  settingAmount: string;
  estimatedAmount: string;
  calcSetting: string;
  salaryType: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SalaryTab = ({ teacher: _teacher }: { teacher: Teacher }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>("—");

  // Mock: no data for salary (matches screenshot "No Data")
  const rows: SalaryRow[] = [];
  const total = rows.reduce((s, r) => s + Number(r.estimatedAmount.replace(/\D/g, "") || 0), 0);

  const months = ["—", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];

  const thStyle: React.CSSProperties = {
    padding: "12px 14px",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--muted)",
    textAlign: "left",
    borderBottom: "1px solid var(--border)",
    whiteSpace: "nowrap",
  };

  return (
    <div>
      {/* Month selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "5px 10px",
            fontSize: 13,
            color: "var(--ink)",
            outline: "none",
            background: "var(--surface)",
            cursor: "pointer",
          }}
        >
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>—</span>
      </div>

      {/* Total */}
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
        Total: <span style={{ color: "var(--ink)", fontWeight: 500 }}>{total.toLocaleString("ru-RU")}</span>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--surface)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface)" }}>
              {[
                "No",
                "Group / Course",
                "Student",
                "Lessons / Present / Absent / Not Marked",
                "Setting amount",
                "Estimated amount",
                "Calc setting",
                "Salary type",
              ].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "32px 0", fontSize: 14, color: "var(--muted)" }}>
                  No Data
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.no} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--muted)" }}>{row.no}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--ink)" }}>
                    <div style={{ fontWeight: 500 }}>{row.groupName}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{row.course}</div>
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--ink)" }}>{row.student}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--ink)" }}>
                    {row.lessons} / {row.present} / {row.absent} / {row.notMarked}
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--ink)" }}>{row.settingAmount}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{row.estimatedAmount}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--ink)" }}>{row.calcSetting}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--ink)" }}>{row.salaryType}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   Main — TeacherProfile
══════════════════════════════════════════ */
export const TeacherProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const flagAnchorRef = useRef<HTMLDivElement>(null);

  // buildFlatStudents bir marta — barcha StudentRow lar uchun
  const { students: allFlatStudents, teachers, loading } = useData();

  const teacher = teachers.find((t) => t.id === Number(id));

  if (!teacher && loading) return <div style={{ padding: 40, color: "var(--muted)" }}>Loading...</div>;

  if (!teacher) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
        <p>Teacher not found.</p>
        <Button onClick={() => navigate("/teachers")} sx={{ mt: 2 }}>← Back to Teachers</Button>
      </div>
    );
  }

  const avatarColor = getAvatarColor(teacher.id);
  const activeGroupId = selectedGroupId ?? (teacher.groups[0]?.id ?? null);
  const activeGroup = teacher.groups.find((g) => g.id === activeGroupId);

  const tabs: { key: TabType; label: string }[] = [
    { key: "profile", label: "PROFILE" },
    { key: "history", label: "History" },
    { key: "salary", label: "Salary" },
  ];

  const iconBtn = (icon: React.ReactNode, onClick: () => void, ref?: React.RefObject<HTMLDivElement>) => (
    <div ref={ref} onClick={onClick}
      style={{ width: 30, height: 30, border: "1px solid var(--border)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--muted)", background: "var(--surface)", transition: "background 0.15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
    >
      {icon}
    </div>
  );

  return (
    <div style={{ padding: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, padding: "16px 0 0" }}>
        <IconButton size="small" onClick={() => navigate(-1)}><IoArrowBack size={18} /></IconButton>
        <span style={{ fontSize: 22, fontWeight: 500 }}>{teacher.fullName}</span>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
        {tabs.map((tab) => (
          <div key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ padding: "10px 18px 12px", cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400, color: activeTab === tab.key ? "var(--primary)" : "var(--muted)", borderBottom: activeTab === tab.key ? "2px solid var(--primary)" : "2px solid transparent", transition: "all 0.15s" }}>
            {tab.label}
          </div>
        ))}
      </div>

      {activeTab === "profile" && (
        <div style={{ display: "grid", gridTemplateColumns: "400px 1fr 300px", gap: 20, alignItems: "start" }}>

          {/* Left */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "20px 16px", background: "var(--surface)", position: "relative" }}>
            <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
              {iconBtn(<BsFlag size={13} />, () => setFlagOpen((p) => !p), flagAnchorRef)}
              {iconBtn(<MdEdit size={13} />, () => setEditOpen(true))}
            </div>
            <div style={{ display: "flex", }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: avatarColor.bg, color: avatarColor.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 500, marginBottom: 10 }}>
                {getInitials(teacher.fullName)}
              </div>
              <div style={{ marginLeft: 12, marginTop: 10, fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>{teacher.fullName}</div>
            </div>
               <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6,}}>(id: {teacher.uid})</div>
            <div style={{ fontSize: 13, marginBottom: 4 }}>Phone: <span style={{ color: "var(--primary)", fontWeight: 500 }}>{teacher.phone}</span></div>
            {teacher.telegram && <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>{teacher.telegram}</div>}
            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "12px 0" }} />
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Roles</div>
            <span style={{ display: "inline-block", fontSize: 12, padding: "4px 12px", borderRadius: 14, background: "#E6F1FB", color: "var(--primary)", border: "1px solid #B5D4F4" }}>{teacher.role}</span>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 12, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Branches</div>
            <span style={{ display: "inline-block", fontSize: 12, padding: "4px 12px", borderRadius: 14, background: "#E1F5EE", color: "#0F6E56", border: "1px solid #9FE1CB" }}>{teacher.branch}</span>
           
          </div>

          {/* Middle */}
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", marginBottom: 12 }}>Groups</div>
            {teacher.groups.length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: 13, padding: "24px 0", textAlign: "center" }}>No groups assigned</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 440, overflowY: "auto", paddingRight: 2 }}>
                {teacher.groups.map((group) => (
                  <GroupCard key={group.id} group={group} isSelected={group.id === activeGroupId} onSelect={() => setSelectedGroupId(group.id === activeGroupId ? null : group.id)} />
                ))}
              </div>
            )}
          </div>

          {/* Right */}
          {activeGroup && (
            <StudentsList
              group={activeGroup}
              onGoToGroup={() => navigate(`/groups/${activeGroup.id}`)}
              onNavigateToStudent={(uid) => navigate(`/students/${uid}`)}
              allFlatStudents={allFlatStudents}
            />
          )}
        </div>
      )}

      {activeTab === "history" && <HistoryTab teacher={teacher} />}
      {activeTab === "salary" && <SalaryTab teacher={teacher} />}

      <EditDrawer teacher={teacher} open={editOpen} onClose={() => setEditOpen(false)} />
      <FlagDropdown open={flagOpen} onClose={() => setFlagOpen(false)} anchorRef={flagAnchorRef} />
    </div>
  );
};