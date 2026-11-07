
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography, Tooltip, Skeleton } from "@mui/material";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip,
  CartesianGrid, ResponsiveContainer,
} from "recharts";
import {
  FiUsers, FiUserCheck, FiLayers, FiAlertTriangle,
  FiPlayCircle, FiDollarSign, FiUserMinus, FiUserX,
} from "react-icons/fi";
import { MdViewColumn, MdViewStream } from "react-icons/md";

import { ScheduleTab, ScheduleOrientation } from "../../types/dashboardTypes";
import { dashboardApi, type DashboardStats, type ScheduleResponse } from "../../api";
import { useAuth } from "../../Context/AuthContext";

const PRIMARY = "var(--primary)";

// ─── Stat card config (qiymatlar backenddan keladi) ───────────────────────────

const STATS: Array<{
  key: keyof DashboardStats; label: string; route: string; filter?: string; icon: JSX.Element; accent: string; tint: string;
}> = [
  { key: "leads",      label: "Active leads",            route: "/leads",    icon: <FiUsers size={18} />,         accent: "var(--primary)", tint: "#eef2ff" },
  { key: "students",   label: "Active students",         route: "/students", icon: <FiUserCheck size={18} />,     accent: "#16a34a", tint: "#e8f7ee" },
  { key: "groups",     label: "Groups",                  route: "/groups",   icon: <FiLayers size={18} />,        accent: "#7c3aed", tint: "#f3eeff" },
  { key: "debtors",    label: "Debtors",                 route: "/finance/debtors", icon: <FiAlertTriangle size={18} />, accent: "#e5484d", tint: "#fdecec" },
  { key: "trial",      label: "In a trial lesson",       route: "/students", filter: "trial", icon: <FiPlayCircle size={18} />, accent: "#0891b2", tint: "#e4f6fa" },
  { key: "paid",       label: "Paid during the month",   route: "/finance/all-payments", icon: <FiDollarSign size={18} />, accent: "#f59e0b", tint: "#fff4dd" },
  { key: "leftActive", label: "Left active group",       route: "/students", filter: "left_active", icon: <FiUserMinus size={18} />, accent: "#ea580c", tint: "#ffefe3" },
  { key: "leftTrial",  label: "Left after trial period", route: "/students", filter: "left_trial", icon: <FiUserX size={18} />, accent: "#64748b", tint: "#eef1f5" },
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${y.slice(2)}`;
};

// ─── Time helpers ─────────────────────────────────────────────────────────────

const DEFAULT_START = 8 * 60;
const DEFAULT_END   = 18 * 60 + 30;

const buildTimeScale = (events: ScheduleResponse["events"]) => {
  let start = DEFAULT_START;
  let end = DEFAULT_END;
  for (const e of events) {
    start = Math.min(start, Math.floor(e.start / 60) * 60);
    end = Math.max(end, Math.ceil((e.start + e.duration) / 30) * 30);
  }
  const labels: string[] = [];
  for (let m = start; m <= end; m += 30) {
    labels.push(`${Math.floor(m / 60).toString().padStart(2, "0")}:${(m % 60).toString().padStart(2, "0")}`);
  }
  return { start, end, total: end - start, labels };
};

// ─── Custom chart tooltip ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 2, px: 2, py: 1.5,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    }}>
      <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>
        {new Intl.NumberFormat("uz-UZ").format(payload[0].value)} UZS
      </Typography>
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canSeeFinance = !!user && ["ceo", "admin", "manager", "accountant"].includes(user.role);

  const [tab,         setTab        ] = useState<ScheduleTab>("odd");
  const [orientation, setOrientation] = useState<ScheduleOrientation>("horizontal");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<Array<{ month: string; value: number }>>([]);
  const [schedule, setSchedule] = useState<ScheduleResponse>({ rooms: [], events: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      canSeeFinance ? dashboardApi.stats() : Promise.reject(),
      canSeeFinance ? dashboardApi.revenue() : Promise.reject(),
      dashboardApi.schedule(),
    ]).then(([st, rev, sch]) => {
      if (!alive) return;
      if (st.status === "fulfilled") setStats(st.value);
      if (rev.status === "fulfilled") setRevenue(rev.value);
      if (sch.status === "fulfilled") setSchedule(sch.value);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [canSeeFinance]);

  const ROOMS = schedule.rooms;
  const scale = useMemo(() => buildTimeScale(schedule.events), [schedule.events]);
  const TIME_START = scale.start;
  const TIME_LABELS = scale.labels;
  const pct = (mins: number) => `${((mins / scale.total) * 100).toFixed(3)}%`;

  const chartData = useMemo(() => revenue.map((r) => ({ month: monthLabel(r.month), value: r.value })), [revenue]);
  const revenueTotal = revenue.reduce((s, r) => s + r.value, 0);

  // Filtered events for current tab
  const visibleEvents = useMemo(
    () => schedule.events.filter((e) => e.days.includes(tab)),
    [schedule.events, tab],
  );

  // Navigate stat card → page (with optional ?filter=xxx)
  const goTo = (route: string, filter?: string) => {
    const url = filter ? `${route}?filter=${filter}` : route;
    navigate(url);
  };

  const tabLabel: Record<ScheduleTab, string> = {
    odd: "Odd days", even: "Even days", other: "Other",
  };
  const tabs: ScheduleTab[] = ["odd", "even", "other"];

  return (
    <Box sx={{
      minHeight: "100%",
      backgroundColor: "var(--bg)",
      pt: 3, px: { xs: 2, md: 4 }, pb: 6,
    }}>

      {/* ═══ STAT CARDS ═══ */}
      {canSeeFinance && (
        <Box sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 1.75,
          mb: 3,
          "@media(max-width:1100px)": { gridTemplateColumns: "repeat(2,1fr)" },
          "@media(max-width:560px)":  { gridTemplateColumns: "1fr" },
        }}>
          {STATS.map(({ key, label, route, filter, icon, accent, tint }) => (
            <Paper
              key={key}
              elevation={0}
              role="button"
              tabIndex={0}
              onClick={() => goTo(route, filter)}
              onKeyDown={(e) => e.key === "Enter" && goTo(route, filter)}
              sx={{
                p: 2, borderRadius: "16px", border: "1px solid var(--border)", background: "var(--surface)",
                display: "flex", alignItems: "center", gap: 1.75,
                cursor: "pointer", userSelect: "none", transition: "all 0.18s ease",
                "&:hover": { borderColor: accent, boxShadow: "0 8px 24px rgba(16,24,40,0.08)", transform: "translateY(-2px)" },
                "&:focus-visible": { outline: `2px solid ${accent}` },
              }}
            >
              <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: tint, color: accent, display: "grid", placeItems: "center", flexShrink: 0 }}>
                {icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                {loading ? (
                  <Skeleton width={48} height={32} />
                ) : (
                  <Typography sx={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                    {(stats?.[key] ?? 0).toLocaleString("ru-RU")}
                  </Typography>
                )}
                <Typography sx={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 500, mt: 0.25 }}>
                  {label}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* ═══ REVENUE CHART ═══ */}
      {canSeeFinance && (
        <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid var(--border)", p: 3, mb: 3, background: "var(--surface)" }}>
          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Revenue</Typography>
              <Typography sx={{ fontSize: 12.5, color: "var(--muted)" }}>Oxirgi 12 oy tushumi</Typography>
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: 20, color: PRIMARY }}>
              {new Intl.NumberFormat("uz-UZ").format(revenueTotal)} UZS
            </Typography>
          </Box>
          <Box height={240}>
            {loading ? (
              <Skeleton variant="rounded" height={240} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted)" }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(v % 1_000_000 ? 1 : 0)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                    width={48}
                  />
                  <RTooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone" dataKey="value"
                    stroke={PRIMARY} strokeWidth={2.5} fill="url(#revFill)"
                    dot={{ r: 3, fill: "#fff", stroke: PRIMARY, strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: PRIMARY }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Paper>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SCHEDULE
      ════════════════════════════════════════════════════════════════ */}
      <Paper elevation={0} sx={{
        borderRadius: "16px", border: "1px solid var(--border)",
        background: "var(--surface)", overflow: "hidden",
      }}>

        {/* Schedule header */}
        <Box sx={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          px: 3, py: 1.5,
          borderBottom: "1px solid var(--border)",
          flexWrap: "wrap", gap: 1,
        }}>
          {/* Tabs */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  background: "none", border: "none",
                  cursor: "pointer", padding: "6px 14px",
                  fontSize: 13, fontWeight: 600,
                  color: tab === t ? "var(--primary)" : "var(--muted)",
                  borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {tabLabel[t]}
              </button>
            ))}
          </Box>

          {/* Title */}
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>
            Schedule
          </Typography>

          {/* Orientation toggle */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <button
              onClick={() => setOrientation("horizontal")}
              title="Gorizontal ko'rinish"
              style={{
                background: orientation === "horizontal" ? "var(--primary-tint)" : "transparent",
                border: orientation === "horizontal" ? "1px solid var(--primary)" : "1px solid var(--border)",
                borderRadius: 8, padding: "4px 10px",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                color: orientation === "horizontal" ? "var(--primary)" : "var(--muted)",
                fontSize: 12, fontWeight: 600, transition: "all 0.15s",
              }}
            >
              <MdViewStream size={16} />
              Horizontal
            </button>
            <button
              onClick={() => setOrientation("vertical")}
              title="Vertikal ko'rinish"
              style={{
                background: orientation === "vertical" ? "var(--primary-tint)" : "transparent",
                border: orientation === "vertical" ? "1px solid var(--primary)" : "1px solid var(--border)",
                borderRadius: 8, padding: "4px 10px",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                color: orientation === "vertical" ? "var(--primary)" : "var(--muted)",
                fontSize: 12, fontWeight: 600, transition: "all 0.15s",
              }}
            >
              <MdViewColumn size={16} />
              Vertical
            </button>
          </Box>
        </Box>

        {/* ── HORIZONTAL layout ── */}
        {orientation === "horizontal" && (
          <Box sx={{ overflowX: "auto" }}>
            <Box sx={{ minWidth: 1100 }}>

              {/* Time header row */}
              <Box sx={{
                display: "grid",
                gridTemplateColumns: "110px 1fr",
                borderBottom: "1px solid var(--border)",
                background: "var(--surface-2)",
              }}>
                <Box sx={{ borderRight: "1px solid var(--border)", py: 1 }} />
                <Box sx={{ position: "relative", height: 32 }}>
                  {TIME_LABELS.map((t, i) => (
                    <Typography
                      key={t}
                      sx={{
                        position: "absolute",
                        left: `${(i / (TIME_LABELS.length - 1)) * 100}%`,
                        transform: "translateX(-50%)",
                        top: "50%", mt: "-9px",
                        fontSize: 10, whiteSpace: "nowrap",
                        fontWeight: 500,
                        color: (t === "10:30" || t === "11:00") ? "var(--primary)" : "var(--muted)",
                      }}
                    >
                      {t}
                    </Typography>
                  ))}
                </Box>
              </Box>

              {/* Room rows */}
              {ROOMS.map((room: string) => {
                const roomEvents = visibleEvents.filter((e: { room: string }) => e.room === room);
                return (
                  <Box
                    key={room}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "110px 1fr",
                      borderBottom: "1px solid var(--border)",
                      minHeight: 68,
                      "&:hover": { background: "var(--primary-tint)" },
                    }}
                  >
                    <Box sx={{
                      px: 2, display: "flex", alignItems: "center",
                      borderRight: "1px solid var(--border)",
                    }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
                        {room}
                      </Typography>
                    </Box>
                    <Box sx={{ position: "relative", minHeight: 68 }}>
                      {/* Grid lines */}
                      {TIME_LABELS.map((t, i) => (
                        <Box key={t} sx={{
                          position: "absolute",
                          left: `${(i / (TIME_LABELS.length - 1)) * 100}%`,
                          top: 0, bottom: 0,
                          borderLeft: "1px solid var(--border)",
                        }} />
                      ))}
                      {/* Events */}
                      {roomEvents.map((ev: { id: string; groupName: string; courseName: string; teacher: string; dateRange: string; start: number; duration: number; color: string; tag?: string; tagColor?: string; students?: number; maxStudents?: number }) => {
                        const startOff = ev.start - TIME_START;
                        return (
                          <Tooltip
                            key={ev.id}
                            title={`${ev.groupName} · ${ev.courseName} · ${ev.teacher} · ${ev.dateRange}`}
                            placement="top"
                            arrow
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                left: pct(startOff),
                                width: pct(ev.duration),
                                top: 8, bottom: 8,
                                backgroundColor: ev.color,
                                borderRadius: "8px",
                                px: 1, py: 0.5,
                                overflow: "hidden",
                                cursor: "pointer",
                                transition: "filter 0.15s",
                                "&:hover": { filter: "brightness(0.9)" },
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                                {ev.tag && (
                                  <Box sx={{
                                    background: ev.tagColor, borderRadius: "3px",
                                    px: 0.6, fontSize: 9, fontWeight: 700,
                                    color: "#fff", lineHeight: 1.5,
                                  }}>
                                    {ev.tag}
                                  </Box>
                                )}
                                <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                                  {ev.groupName}
                                </Typography>
                              </Box>
                              <Typography sx={{ fontSize: 9, color: "rgba(255,255,255,0.9)", lineHeight: 1.3 }}>
                                {ev.courseName}
                              </Typography>
                              {ev.dateRange && (
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.3 }}>
                                  <Typography sx={{ fontSize: 9, color: "rgba(255,255,255,0.8)" }}>
                                    {ev.dateRange}
                                  </Typography>
                                  {(ev.students ?? 0) > 0 && (
                                    <Box sx={{
                                      background: "rgba(0,0,0,0.2)", borderRadius: "3px",
                                      px: 0.6, fontSize: 9, color: "#fff", fontWeight: 700,
                                    }}>
                                      {ev.students ?? 0} st./{ev.maxStudents}
                                    </Box>
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ── VERTICAL layout ── */}
        {orientation === "vertical" && (
          <Box sx={{ overflowX: "auto" }}>
            <Box sx={{ minWidth: 900 }}>
              {/* Column headers = rooms */}
              <Box sx={{
                display: "grid",
                gridTemplateColumns: `80px repeat(${ROOMS.length}, 1fr)`,
                borderBottom: "1px solid var(--border)",
                background: "var(--surface-2)",
                position: "sticky", top: 0, zIndex: 2,
              }}>
                <Box sx={{ borderRight: "1px solid var(--border)", py: 1 }} />
                {ROOMS.map((r: string) => (
                  <Box key={r} sx={{
                    py: 1, px: 1,
                    borderRight: "1px solid var(--border)",
                    textAlign: "center",
                  }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{r}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Time rows */}
              {TIME_LABELS.map((timeLabel, tIdx) => {
                // For each time slot row, find events that START in this 30-min window
                const slotStart = TIME_START + tIdx * 30;
                const slotEnd   = slotStart + 30;

                return (
                  <Box
                    key={timeLabel}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: `80px repeat(${ROOMS.length}, 1fr)`,
                      borderBottom: "1px solid var(--border)",
                      minHeight: 48,
                    }}
                  >
                    {/* Time label */}
                    <Box sx={{
                      px: 1.5,
                      display: "flex", alignItems: "flex-start", pt: 1,
                      borderRight: "1px solid var(--border)",
                    }}>
                      <Typography sx={{
                        fontSize: 10, fontWeight: 500,
                        color: (timeLabel === "10:30" || timeLabel === "11:00") ? "var(--primary)" : "var(--muted)",
                        whiteSpace: "nowrap",
                      }}>
                        {timeLabel}
                      </Typography>
                    </Box>

                    {/* Room cells */}
                    {ROOMS.map((room ) => {
                      const cellEvents = visibleEvents.filter(
                        (e) => e.room === room && e.start >= slotStart && e.start < slotEnd,
                      );
                      // Also check spanning events
                      const spanningEvents = visibleEvents.filter(
                        (e) =>
                          e.room === room &&
                          e.start < slotStart &&
                          e.start + e.duration > slotStart,
                      );
                      // const allCellEvents = [...cellEvents, ...spanningEvents];

                      return (
                        <Box
                          key={room}
                          sx={{
                            borderRight: "1px solid var(--border)",
                            p: 0.5, minHeight: 48,
                            background: tIdx % 2 === 0 ? "var(--surface)" : "var(--surface-2)",
                          }}
                        >
                          {cellEvents.map((ev) => (
                            <Tooltip
                              key={ev.id}
                              title={`${ev.groupName} · ${ev.courseName} · ${ev.teacher}`}
                              placement="top" arrow
                            >
                              <Box
                                sx={{
                                  backgroundColor: ev.color,
                                  borderRadius: "6px",
                                  px: 1, py: 0.5,
                                  mb: 0.5,
                                  cursor: "pointer",
                                  transition: "filter 0.15s",
                                  "&:hover": { filter: "brightness(0.9)" },
                                  // span multiple rows via minHeight proportional to duration
                                  minHeight: Math.max(40, (ev.duration / 30) * 48 - 4),
                                }}
                              >
                                {ev.tag && (
                                  <Box sx={{
                                    background: ev.tagColor, borderRadius: "3px",
                                    px: 0.5, mb: 0.25, display: "inline-block",
                                    fontSize: 8, fontWeight: 700, color: "#fff",
                                  }}>
                                    {ev.tag}
                                  </Box>
                                )}
                                <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                                  {ev.groupName}
                                </Typography>
                                <Typography sx={{ fontSize: 8, color: "rgba(255,255,255,0.85)", lineHeight: 1.2 }}>
                                  {ev.courseName}
                                </Typography>
                                {ev.students > 0 && (
                                  <Typography sx={{ fontSize: 8, color: "rgba(255,255,255,0.8)", mt: 0.25 }}>
                                    {ev.students}/{ev.maxStudents} st.
                                  </Typography>
                                )}
                              </Box>
                            </Tooltip>
                          ))}
                          {/* Continuing event indicator */}
                          {spanningEvents.length > 0 && cellEvents.length === 0 && (
                            <Box sx={{
                              background: spanningEvents[0].color,
                              opacity: 0.3,
                              borderRadius: "4px",
                              height: 40,
                            }} />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Empty state */}
        {!loading && visibleEvents.length === 0 && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={{ color: "var(--muted)", fontSize: 14 }}>
              Bu kun turi uchun jadval yo'q. Guruhlarga xona biriktiring (Groups → Edit).
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;