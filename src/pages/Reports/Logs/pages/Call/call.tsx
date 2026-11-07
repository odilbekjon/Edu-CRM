import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  OutlinedInput,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { BsCalendar3 } from "react-icons/bs";

const columns = ["Type", "Play", "Time", "Who", "To whom", "Gateway", "Call", "Duration", "Result"];

export const Call = () => {
  const [date, setDate] = useState("07.05.2026");
  const [filter, setFilter] = useState("All");

  return (
    <Box sx={{ minHeight: "100%", bgcolor: "transparent", p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 500, mb: 3, color: "var(--ink)" }}>
        Call log
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {/* Date input */}
        <OutlinedInput
          value={date}
          onChange={(e) => setDate(e.target.value)}
          startAdornment={<BsCalendar3 size={14} color="var(--muted)" style={{ marginRight: 8 }} />}
          sx={{
            bgcolor: "var(--surface)",
            fontSize: "0.875rem",
            height: 40,
            width: 200,
            borderRadius: 1,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
          }}
        />

        {/* Select */}
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          input={<OutlinedInput />}
          sx={{
            bgcolor: "var(--surface)",
            fontSize: "0.875rem",
            height: 40,
            width: 200,
            borderRadius: 1,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
          }}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Incoming">Incoming</MenuItem>
          <MenuItem value="Outgoing">Outgoing</MenuItem>
          <MenuItem value="Missed">Missed</MenuItem>
        </Select>
      </Box>

      {/* Table */}
      <Paper elevation={0} sx={{ border: "1px solid var(--border)", borderRadius: 1, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "var(--ink)",
                    borderBottom: "1px solid var(--border)",
                    py: 2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ textAlign: "center", py: 4, border: "none" }}>
                <Typography variant="body2" color="text.secondary">
                  No data to display
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};