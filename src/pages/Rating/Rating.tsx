import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormControl,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { MdBarChart, MdTableChart } from "react-icons/md";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { gradesApi } from "../../api";

interface RatingRow { id: number; name: string; group: string; grade: number }



const PAGE_SIZES = [10, 20, 50];

// ─── Grade color helper ───────────────────────────────────────────────────────
function gradeColor(g: number) {
  if (g >= 90) return "#22c55e";
  if (g >= 75) return "var(--primary)";
  if (g >= 60) return "#f59e0b";
  return "#ef4444";
}

// ─── Sort icon ────────────────────────────────────────────────────────────────
type SortKey = "name" | "group" | "grade";
type SortDir = "asc" | "desc";

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="inline-flex flex-col ml-1 leading-none text-[10px]">
      <span style={{ color: active && dir === "asc" ? "var(--primary)" : "var(--muted)" }}>▲</span>
      <span style={{ color: active && dir === "desc" ? "var(--primary)" : "var(--muted)" }}>▼</span>
    </span>
  );
}

// ─── DatePicker wrapper ───────────────────────────────────────────────────────
function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative flex-1">
      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10" size={16} />
      <TextField
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        fullWidth
        sx={{
          "& .MuiInputBase-root": { paddingLeft: "2rem", backgroundColor: "var(--surface)" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
          "& .MuiInputBase-input": { fontSize: 14, color: "var(--text)" },
        }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const Rating = () => {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  const [dateFrom, setDateFrom] = useState(fmt(yesterday));
  const [dateTo,   setDateTo]   = useState(fmt(today));
  const [tab,      setTab]      = useState(1);   // 0=Graph, 1=Table
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortKey,  setSortKey]  = useState<SortKey>("grade");
  const [sortDir,  setSortDir]  = useState<SortDir>("desc");

  const [ALL_STUDENTS, setRows] = useState<RatingRow[]>([]);
  useEffect(() => {
    gradesApi
      .rating({ from: dateFrom, to: dateTo })
      .then((rows) => setRows(rows.map((r) => ({ id: r.studentId, name: r.name, group: r.group, grade: r.grade }))))
      .catch(() => setRows([]));
  }, [dateFrom, dateTo]);

  const filtered = useMemo(() => {
    return [...ALL_STUDENTS].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [ALL_STUDENTS, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }

  // chart data: group averages
  const chartData = useMemo(() => {
    const map: Record<string, number[]> = {};
    ALL_STUDENTS.forEach(s => {
      if (!map[s.group]) map[s.group] = [];
      map[s.group].push(s.grade);
    });
    return Object.entries(map).map(([group, grades]) => ({
      group,
      avg: Math.round(grades.reduce((a, b) => a + b, 0) / grades.length),
    }));
  }, [ALL_STUDENTS]);

  const headerCell = (label: string, key: SortKey) => (
    <TableCell
      onClick={() => toggleSort(key)}
      sx={{ cursor: "pointer", fontWeight: 600, fontSize: 13, color: "var(--muted)", userSelect: "none", whiteSpace: "nowrap" }}
    >
      {label}
      <SortIcon active={sortKey === key} dir={sortDir} />
    </TableCell>
  );

  return (
    <div className="p-5 max-w-8xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl font-semibold text-ink mb-5">Rating</h1>

      {/* Date pickers */}
      <div className="flex gap-4 mb-4">
        <DateField value={dateFrom} onChange={v => { setDateFrom(v); setPage(1); }} />
        <DateField value={dateTo}   onChange={v => { setDateTo(v);   setPage(1); }} />
      </div>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 36 }}>
          <Tab
            icon={<MdBarChart size={16} />}
            iconPosition="start"
            label="Graph"
            sx={{ minHeight: 36, fontSize: 13, textTransform: "none", gap: 0.5 }}
          />
          <Tab
            icon={<MdTableChart size={16} />}
            iconPosition="start"
            label="Table"
            sx={{ minHeight: 36, fontSize: 13, textTransform: "none" }}
          />
        </Tabs>
      </Box>

      {/* Graph tab */}
      {tab === 0 && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="group" tick={{ fontSize: 13 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                // formatter={(v: number) => [`${v}`, "Avg grade"]}
                contentStyle={{ borderRadius: 8, fontSize: 13 }}
              />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={gradeColor(entry.avg)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Table tab */}
      {tab === 1 && (
        <>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "var(--surface-2)" }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "var(--muted)", width: 56 }}>№</TableCell>
                  {headerCell("Name", "name")}
                  {headerCell("Group", "group")}
                  {headerCell("Grade", "grade")}
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6, color: "var(--muted)", fontSize: 14 }}>
                      No Data
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((row, i) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{ "&:last-child td": { borderBottom: 0 } }}
                    >
                      <TableCell sx={{ color: "var(--muted)", fontSize: 13 }}>
                        {(page - 1) * pageSize + i + 1}
                      </TableCell>
                      <TableCell sx={{ fontSize: 14, fontWeight: 500 }}>{row.name}</TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                          {row.group}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: gradeColor(row.grade) + "22",
                            color: gradeColor(row.grade),
                          }}
                        >
                          {row.grade}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <div className="flex items-center gap-3 mt-3">
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                sx={{ fontSize: 13 }}
              >
                {PAGE_SIZES.map(s => (
                  <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}/page</MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className="flex items-center gap-1 ml-auto">
              <IconButton
                size="small"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <FiChevronLeft size={16} />
              </IconButton>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`el-${i}`} className="px-1 text-muted text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                        page === p
                          ? "bg-blue-500 text-white"
                          : "text-body hover:bg-surface2"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <IconButton
                size="small"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <FiChevronRight size={16} />
              </IconButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
};