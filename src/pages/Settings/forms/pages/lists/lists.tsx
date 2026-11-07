import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
//   Chip,
  Tooltip,
} from "@mui/material";
import { FiEdit2 } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { HiOutlineLink } from "react-icons/hi";
import { BsInfoCircle } from "react-icons/bs";
import { MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";

interface FormItem {
  id: number;
  name: string;
  type?: string;
  hasInfo?: boolean;
}

const initialForms: FormItem[] = [
  { id: 4932, name: "Tarix kursiga yozilish!", type: "lead" },
  { id: 4926, name: "Sun'iy Intelekt Kursiga Yozilish!", type: "lead" },
  { id: 4921, name: "Seminar Koreyada o'qishga ketish", hasInfo: true },
  { id: 4887, name: "General Leads", hasInfo: true },
  { id: 4871, name: "Ona Tili", type: "lead" },
];

export const Lists = () => {
  const [forms, setForms] = useState<FormItem[]>(initialForms);
  const navigate = useNavigate();

  const handleDelete = (id: number) => {
    setForms((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <Box
      sx={{
        
        backgroundColor: "var(--surface-2)",
      
        p: 3,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 780,
          borderRadius: 4,
          p: 4,
          backgroundColor: "var(--surface)",
          boxShadow: "0 2px 24px rgba(0,0,0,0.07)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "var(--ink)",
              letterSpacing: "-0.3px",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Forms
          </Typography>

          <Button
            variant="contained"
            startIcon={<MdAdd size={18} />}
            onClick={() => navigate("/settings/forms/create")}
            sx={{
              backgroundColor: "var(--primary)",
              borderRadius: "50px",
              px: 3,
              py: 1.2,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#163d58",
                boxShadow: "none",
              },
            }}
          >
            Add new
          </Button>
        </Box>

        {/* Divider */}
        <Box sx={{ borderBottom: "1px solid var(--border)", mb: 1 }} />

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "var(--ink)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.875rem",
                    border: "none",
                    pb: 1,
                    width: 90,
                  }}
                >
                  id
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "var(--ink)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.875rem",
                    border: "none",
                    pb: 1,
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "var(--ink)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.875rem",
                    border: "none",
                    pb: 1,
                    width: 100,
                  }}
                >
                  type
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    color: "var(--ink)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.875rem",
                    border: "none",
                    pb: 1,
                    width: 150,
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {forms.map((form, index) => (
                <TableRow
                  key={form.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "var(--surface)" : "var(--surface-2)",
                    "&:last-child td": { border: "none" },
                    "& td": {
                      border: "none",
                      py: 1.8,
                    },
                    borderRadius: 2,
                  }}
                >
                  <TableCell
                    sx={{
                      color: "var(--text)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.9rem",
                    }}
                  >
                    {form.id}
                  </TableCell>

                  <TableCell
                    sx={{
                      color: "var(--ink)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: 400,
                    }}
                  >
                    {form.name}
                  </TableCell>

                  <TableCell
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.85rem",
                      color: "var(--text)",
                    }}
                  >
                    {form.type || ""}
                  </TableCell>

                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 0.5,
                      }}
                    >
                      {form.hasInfo && (
                        <Tooltip title="Info">
                          <IconButton
                            size="small"
                            sx={{
                              color: "var(--primary)",
                              "&:hover": { backgroundColor: "var(--primary-tint)" },
                            }}
                          >
                            <BsInfoCircle size={18} />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Edit">
                        <IconButton
                        onClick={() => navigate(`/settings/forms/edit/${form.id}` )}

                          size="small"
                          sx={{
                            color: "#64b5f6",
                            "&:hover": { backgroundColor: "var(--primary-tint)" },
                          }}
                        >
                          <FiEdit2 size={17} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(form.id)}
                          sx={{
                            color: "#ef5350",
                            "&:hover": { backgroundColor: "#ffebee" },
                          }}
                        >
                          <RiDeleteBin6Line size={18} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Copy link">
                        <IconButton
                          size="small"
                          sx={{
                            color: "#ffb300",
                            "&:hover": { backgroundColor: "#fff8e1" },
                          }}
                        >
                          <HiOutlineLink size={19} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};