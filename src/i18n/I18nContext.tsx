/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translate, type Lang } from "./translate";

const KEY = "crm_lang";
export type { Lang };

// Provayderdan tashqarida (masalan, window.confirm matnlari uchun) ishlatiladigan joriy til
let currentLang: Lang = "uz";
export const tr = (text: string) => translate(text, currentLang);

interface Value {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Dastur kodidagi matnni joriy tilga o'giradi */
  t: (text: string) => string;
}

const I18nContext = createContext<Value | null>(null);

const initialLang = (): Lang => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "uz" || saved === "ru" || saved === "en") return saved;
  } catch {
    /* storage yopiq */
  }
  return "uz";
};

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"]);
const ATTRS = ["placeholder", "title", "aria-label", "alt"];

/** Tugun (yoki uning ichidagi hamma narsa) matnini tarjima qiladi */
function translateTree(node: Node, lang: Lang) {
  if (node.nodeType === Node.TEXT_NODE) {
    translateText(node as Text, lang);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as Element;
  if (SKIP_TAGS.has(el.tagName) || el.hasAttribute("data-no-translate")) return;
  translateAttrs(el, lang);
  el.childNodes.forEach((child) => translateTree(child, lang));
}

function translateText(node: Text, lang: Lang) {
  const parent = node.parentElement;
  if (!parent || SKIP_TAGS.has(parent.tagName) || parent.closest("[data-no-translate]")) return;
  const v = node.nodeValue;
  if (!v) return;
  const t = translate(v, lang);
  if (t !== v) node.nodeValue = t;
}

function translateAttrs(el: Element, lang: Lang) {
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (!v) continue;
    const t = translate(v, lang);
    if (t !== v) el.setAttribute(a, t);
  }
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(initialLang);
  currentLang = lang;

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* storage yopiq */
    }
  }, []);

  // Til o'zgarganda butun sahifa qayta tarjima qilinadi, keyin yangi/o'zgargan tugunlar kuzatiladi
  useEffect(() => {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.title = translate("Young Adults CRM", lang);
    translateTree(document.body, lang);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => translateTree(n, lang));
        } else if (m.type === "characterData") {
          translateText(m.target as Text, lang);
        } else if (m.type === "attributes") {
          translateAttrs(m.target as Element, lang);
        }
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS,
    });
    return () => observer.disconnect();
  }, [lang]);

  const t = useCallback((text: string) => translate(text, lang), [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
};
