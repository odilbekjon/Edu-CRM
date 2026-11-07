import {useState} from "react";
import { MdClose, MdSearch,  } from "react-icons/md";
import type { Student } from "../../../types/crm";
import { useData } from "../../../Context/DataContext";
import { RightDrawer } from "../../../components/RightDrawer";
import { formatStudentPhone } from "../../../api";

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13,
  color: "var(--ink)",
  outline: "none",
  boxSizing: "border-box",
  background: "var(--surface)",
  fontFamily: "inherit",
};
    
const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "var(--ink)",
  marginBottom: 6,
  display: "block",
};

const submitBtn: React.CSSProperties = {
  background: "var(--primary)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "11px 24px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const cancelBtn: React.CSSProperties = {
  background: "var(--surface)",
  color: "#666",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "11px 24px",
  fontSize: 14,
  cursor: "pointer",
};

export const AddStudentDrawer = ({
  open, onClose, onAdd,
}: {
  open: boolean; onClose: () => void;
  onAdd: (s: Student & { startDate?: string }) => void;
}) => {
  const { apiStudents } = useData();
  const students = apiStudents.map((s) => ({ id: s.id, name: s.fullName, phone: formatStudentPhone(s.phone) }));
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<(typeof students)[0] | null>(null);
  const [startDate, setStartDate] = useState("");

  const filtered = query.length > 0
    ? students.filter(
        (s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.phone.includes(query)
      ).slice(0, 8)
    : [];

  const handleAdd = () => {
    if (!selected) return;
    onAdd({ id: selected.id, name: selected.name, phone: selected.phone, active: true });
    setQuery(""); setSelected(null); setStartDate("");
    onClose();
  };

  return (
    <RightDrawer open={open} onClose={onClose} title="Add Student" width={440}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>Search student</label>
          <div style={{ position: "relative" }}>
            <MdSearch size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input
              style={{ ...inputStyle, paddingLeft: 36 }}
              placeholder="Name or phone..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
            />
          </div>
          {filtered.length > 0 && !selected && (
            <div style={{ border: "1px solid var(--border)", borderRadius: 8, marginTop: 4, background: "var(--surface)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              {filtered.map((s) => (
                <div
                  key={s.id}
                  onClick={() => { setSelected(s); setQuery(s.name); }}
                  style={{ padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-tint)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
                >
                  <span style={{ fontWeight: 500 }}>{s.name}</span>
                  <span style={{ color: "var(--muted)" }}>{s.phone}</span>
                </div>
              ))}
            </div>
          )}
          {query.length > 0 && filtered.length === 0 && !selected && (
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>No students found</div>
          )}
        </div>
        {selected && (
          <div style={{ background: "var(--primary-tint)", border: "1px solid #B5D4F4", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{selected.phone}</div>
            </div>
            <div onClick={() => { setSelected(null); setQuery(""); }} style={{ cursor: "pointer", color: "var(--muted)" }}>
              <MdClose size={16} />
            </div>
          </div>
        )}
        <div>
          <label style={labelStyle}>Start date</label>
          <input type="date" style={inputStyle} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...submitBtn, opacity: selected ? 1 : 0.5 }} onClick={handleAdd} disabled={!selected}>
            Add Student
          </button>
          <button style={cancelBtn} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </RightDrawer>
  );
};