import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  Avatar,
  AvatarGroup,
  Button,
} from "@mui/material";
import { FiCircle, FiUser } from "react-icons/fi";

interface LogItem {
  id: number;
  name: string;
  action: string;
  phone: string;
  datetime: string;
}

const logs: LogItem[] = [
  { id: 1, name: "Sadbarg Raxmonova", action: "Student attendance indicated", phone: "(94) 469-29-28", datetime: "14.05.2026 13:49" },
  { id: 2, name: "Sadbarg Raxmonova", action: "Student attendance indicated", phone: "(94) 469-29-28", datetime: "14.05.2026 13:49" },
  { id: 3, name: "Ugilbeka Abdullaeva", action: "User Authed", phone: "(97) 921-97-09", datetime: "14.05.2026 13:49" },
  { id: 4, name: "Sadbarg Raxmonova", action: "Student attendance indicated", phone: "(94) 469-29-28", datetime: "14.05.2026 13:49" },
  { id: 5, name: "Sadbarg Raxmonova", action: "Student attendance indicated", phone: "(94) 469-29-28", datetime: "14.05.2026 13:49" },
  { id: 6, name: "Sadbarg Raxmonova", action: "Student attendance indicated", phone: "(94) 469-29-28", datetime: "14.05.2026 13:49" },
  { id: 7, name: "Sadbarg Raxmonova", action: "Student attendance indicated", phone: "(94) 469-29-28", datetime: "14.05.2026 13:49" },
  { id: 8, name: "Sadbarg Raxmonova", action: "Student attendance indicated", phone: "(94) 469-29-28", datetime: "14.05.2026 13:49" },
  { id: 9, name: "Sadbarg Raxmonova", action: "Student attendance indicated", phone: "(94) 469-29-28", datetime: "14.05.2026 13:49" },
  { id: 10, name: "Sadbarg Raxmonova", action: "Student attendance indicated", phone: "(94) 469-29-28", datetime: "14.05.2026 13:49" },
];

const avatarUsers = ["OS", "AE", "TJ", "UA", "Mun"];

const filterButtons = ["User", "Course", "Group", "Room", "Payment", "Staff", "Rest"];

export const Log = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (label: string) => {
    setActiveFilters((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  };

  return (
    <Box sx={{ m:5, display: "flex", minHeight: "100%", bgcolor: "transparent" }}>
      {/* Left: Logs list */}
      <Box sx={{ flex: 1, p: 3, borderRight: "1px solid var(--border)", bgcolor: "var(--surface)" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 500, color: "var(--ink)" }}>
            Logs
          </Typography>
          <AvatarGroup
            max={6}
            sx={{
              "& .MuiAvatar-root": {
                width: 34,
                height: 34,
                fontSize: "0.68rem",
                bgcolor: "var(--border)",
                color: "var(--text)",
                border: "2px solid #fff",
              },
            }}
          >
            {avatarUsers.map((u) => (
              <Avatar key={u}>{u}</Avatar>
            ))}
          </AvatarGroup>
        </Box>

        <Divider />

        {logs.map((log, index) => (
          <Box key={log.id}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1.5 }}>
              {/* Circle icon */}
              <Box sx={{ mt: 0.4, flexShrink: 0 }}>
                <FiCircle size={18} color="var(--muted)" />
              </Box>

              {/* Name chip + action */}
              <Box sx={{ flex: "0 0 200px" }}>
                <Chip
                  label={log.name}
                  size="small"
                  sx={{
                    bgcolor: "var(--border)",
                    color: "var(--text)",
                    fontSize: "0.75rem",
                    height: 24,
                    borderRadius: "4px",
                    mb: 0.5,
                  }}
                />
                <Typography variant="body2" sx={{ color: "var(--text)", fontSize: "0.8rem" }}>
                  {log.action}
                </Typography>
              </Box>

              {/* User icon + name + phone */}
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 0.8 }}>
                <FiUser size={14} color="var(--muted)" />
                <Typography
                  variant="body2"
                  sx={{ color: "var(--primary)", fontSize: "0.85rem", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  {log.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--muted)", fontSize: "0.85rem" }}>·</Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "var(--primary)", fontSize: "0.85rem", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  {log.phone}
                </Typography>
              </Box>

              {/* Date */}
              <Typography variant="body2" sx={{ color: "var(--text)", fontSize: "0.85rem", flexShrink: 0, whiteSpace: "nowrap" }}>
                {log.datetime}
              </Typography>
            </Box>
            {index < logs.length - 1 && <Divider />}
          </Box>
        ))}
      </Box>

      {/* Right: Status filter */}
      <Box sx={{ width: 280, p: 3, bgcolor: "var(--surface)", borderLeft: "1px solid var(--border)" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, color: "var(--ink)" }}>
          Status filter
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {filterButtons.map((btn) => {
            const isActive = activeFilters.includes(btn);
            return (
              <Button
                key={btn}
                variant="outlined"
                size="small"
                onClick={() => toggleFilter(btn)}
                startIcon={<span style={{ fontSize: 10 }}>↑</span>}
                sx={{
                  fontSize: "0.8rem",
                  textTransform: "none",
                  borderRadius: "20px",
                  px: 1.5,
                  py: 0.3,
                  borderColor: isActive ? "var(--primary)" : "#d0d0d0",
                  color: isActive ? "var(--primary)" : "#666",
                  bgcolor: isActive ? "var(--primary-tint)" : "transparent",
                  minWidth: "unset",
                  "&:hover": {
                    borderColor: "var(--primary)",
                    bgcolor: "var(--primary-tint)",
                    color: "var(--primary)",
                  },
                }}
              >
                {btn}
              </Button>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};