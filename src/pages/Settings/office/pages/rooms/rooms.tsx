import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Drawer,
  TextField,
  IconButton,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
} from "@mui/material";
import { MdClose, MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { catalogApi } from "../../../../../api";
import { useData } from "../../../../../Context/DataContext";

interface Room {
  id: number;
  name: string;
  capacity: number | null;
}

interface FormState {
  name: string;
  capacity: string;
}

const defaultForm: FormState = { name: "", capacity: "" };

export const Rooms = () => {
  const { rooms: apiRooms, branches, mutate } = useData();
  const rooms: Room[] = apiRooms.map((r) => ({ id: r.id, name: r.name, capacity: r.capacity }));
  const [branchId, setBranchId] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);

  const openAddDrawer = () => {
    setEditingRoom(null);
    setForm(defaultForm);
    setBranchId("");
    setDrawerOpen(true);
  };

  const openEditDrawer = (room: Room) => {
    setEditingRoom(room);
    setForm({ name: room.name, capacity: room.capacity !== null ? String(room.capacity) : "" });
    setBranchId(String(apiRooms.find((r) => r.id === room.id)?.branchId ?? ""));
    setDrawerOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bu xonani o'chirasizmi?")) return;
    await mutate(() => catalogApi.removeRoom(id), "Xona o'chirildi");
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      capacity: form.capacity.trim() ? parseInt(form.capacity) : 20,
      ...(branchId && { branchId: Number(branchId) }),
    };
    const ok = editingRoom
      ? await mutate(() => catalogApi.updateRoom(editingRoom.id, payload), "Xona yangilandi")
      : await mutate(() => catalogApi.createRoom(payload), "Xona qo'shildi");
    if (ok) {
      setForm(defaultForm);
      setDrawerOpen(false);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "transparent", minHeight: "100%" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={400}>
          Rooms
        </Typography>
        <Button
          variant="contained"
          onClick={openAddDrawer}
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
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "var(--surface-2)" }}>
              <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "var(--text)", width: "20%" }}>id</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "var(--text)", width: "40%" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 13, color: "var(--text)", width: "25%" }}>Room capacity</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: 13, color: "var(--text)", width: "15%" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id} sx={{ "&:hover": { bgcolor: "var(--surface-2)" } }}>
                <TableCell sx={{ fontSize: 13, color: "var(--text)" }}>{room.id}</TableCell>
                <TableCell sx={{ fontSize: 14 }}>{room.name}</TableCell>
                <TableCell sx={{ fontSize: 13, color: "var(--text)" }}>
                  {room.capacity !== null ? room.capacity : ""}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                    <IconButton size="small" onClick={() => openEditDrawer(room)} sx={{ color: "var(--text)" }}>
                      <MdOutlineEdit size={18} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(room.id)} sx={{ color: "#e53935" }}>
                      <MdDeleteOutline size={18} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 380, p: 0 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2.5 }}>
          <Typography fontWeight={600} fontSize={17}>
            {editingRoom ? "Edit room" : "Add new room"}
          </Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}>
            <MdClose size={20} />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ px: 3, py: 3 }}>
          <Box mb={2.5}>
            <Typography fontSize={13} mb={0.8}>Name</Typography>
            <TextField
              fullWidth
              size="small"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "var(--surface)" } }}
            />
          </Box>

          <Box mb={2.5}>
            <Typography fontSize={13} mb={0.8}>Branch</Typography>
            <TextField
              select fullWidth size="small" value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              SelectProps={{ displayEmpty: true }}
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "var(--surface)" } }}
            >
              <MenuItem value=""><em>No branch</em></MenuItem>
              {branches.map((b) => <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>)}
            </TextField>
          </Box>

          <Box mb={3}>
            <Typography fontSize={13} mb={0.8}>Room capacity</Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={form.capacity}
              onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
              inputProps={{ min: 0 }}
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "var(--surface)" } }}
            />
          </Box>

          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              bgcolor: "#5b7fa6",
              borderRadius: 5,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 15,
              "&:hover": { bgcolor: "#4a6d92" },
            }}
          >
            Submit
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};