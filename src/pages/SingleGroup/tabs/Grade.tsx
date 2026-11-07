import {
  Avatar, Box, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Typography, TextField
} from "@mui/material";
import { useEffect, useState } from "react";
import { Student } from "../../../types/group";
import { gradesApi, errorMessage } from "../../../api";
import { useToast } from "../../../Context/ToastContext";

interface Props { students: Student[]; groupId: number }

export const Grade = ({ students, groupId }: Props) => {
  const { toast } = useToast();
  const [grades, setGrades] = useState<Record<number, string>>({});

  useEffect(() => {
    gradesApi
      .group(groupId)
      .then((rows) => setGrades(Object.fromEntries(rows.map((r) => [r.studentId, String(r.value)]))))
      .catch((e) => toast(errorMessage(e), "error"));
  }, [groupId, toast]);

  // Maydondan chiqqanda saqlanadi (0–100)
  const save = async (studentId: number) => {
    const raw = grades[studentId];
    if (raw === undefined || raw === "") return;
    const value = Math.min(100, Math.max(0, Number(raw)));
    try {
      await gradesApi.set({ groupId, studentId, value });
      setGrades((prev) => ({ ...prev, [studentId]: String(value) }));
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={2}>Grade</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Grade (0–100)</TableCell>
              <TableCell>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((s, i) => {
              const g = Number(grades[s.id] || 0);
              return (
                <TableRow key={s.id} hover>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 13 }}>{s.name[0]}</Avatar>
                      <Typography fontSize={14}>{s.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={grades[s.id] || ""}
                      onChange={(e) =>
                        setGrades((prev) => ({ ...prev, [s.id]: e.target.value }))
                      }
                      onBlur={() => save(s.id)}
                      inputProps={{ min: 0, max: 100 }}
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        px: 1.5, py: 0.5, borderRadius: 2, display: "inline-block",
                        fontSize: 12, fontWeight: 600,
                        bgcolor: g >= 80 ? "#e8f5e9" : g >= 60 ? "#fff8e1" : g > 0 ? "#ffebee" : "var(--surface-2)",
                        color: g >= 80 ? "#2e7d32" : g >= 60 ? "#f57f17" : g > 0 ? "#c62828" : "var(--muted)",
                      }}
                    >
                      {g >= 80 ? "Excellent" : g >= 60 ? "Good" : g > 0 ? "Fail" : "—"}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};