import { createTheme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

/** Dizayn tokenlari — src/index.css dagi CSS o'zgaruvchilar bilan bir xil bo'lishi kerak */
export const palettes = {
  light: {
    primary: "#3b5bdb",
    primaryDark: "#2f49b5",
    primaryTint: "#eef2ff",
    ink: "#0f172a",
    text: "#334155",
    muted: "#64748b",
    border: "#e6eaf2",
    bg: "#f5f7fb",
    surface: "#ffffff",
    surface2: "#f8fafc",
  },
  dark: {
    primary: "#5c7cfa",
    primaryDark: "#4263eb",
    primaryTint: "#1e2a4d",
    ink: "#e9edf5",
    text: "#c5ccdb",
    muted: "#8893a8",
    border: "#252f42",
    bg: "#0e121b",
    surface: "#151b27",
    surface2: "#1b2332",
  },
} as const;

const font = '"Inter", "Segoe UI", system-ui, -apple-system, Roboto, sans-serif';

export const createAppTheme = (mode: ThemeMode) => {
  const c = palettes[mode];
  const isDark = mode === "dark";
  return createTheme({
    palette: {
      mode,
      primary: { main: c.primary, dark: c.primaryDark, light: c.primaryTint, contrastText: "#fff" },
      secondary: { main: "#64748b" },
      error: { main: "#e5484d" },
      success: { main: "#16a34a" },
      warning: { main: "#f59e0b" },
      background: { default: c.bg, paper: c.surface },
      text: { primary: c.ink, secondary: c.muted },
      divider: c.border,
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: font,
      h5: { fontWeight: 700, letterSpacing: "-0.01em" },
      h6: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: { body: { backgroundColor: c.bg, color: c.ink } },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 10, fontWeight: 600 },
          contained: { "&:hover": { boxShadow: "0 4px 12px rgba(59,91,219,.25)" } },
        },
      },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 10 } } },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          rounded: { borderRadius: 14 },
          elevation1: {
            boxShadow: isDark
              ? "0 1px 2px rgba(0,0,0,.3), 0 4px 16px rgba(0,0,0,.25)"
              : "0 1px 2px rgba(16,24,40,.04), 0 4px 16px rgba(16,24,40,.05)",
          },
        },
      },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 18 } } },
      MuiDrawer: { styleOverrides: { paper: { borderRadius: 0 } } },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            border: `1px solid ${c.border}`,
            boxShadow: isDark ? "0 12px 32px rgba(0,0,0,.5)" : "0 12px 32px rgba(16,24,40,.12)",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: c.border },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#35425c" : "#cbd5e1" },
          },
        },
      },
      MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } } },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottomColor: c.border },
          head: { color: c.muted, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: ".04em" },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? "#2a3550" : "#0f172a",
            color: "#fff",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
          },
          arrow: { color: isDark ? "#2a3550" : "#0f172a" },
        },
      },
    },
  });
};
