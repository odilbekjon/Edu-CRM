import { useEffect, useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Dot,
} from "recharts";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Pagination,
} from "@mui/material";
import { FiXCircle } from "react-icons/fi";
import { BsCash } from "react-icons/bs";
import { paymentsApi, errorMessage, type ApiWithdrawal } from "../../../../api";
import { useToast } from "../../../../Context/ToastContext";
import { useAuth } from "../../../../Context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Withdrawal {
  id: number;
  date: string;
  name: string;
  sum: number;
  comment: string;
  commentBadge?: string;
  commentLessons?: string;
  commentDateRange?: string;
  creator: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt     = (n: number) => n.toLocaleString("ru-RU");
const fmtDate = (d: string) => d.split("-").reverse().join(".");

const PAGE_SIZE   = 20;

const toIso = (d: string) => {
  const [dd, mm, yyyy] = d.split(".");
  return dd && mm && yyyy && yyyy.length === 4 ? `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}` : "";
};
const toDot = (iso: string) => iso.split("-").reverse().join(".");

const toWithdrawal = (c: ApiWithdrawal): Withdrawal => ({
  id: c.id,
  date: c.date,
  name: c.student.fullName,
  sum: c.amount,
  comment: c.group ? "" : "not assigned",
  commentBadge: c.group?.name,
  commentLessons: c.group?.course.name,
  commentDateRange: c.comment ?? undefined,
  creator: c.createdBy?.fullName ?? "—",
  createdAt: toDot(c.date),
});

// ─── Small UI pieces ──────────────────────────────────────────────────────────

const Label = ({ text }: { text: string }) => (
  <label className="block text-[10px] text-muted font-medium mb-1">{text}</label>
);

const Input = ({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full border border-line rounded-md px-2 py-[7px] text-xs text-body bg-surface focus:outline-none focus:ring-1 focus:ring-[#3b5bdb]"
  />
);

const Select = ({ value, onChange, options, placeholder = "Select" }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full border border-line rounded-md px-2 py-[7px] text-xs text-body bg-surface focus:outline-none focus:ring-1 focus:ring-[#3b5bdb] cursor-pointer"
  >
    <option value="">{placeholder}</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

const SortIcon = ({ active, dir }: { active: boolean; dir: "asc" | "desc" }) => (
  <span className={`ml-1 text-[10px] ${active ? "text-[#3b5bdb]" : "text-muted"}`}>
    {active ? (dir === "asc" ? "▲" : "▼") : "⇅"}
  </span>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

type SortKey = "date" | "name" | "sum" | "creator";

export const Withdraw = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [all, setAll] = useState<Withdrawal[]>([]);
  const [courseOf, setCourseOf] = useState<Record<number, string>>({});
  const load = () =>
    paymentsApi.withdrawals().then((rows) => {
      setAll(rows.map(toWithdrawal));
      setCourseOf(Object.fromEntries(rows.map((r) => [r.id, r.group?.course.name ?? ""])));
    }).catch((e) => toast(errorMessage(e), "error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const monthStart = new Date(); monthStart.setDate(1);
  const [dateFrom,  setDateFrom]  = useState(toDot(monthStart.toISOString().slice(0, 10)));
  const [dateTo,    setDateTo]    = useState(toDot(new Date().toISOString().slice(0, 10)));
  const [namePhone, setNamePhone] = useState("");
  const [sum,       setSum]       = useState("");
  const [course,    setCourse]    = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page,    setPage]    = useState(1);

  const filtered = useMemo(() => {
    const from = toIso(dateFrom), to = toIso(dateTo);
    return all
      .filter((w) => {
        if (from && w.date < from) return false;
        if (to && w.date > to) return false;
        if (course && courseOf[w.id] !== course) return false;
        if (namePhone && !w.name.toLowerCase().includes(namePhone.toLowerCase())) return false;
        if (sum && String(w.sum) !== sum) return false;
        return true;
      })
      .sort((a, b) => {
        const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [all, courseOf, dateFrom, dateTo, course, namePhone, sum, sortKey, sortDir]);

  const ALL_COURSES = [...new Set(Object.values(courseOf).filter(Boolean))];
  const TOTAL = filtered.reduce((a, w) => a + w.sum, 0);

  const chartData = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const w of all) byMonth.set(w.date.slice(0, 7), (byMonth.get(w.date.slice(0, 7)) ?? 0) + w.sum);
    return [...byMonth].sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, value }));
  }, [all]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bu yechishni bekor qilasizmi? Summa o'quvchi balansiga qaytariladi.")) return;
    try {
      await paymentsApi.removeWithdrawal(id);
      toast("Bekor qilindi", "success");
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  const handleChargeMonth = async () => {
    if (!window.confirm("Joriy oy uchun faol guruhlardagi o'quvchilar balansidan guruh narxi yechiladi. Davom etasizmi?")) return;
    try {
      const r = await paymentsApi.chargeMonth();
      toast(`${r.charged} ta o'quvchidan yechildi (${r.skipped} ta oldin yechilgan)`, "success");
      load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  return (
    <div className="p-6 min-h-screen">

      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-ink">Withdraw</h1>
        {user && ["ceo", "admin"].includes(user.role) && (
          <button
            onClick={handleChargeMonth}
            className="bg-[#3b5bdb] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#2f49b5] transition-colors"
          >
            Charge this month
          </button>
        )}
      </div>

      {/* Top: stat card + chart */}
      <div className="grid grid-cols-5 gap-4 mb-5">

        {/* Stat card */}
        <div className="col-span-2">
          <div className="bg-surface rounded-xl border border-line border-l-[5px] border-l-[#3b5bdb] px-6 py-5 flex items-center justify-between shadow-sm h-full">
            <div>
              <p className="text-sm text-muted font-medium mb-2">Total withdrawals:</p>
              <p className="text-2xl font-bold text-ink tracking-tight">
                {fmt(TOTAL)}{" "}
                <span className="text-base font-semibold text-muted">UZS</span>
              </p>
              <p className="text-xs text-muted mt-2">
                📅 {dateFrom} — {dateTo}
              </p>
            </div>
            <BsCash size={40} className="text-[#3b5bdb] opacity-80 shrink-0 ml-4" />
          </div>
        </div>

        {/* Chart */}
        <div className="col-span-3 bg-surface rounded-xl border border-line p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 8, fill: "var(--muted)" }}
                interval={1}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 8, fill: "var(--muted)" }}
                tickFormatter={(v) => `${Math.round(v / 1000000)}M`}
                tickLine={false}
                axisLine={false}
                width={52}
              />
              <Tooltip
                formatter={(v) => v !== undefined ? [`${fmt(v as number)} UZS`, "Withdrawn"] : null}
                contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid var(--border)" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={<Dot r={3} fill="var(--primary)" stroke="#fff" strokeWidth={1.5} />}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-xl border border-line shadow-sm mb-4 px-5 py-4">
        <div className="grid grid-cols-6 gap-3 items-end">
          <div>
            <Label text="Date from" />
            <Input value={dateFrom} onChange={setDateFrom} placeholder="01.05.2026" />
          </div>
          <div>
            <Label text="Date to" />
            <Input value={dateTo} onChange={setDateTo} placeholder="31.05.2026" />
          </div>
          <div>
            <Label text="Name or Phone" />
            <Input value={namePhone} onChange={setNamePhone} placeholder="" />
          </div>
          <div>
            <Label text="Sum" />
            <Input value={sum} onChange={setSum} placeholder="" />
          </div>
          <div>
            <Label text="Course" />
            <Select value={course} onChange={setCourse} options={ALL_COURSES} />
          </div>
          <div>
            <button
              className="w-full bg-[#3b5bdb] text-white rounded-md py-[7px] text-xs font-medium hover:bg-[#2f49b5] transition-colors"
              onClick={() => setPage(1)}
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-line overflow-hidden shadow-sm">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "var(--surface-2)" }}>
                {(
                  [
                    { key: "date",    label: "Date" },
                    { key: "name",    label: "Name" },
                    { key: "sum",     label: "Sum" },
                    { key: null,      label: "Comment" },
                    { key: "creator", label: "Creator" },
                    { key: null,      label: "Actions" },
                  ] as { key: SortKey | null; label: string }[]
                ).map(({ key, label }) => (
                  <TableCell
                    key={label}
                    onClick={() => key && handleSort(key)}
                    align={label === "Actions" ? "center" : "left"}
                    sx={{
                      fontWeight: 700,
                      fontSize: 12,
                      color: "var(--text)",
                      cursor: key ? "pointer" : "default",
                      whiteSpace: "nowrap",
                      borderBottom: "2px solid var(--border)",
                      py: 1.5,
                      userSelect: "none",
                    }}
                  >
                    {label}
                    {key && <SortIcon active={sortKey === key} dir={sortDir} />}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.map((w, i) => {
                const rowNum = (page - 1) * PAGE_SIZE + i + 1;
                return (
                  <TableRow
                    key={w.id}
                    hover
                    sx={{
                      "&:hover": { backgroundColor: "var(--primary-tint) !important" },
                      backgroundColor: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)",
                    }}
                  >
                    {/* Date */}
                    <TableCell sx={{ fontSize: 12, py: 1.5, whiteSpace: "nowrap", fontWeight: 500, color: "var(--text)", minWidth: 110 }}>
                      {rowNum}. {fmtDate(w.date)}
                    </TableCell>

                    {/* Name */}
                    <TableCell sx={{ fontSize: 12, py: 1.5, color: "var(--text)", minWidth: 180 }}>
                      {w.name}
                    </TableCell>

                    {/* Sum */}
                    <TableCell sx={{ fontSize: 12, py: 1.5, whiteSpace: "nowrap", minWidth: 130 }}>
                      <span className="font-bold text-ink text-sm">{fmt(w.sum)}</span>
                      <span className="text-[11px] text-muted ml-1">UZS</span>
                    </TableCell>

                    {/* Comment */}
                    <TableCell sx={{ fontSize: 12, py: 1.5, minWidth: 200 }}>
                      {w.comment === "not assigned" ? (
                        <span className="text-muted italic text-xs">not assigned</span>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="bg-gray-800 text-white text-[10px] font-medium px-2 py-[2px] rounded">
                              {w.commentBadge}
                            </span>
                            <span className="text-xs text-muted">{w.commentLessons}</span>
                          </div>
                          <p className="text-[11px] text-muted">{w.commentDateRange}</p>
                        </div>
                      )}
                    </TableCell>

                    {/* Creator */}
                    <TableCell sx={{ fontSize: 12, py: 1.5, minWidth: 160 }}>
                      <span className="text-body text-xs">{w.creator}</span>
                      <br />
                      <span className="text-[11px] text-muted">{w.createdAt}</span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <FiXCircle size={20} />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: "var(--muted)", fontSize: 13 }}>
                    No withdrawals found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-line">
          <span className="text-xs text-muted">
            Showing{" "}
            <strong className="text-body">
              {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}
            </strong>{" "}
            of <strong className="text-body">{filtered.length}</strong> withdrawals
          </span>

          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              size="small"
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": { fontSize: 12, color: "var(--text)" },
                "& .Mui-selected": {
                  backgroundColor: "var(--primary) !important",
                  color: "#fff !important",
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};