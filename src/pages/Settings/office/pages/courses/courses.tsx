import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Drawer,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Paper,
} from "@mui/material";
import { MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { catalogApi, toCourse } from "../../../../../api";
import { useData } from "../../../../../Context/DataContext";

const lessonDurations = [
  "45 minutes",
  "60 minutes",
  "90 minutes",
  "120 minutes",
  "150 minutes",
];

const cardColors = [
  "#f46b8a", "#8bc34a", "#80cbc4", "var(--primary)",
  "#f48fb1", "#ff8a65", "#ce93d8", "#90caf9",
  "#a5d6a7", "#ffcc80", "#ef9a9a", "#80deea",
];

export const BookIllustration = () => (
  <svg viewBox="0 0 160 100" width="100%" height="100%" style={{ position: "absolute", bottom: 0, left: 0, opacity: 0.55, transform: "translateY(24%)" }}>
    <rect x="28" y="55" width="52" height="10" rx="2" fill="#fff" opacity="0.9" />
    <rect x="30" y="46" width="48" height="10" rx="2" fill="#e91e63" opacity="0.85" />
    <rect x="26" y="38" width="54" height="10" rx="2" fill="#fff" opacity="0.9" />
    <rect x="32" y="30" width="44" height="9" rx="2" fill="var(--primary-dark)" opacity="0.85" />
    <rect x="70" y="20" width="7" height="50" rx="2" fill="#ffb300" opacity="0.9" transform="rotate(-10 74 45)" />
    <polygon points="70,68 77,68 73.5,78" fill="#ff7043" opacity="0.9" transform="rotate(-10 74 45)" />
    <ellipse cx="105" cy="55" rx="18" ry="28" fill="#fff" opacity="0.15" transform="rotate(-15 105 55)" />
    <ellipse cx="118" cy="48" rx="14" ry="22" fill="#fff" opacity="0.12" transform="rotate(10 118 48)" />
    <rect x="18" y="60" width="38" height="28" rx="3" fill="#ffb300" opacity="0.85" />
    <rect x="18" y="55" width="20" height="8" rx="2" fill="#ffa000" opacity="0.85" />
  </svg>
);

interface NewItemForm {
  name: string;
  codeCourse: string;
  lessonDuration: string;
  courseDuration: string;
  price: string;
  description: string;
}

const defaultForm: NewItemForm = {
  name: "",
  codeCourse: "",
  lessonDuration: "90 minutes",
  courseDuration: "",
  price: "",
  description: "",
};

export const Courses = () => {
  const navigate = useNavigate();
  const { courses: apiCourses, mutate } = useData();
  const courses = apiCourses.map(toCourse);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<NewItemForm>(defaultForm);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const ok = await mutate(
      () =>
        catalogApi.createCourse({
          name: form.name.trim(),
          code: form.codeCourse || undefined,
          price: parseInt(form.price) || 0,
          color: cardColors[courses.length % cardColors.length],
          lessonDuration: form.lessonDuration,
          courseDuration: parseInt(form.courseDuration) || 6,
          description: form.description,
        }),
      "Kurs qo'shildi",
    );
    setSaving(false);
    if (ok) {
      setForm(defaultForm);
      setDrawerOpen(false);
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString("ru-RU").replace(/,/g, " ") + " UZS";

  return (
    <Box sx={{ p: 3, bgcolor: "transparent", minHeight: "100%" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="h5" fontWeight={400}>
          Courses
        </Typography>
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
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Course grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 2 }}>
        {courses.map((course) => (
          <Paper
            key={course.id}
            elevation={1}
            onClick={() => navigate(`/courses/${course.id}`)}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.15s, box-shadow 0.15s",
              "&:hover": { transform: "translateY(-3px)", boxShadow: 4 },
            }}
          >
            <Box
              sx={{
                bgcolor: course.color,
                height: 180,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
              }}
            >
              <Typography
                fontWeight={700}
                fontSize={18}
                color="#fff"
                sx={{ position: "relative", zIndex: 1, p: 2, textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
              >
                {course.name}
              </Typography>
              <BookIllustration />
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography fontWeight={500} fontSize={15} mb={1}>{course.name}</Typography>
              <Typography fontSize={13} color="var(--muted)">{fmt(course.price)}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Add New Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 400, p: 0 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2.5 }}>
          <Typography fontWeight={600} fontSize={17}>Add New Item</Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}>
            <MdClose size={20} />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ px: 3, py: 2.5, overflowY: "auto" }}>
          <Box mb={2}>
            <Typography fontSize={13} mb={0.5}>Name</Typography>
            <TextField fullWidth size="small" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </Box>
          <Box mb={2}>
            <Typography fontSize={13} mb={0.5}>Code Course</Typography>
            <TextField fullWidth size="small" value={form.codeCourse}
              onChange={(e) => setForm((p) => ({ ...p, codeCourse: e.target.value }))} />
          </Box>
          <Box mb={2}>
            <Typography fontSize={13} mb={0.5}>Lesson duration</Typography>
            <Select fullWidth size="small" value={form.lessonDuration}
              onChange={(e) => setForm((p) => ({ ...p, lessonDuration: e.target.value }))} sx={{ fontSize: 14 }}>
              {lessonDurations.map((d) => (
                <MenuItem key={d} value={d} sx={{ fontSize: 14 }}>{d}</MenuItem>
              ))}
            </Select>
          </Box>
          <Box mb={2}>
            <Typography fontSize={13} mb={0.5}>Course duration (month)</Typography>
            <TextField fullWidth size="small" type="number" value={form.courseDuration}
              onChange={(e) => setForm((p) => ({ ...p, courseDuration: e.target.value }))}
              inputProps={{ min: 1 }} />
          </Box>
          <Box mb={2}>
            <Typography fontSize={13} mb={0.5}>Price</Typography>
            <TextField fullWidth size="small" type="number" value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              inputProps={{ min: 0 }} />
          </Box>
          <Box mb={3}>
            <Typography fontSize={13} mb={0.5}>Description</Typography>
            <TextField fullWidth multiline rows={3} value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </Box>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.name.trim()}
            sx={{ bgcolor: "var(--primary)", borderRadius: 5, px: 3, textTransform: "none", fontWeight: 600, fontSize: 15, "&:hover": { bgcolor: "var(--primary)" } }}>
            Save
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};