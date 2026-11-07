import { useState } from "react";
import {
  Box, Typography, Avatar, Chip, Modal, TextField, Button, IconButton, Paper,
} from "@mui/material";
import { FiEdit2, FiLock } from "react-icons/fi";
import { authApi, errorMessage, formatPhone } from "../../api";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 440,
  maxWidth: "92vw",
  bgcolor: "background.paper",
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
};

const ROLE_LABEL: Record<string, string> = {
  ceo: "CEO", admin: "Administrator", manager: "Manager", accountant: "Cashier", teacher: "Teacher",
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ mb: 2 }}>
    <Typography sx={{ color: "var(--muted)", fontSize: 12.5, fontWeight: 500, mb: 0.25 }}>{label}</Typography>
    <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{value || "—"}</Typography>
  </Box>
);

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ fullName: "", email: "", telegram: "" });
  const [pass, setPass] = useState({ current: "", next: "", repeat: "" });

  if (!user) return null;

  const openEdit = () => {
    setForm({ fullName: user.fullName, email: user.email ?? "", telegram: user.telegram ?? "" });
    setEditOpen(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { user: updated } = await authApi.updateMe({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        telegram: form.telegram.trim(),
      });
      setUser(updated);
      toast("Profil yangilandi", "success");
      setEditOpen(false);
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (pass.next !== pass.repeat) {
      toast("Yangi parollar mos kelmadi", "warning");
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword(pass.current, pass.next);
      toast("Parol o'zgartirildi", "success");
      setPass({ current: "", next: "", repeat: "" });
      setPassOpen(false);
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: "100%" }}>
      <Typography variant="h5" sx={{ mb: 2.5 }}>My profile</Typography>

      <Paper elevation={0} sx={{ maxWidth: 520, p: 3.5, border: "1px solid var(--border)", borderRadius: "18px", position: "relative" }}>
        <Box sx={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 1 }}>
          <IconButton onClick={() => setPassOpen(true)} title="Change password" sx={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
            <FiLock size={16} />
          </IconButton>
          <IconButton onClick={openEdit} title="Edit" sx={{ border: "1px solid var(--border)", color: "var(--primary)" }}>
            <FiEdit2 size={16} />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: "var(--primary)", fontSize: 28, fontWeight: 700 }}>
            {user.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6">{user.fullName}</Typography>
            <Chip
              label={ROLE_LABEL[user.role] ?? user.role}
              size="small"
              sx={{ mt: 0.5, bgcolor: "var(--primary-tint)", color: "var(--primary)", fontWeight: 600 }}
            />
          </Box>
        </Box>

        <Field label="Phone" value={`+998 ${formatPhone(user.phone)}`} />
        <Field label="Email" value={user.email ?? ""} />
        <Field label="Telegram" value={user.telegram ?? ""} />
        <Field label="Branch" value={user.branch?.name ?? ""} />
        <Field label="ID" value={user.uid} />
      </Paper>

      {/* Edit */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>Edit profile</Typography>
          <TextField fullWidth label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} margin="normal" size="small" />
          <TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} margin="normal" size="small" />
          <TextField fullWidth label="Telegram" value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} margin="normal" size="small" />
          <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
            <Button variant="outlined" fullWidth onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="contained" fullWidth onClick={saveProfile} disabled={saving || form.fullName.trim().length < 2}>Save</Button>
          </Box>
        </Box>
      </Modal>

      {/* Password */}
      <Modal open={passOpen} onClose={() => setPassOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>Change password</Typography>
          <TextField fullWidth type="password" label="Current password" value={pass.current} onChange={(e) => setPass({ ...pass, current: e.target.value })} margin="normal" size="small" />
          <TextField fullWidth type="password" label="New password (min 8)" value={pass.next} onChange={(e) => setPass({ ...pass, next: e.target.value })} margin="normal" size="small" />
          <TextField fullWidth type="password" label="Repeat new password" value={pass.repeat} onChange={(e) => setPass({ ...pass, repeat: e.target.value })} margin="normal" size="small" />
          <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
            <Button variant="outlined" fullWidth onClick={() => setPassOpen(false)}>Cancel</Button>
            <Button variant="contained" fullWidth onClick={savePassword} disabled={saving || pass.next.length < 8 || !pass.current}>Update</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ProfilePage;
