import { useState } from "react";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { MdDarkMode, MdLightMode, MdTranslate } from "react-icons/md";
import { LANGS, useI18n } from "../../i18n";
import { useThemeMode } from "../../Context/ThemeModeContext";

/** Til tanlash menyusi (UZ / RU / EN) */
export const LangMenu = ({ compact = false }: { compact?: boolean }) => {
  const { lang, setLang, t } = useI18n();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const current = LANGS.find((l) => l.code === lang)!;

  return (
    <>
      <Tooltip title={t("Language")}>
        <button
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label={t("Language")}
          data-no-translate
          style={{
            height: 38, minWidth: compact ? 38 : 56, padding: "0 10px", border: "1px solid var(--border)", borderRadius: 10,
            background: "var(--surface)", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6, fontSize: 12.5, fontWeight: 700, flexShrink: 0,
          }}
        >
          <MdTranslate size={16} />
          {current.label}
        </button>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 150 } } }}
      >
        {LANGS.map((l) => (
          <MenuItem
            key={l.code}
            selected={l.code === lang}
            data-no-translate
            onClick={() => { setLang(l.code); setAnchor(null); }}
            sx={{ fontSize: 14, gap: 1.5 }}
          >
            <strong style={{ width: 24 }}>{l.label}</strong> {l.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

/** Dark / light rejim tugmasi */
export const ThemeToggle = () => {
  const { mode, toggle } = useThemeMode();
  const { t } = useI18n();
  return (
    <Tooltip title={t(mode === "dark" ? "Light mode" : "Dark mode")}>
      <IconButton
        onClick={toggle}
        aria-label="Toggle theme"
        sx={{ width: 38, height: 38, border: "1px solid var(--border)", borderRadius: "10px", bgcolor: "var(--surface)", color: "var(--muted)" }}
      >
        {mode === "dark" ? <MdLightMode size={19} /> : <MdDarkMode size={19} />}
      </IconButton>
    </Tooltip>
  );
};
