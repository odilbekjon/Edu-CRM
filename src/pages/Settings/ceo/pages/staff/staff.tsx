// src/pages/Staff.tsx

import { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Drawer,
  TextField,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  IconButton,
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  MdOutlineEmail,
  MdDeleteOutline,
  MdClose,
  MdCloudUpload,
  MdCalendarToday,
} from "react-icons/md";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { usersApi, formatPhone, type Role } from "../../../../../api";
import { useData } from "../../../../../Context/DataContext";
import { useAuth } from "../../../../../Context/AuthContext";
import { SendSmsModal } from "../../../../../components/SendSmsModal";

// ---------- Types ----------
interface StaffMember {
  id: number;
  name: string;
  roles: string[];
  jobTitle: string;
  phone: string;
}

// Backend rollari <-> ekrandagi nomlar
const ROLE_LABEL: Record<Role, string> = {
  ceo: "CEO", admin: "Administrator", manager: "Manager", accountant: "Cashier", teacher: "Teacher",
};
const LABEL_TO_ROLE: Record<string, Role> = {
  "CEO": "ceo",
  "Branch Director": "admin",
  "Administrator": "admin",
  "Administrator2": "manager",
  "Limited Administrator": "manager",
  "Teacher": "teacher",
  "Marketer": "manager",
  "Cashier": "accountant",
};

// ---------- Constants ----------
const rolesList = [
  "CEO",
  "Branch Director",
  "Administrator",
  "Administrator2",
  "Limited Administrator",
  "Teacher",
  "Marketer",
  "Cashier",
];

interface NewStaffForm {
  name: string;
  phone: string;
  password: string;
  jobTitle: string;
  roles: string[];
  dateOfBirth: string;
  gender: string;
  photo: string;
}

const defaultForm: NewStaffForm = {
  name: "",
  phone: "",
  password: "",
  jobTitle: "",
  roles: [],
  dateOfBirth: "",
  gender: "",
  photo: "",
};

// ---------- Component ----------
export const Staff = () => {
  const { staff: apiStaff, mutate, branches } = useData();
  const { user: me } = useAuth();
  const staff: StaffMember[] = apiStaff.map((u) => ({
    id: u.id,
    name: u.fullName,
    roles: [ROLE_LABEL[u.role]],
    jobTitle: u.branch?.name ?? "",
    phone: formatPhone(u.phone),
  }));
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<NewStaffForm>(defaultForm);
  const [showPassword, setShowPassword] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SMS modal state
  const [smsOpen, setSmsOpen] = useState(false);
  const [, setSmsMember] = useState<StaffMember | null>(null);

  // ---------- Handlers ----------
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bu xodimni o'chirasizmi?")) return;
    await mutate(() => usersApi.remove(id), "Xodim o'chirildi");
  };

  // Backendda bitta xodim — bitta rol
  const handleRoleToggle = (role: string) => {
    setForm((prev) => ({ ...prev, roles: prev.roles.includes(role) ? [] : [role] }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || form.roles.length === 0) return;
    setSaving(true);
    const ok = await mutate(
      () =>
        usersApi.create({
          fullName: form.name.trim(),
          phone: form.phone,
          ...(form.password && { password: form.password }),
          role: LABEL_TO_ROLE[form.roles[0]] ?? "manager",
          ...(form.dateOfBirth && { dob: form.dateOfBirth }),
          ...(form.gender && { gender: form.gender === "female" ? "Female" : "Male" }),
          ...(branches[0] && { branchId: branches[0].id }),
        }),
      "Xodim qo'shildi",
    );
    setSaving(false);
    if (ok) {
      setForm(defaultForm);
      setFileName("");
      setDrawerOpen(false);
    }
  };

  const handleOpenSms = (member: StaffMember) => {
    setSmsMember(member);
    setSmsOpen(true);
  };

  return (
    <Box sx={{ p: 3, bgcolor: "transparent", minHeight: "100%" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={500}>
          Staff
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={() => setDrawerOpen(true)}
            sx={{
              bgcolor: "var(--primary)",
              borderRadius: 5,
              px: 3,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 1,
              "&:hover": { bgcolor: "var(--primary)" },
            }}
          >
            ADD NEW
          </Button>
          <Button
            variant="outlined"
            startIcon={<MdCloudUpload />}
            sx={{
              borderRadius: 5,
              px: 2.5,
              fontSize: 13,
              textTransform: "none",
              borderColor: "var(--border-strong)",
              color: "var(--text)",
              "&:hover": { borderColor: "#aaa" },
            }}
          >
            Import
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              {["id", "Name", "Role", "Branch", "Phone", "Actions"].map((col) => (
                <TableCell
                  key={col}
                  align={col === "Actions" ? "right" : "left"}
                  sx={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--text)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id} sx={{ "&:hover": { bgcolor: "var(--surface-2)" } }}>
                <TableCell sx={{ fontSize: 13, color: "var(--text)", verticalAlign: "top", pt: 2 }}>
                  {member.id}
                </TableCell>
                <TableCell sx={{ fontSize: 14, verticalAlign: "top", pt: 2 }}>
                  {member.name}
                </TableCell>
                <TableCell sx={{ verticalAlign: "top", pt: 2 }}>
                  {member.roles.map((role) => (
                    <Typography key={role} fontSize={13} color="var(--text)" lineHeight={1.8}>
                      {role}
                    </Typography>
                  ))}
                </TableCell>
                <TableCell sx={{ fontSize: 13, color: "var(--text)", verticalAlign: "top", pt: 2 }}>
                  {member.jobTitle}
                </TableCell>
                <TableCell sx={{ fontSize: 13, verticalAlign: "top", pt: 2 }}>
                  {member.phone}
                </TableCell>
                <TableCell align="right" sx={{ verticalAlign: "top", pt: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                    {/* SMS button */}
                    <IconButton
                      size="small"
                      sx={{ color: "#f0a500" }}
                      onClick={() => handleOpenSms(member)}
                    >
                      <MdOutlineEmail size={20} />
                    </IconButton>
                    {/* O'zingizni va CEO ni o'chirib bo'lmaydi */}
                    {me?.role !== "teacher" && member.id !== me?.id && !member.roles.includes("CEO") && (
                      <IconButton
                        size="small"
                        sx={{ color: "#e53935" }}
                        onClick={() => handleDelete(member.id)}
                      >
                        <MdDeleteOutline size={20} />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add New Staff Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 380, p: 0 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2.5 }}>
          <Typography fontWeight={600} fontSize={17}>
            Add New Staff
          </Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}>
            <MdClose size={20} />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ px: 3, py: 2, overflowY: "auto", flex: 1 }}>
          {/* Name */}
          <Box mb={2}>
            <Typography fontSize={13} mb={0.5}>Name</Typography>
            <TextField
              fullWidth size="small"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </Box>

          {/* Phone */}
          <Box mb={2}>
            <Typography fontSize={13} mb={0.5}>Phone</Typography>
            <Box sx={{ display: "flex" }}>
              <Box
                sx={{
                  border: "1px solid var(--border-strong)",
                  borderRight: "none",
                  borderRadius: "4px 0 0 4px",
                  px: 1.5,
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "var(--surface)",
                  fontSize: 13,
                  color: "var(--text)",
                  whiteSpace: "nowrap",
                }}
              >
                +998
              </Box>
              <TextField
                fullWidth size="small"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "0 4px 4px 0",
                    bgcolor: "var(--primary-tint)",
                  },
                }}
              />
            </Box>
          </Box>

          {/* Password */}
          <Box mb={2}>
            <Typography fontSize={13} mb={0.5}>Password</Typography>
            <TextField
              fullWidth size="small"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "var(--primary-tint)" } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? <HiEye size={18} /> : <HiEyeOff size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Job title */}
          <Box mb={2}>
            <Typography fontSize={13} mb={0.5}>Job title</Typography>
            <TextField
              fullWidth size="small"
              value={form.jobTitle}
              onChange={(e) => setForm((p) => ({ ...p, jobTitle: e.target.value }))}
            />
          </Box>

          {/* Role */}
          <Box mb={2}>
            <Typography fontSize={13} mb={0.5}>Role</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap" }}>
              {rolesList.map((role) => (
                <FormControlLabel
                  key={role}
                  control={
                    <Checkbox
                      size="small"
                      checked={form.roles.includes(role)}
                      onChange={() => handleRoleToggle(role)}
                      sx={{ py: 0.3 }}
                    />
                  }
                  label={<Typography fontSize={13}>{role}</Typography>}
                  sx={{ width: "50%", m: 0 }}
                />
              ))}
            </Box>
          </Box>

          {/* Date of birth */}
          <Box mb={2}>
            <Typography fontSize={13} mb={0.5}>Date of birth</Typography>
            <TextField
              fullWidth size="small"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MdCalendarToday size={16} color="var(--muted)" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": { bgcolor: "var(--surface-2)" },
                "& input::-webkit-calendar-picker-indicator": { opacity: 0, width: 0 },
              }}
            />
          </Box>

          {/* Gender */}
          <Box mb={2}>
            <Typography fontSize={13} mb={0.5}>Gender</Typography>
            <RadioGroup
              row
              value={form.gender}
              onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
            >
              <FormControlLabel value="male" control={<Radio size="small" />} label={<Typography fontSize={13}>Male</Typography>} />
              <FormControlLabel value="female" control={<Radio size="small" />} label={<Typography fontSize={13}>Female</Typography>} />
            </RadioGroup>
          </Box>

          {/* Photo */}
          <Box mb={3}>
            <Typography fontSize={13} mb={0.5}>Photo</Typography>
            <Box sx={{ display: "flex" }}>
              <Box
                sx={{
                  flex: 1,
                  border: "1px solid var(--border-strong)",
                  borderRight: "none",
                  borderRadius: "4px 0 0 4px",
                  px: 1.5,
                  py: 0.8,
                  fontSize: 13,
                  color: fileName ? "var(--text)" : "var(--muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  bgcolor: "var(--surface)",
                }}
              >
                {fileName || "No file chosen"}
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  borderRadius: "0 4px 4px 0",
                  textTransform: "none",
                  fontSize: 13,
                  px: 2,
                  borderColor: "var(--border-strong)",
                  color: "var(--text)",
                  minWidth: 85,
                }}
              >
                Browse
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files?.[0]) setFileName(e.target.files[0].name);
                }}
              />
            </Box>
          </Box>

          {/* Submit */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            sx={{
              bgcolor: "var(--primary)",
              borderRadius: 5,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 15,
              py: 1,
              "&:hover": { bgcolor: "var(--primary-dark)" },
            }}
          >
            Submit
          </Button>
        </Box>
      </Drawer>

      {/* SMS Modal — reusable */}
      <SendSmsModal
        open={smsOpen}
        onClose={() => { setSmsOpen(false); setSmsMember(null); }}
        selectedCount={1}
        recipientLabel="staff"
        sender="3700"
      />
    </Box>
  );
};