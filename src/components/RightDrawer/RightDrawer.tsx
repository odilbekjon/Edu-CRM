import { useEffect, type ReactNode } from "react";
import { MdClose } from "react-icons/md";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  width?: number;
  children: ReactNode;
}

/**
 * O'ng tomondan chiqadigan panel. Yopiq holatda butunlay yashiriladi (soya ham ko'rinmaydi),
 * Esc bosilganda va fonga bosilganda yopiladi.
 */
export const RightDrawer = ({ open, onClose, title, width = 460, children }: Props) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)",
          zIndex: 1200, opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden",
          transition: `opacity 0.25s, visibility 0s linear ${open ? "0s" : "0.25s"}`,
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!open}
        style={{
          position: "fixed", top: 0, right: 0, width: `min(${width}px, 100vw)`, height: "100vh",
          background: "var(--surface)", color: "var(--ink)", zIndex: 1300,
          boxShadow: open ? "-12px 0 40px rgba(15,23,42,0.18)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          visibility: open ? "visible" : "hidden",
          transition: `transform 0.28s cubic-bezier(.4,0,.2,1), visibility 0s linear ${open ? "0s" : "0.28s"}`,
          display: "flex", flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 24px", borderBottom: "1px solid var(--border)", flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{title}</span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              cursor: "pointer", color: "var(--muted)", display: "flex", border: "none",
              background: "none", padding: 6, borderRadius: 8,
            }}
          >
            <MdClose size={22} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>{children}</div>
      </aside>
    </>
  );
};
