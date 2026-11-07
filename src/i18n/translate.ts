// Tarjima mexanizmi: lug'atdagi har bir yozuv — [en, uz, ru].
// Qidiruv har uchala tildagi matn bo'yicha ishlaydi, shuning uchun manba matn qaysi tilda yozilganidan qat'i nazar
// (kodda inglizcha ham, o'zbekcha ham uchraydi) istalgan tilga o'tkazish mumkin.

import { ENTRIES } from "./dictionary";

export type Lang = "uz" | "ru" | "en";
export const LANGS: Array<{ code: Lang; label: string; name: string }> = [
  { code: "uz", label: "UZ", name: "O'zbekcha" },
  { code: "ru", label: "RU", name: "Русский" },
  { code: "en", label: "EN", name: "English" },
];

const IDX: Record<Lang, number> = { en: 0, uz: 1, ru: 2 };

const collapse = (s: string) => s.replace(/\s+/g, " ").trim();

// Oddiy matnlar uchun jadval
const exact = new Map<string, string[]>();
// Katta-kichik harfga e'tibor bermasdan qidirish uchun (masalan, "ADD NEW" ↔ "Add New")
const exactLower = new Map<string, string[]>();
// Parametrli shablonlar ({0}, {1}) uchun
const patterns: Array<{ re: RegExp; entry: string[] }> = [];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

for (const entry of ENTRIES) {
  for (const variant of entry) {
    const key = collapse(variant);
    if (/\{\d\}/.test(key)) {
      const src = key
        .split(/(\{\d\})/)
        .map((part) => (/^\{\d\}$/.test(part) ? "(.+?)" : escapeRe(part)))
        .join("");
      patterns.push({ re: new RegExp(`^${src}$`), entry: entry as unknown as string[] });
      // placeholder tartibi (har bir variantda {0},{1} qaysi guruhga to'g'ri kelishini bilish uchun)
      (patterns[patterns.length - 1] as { order?: number[] }).order = [...key.matchAll(/\{(\d)\}/g)].map((m) => Number(m[1]));
    } else {
      exact.set(key, entry as unknown as string[]);
      exactLower.set(key.toLowerCase(), entry as unknown as string[]);
    }
  }
}

// Lug'atda yo'q matn ko'p uchraydi (ismlar, sonlar) — natijani eslab qolamiz
const cache = new Map<string, string>();

export function translate(text: string, lang: Lang): string {
  if (!text) return text;
  const lead = text.match(/^\s*/)![0];
  const trail = text.match(/\s*$/)![0];
  const core = collapse(text);
  if (!core || !/[A-Za-zА-Яа-яЁё]/.test(core)) return text;

  const ck = `${lang}|${core}`;
  let out = cache.get(ck);
  if (out === undefined) {
    out = lookup(core, lang);
    if (cache.size > 5000) cache.clear();
    cache.set(ck, out);
  }
  return out === core ? text : lead + out + trail;
}

// Oy nomlari: qisqa (jan..dec) va to'liq (january..december) — [uz qisqa, ru qisqa, uz to'liq, ru to'liq]
const MONTHS: Record<string, [string, string, string, string]> = {
  jan: ["yan", "янв", "yanvar", "январь"], feb: ["fev", "фев", "fevral", "февраль"], mar: ["mar", "мар", "mart", "март"],
  apr: ["apr", "апр", "aprel", "апрель"], may: ["may", "мая", "may", "май"], jun: ["iyn", "июн", "iyun", "июнь"],
  jul: ["iyl", "июл", "iyul", "июль"], aug: ["avg", "авг", "avgust", "август"], sep: ["sen", "сен", "sentyabr", "сентябрь"],
  oct: ["okt", "окт", "oktyabr", "октябрь"], nov: ["noy", "ноя", "noyabr", "ноябрь"], dec: ["dek", "дек", "dekabr", "декабрь"],
};
const FULL_TO_KEY: Record<string, string> = {
  january: "jan", february: "feb", march: "mar", april: "apr", may: "may", june: "jun",
  july: "jul", august: "aug", september: "sep", october: "oct", november: "nov", december: "dec",
};

/** "13 apr—13 aug", "Oct 26", "October 2026" kabi faqat raqam va oy nomlaridan iborat matnlar */
function translateDateLike(core: string, lang: Lang): string | null {
  if (lang === "en") return null;
  if (!/^[\d\s.,—–-]*[A-Za-z]{3,9}[\d\sA-Za-z.,—–-]*$/.test(core)) return null;
  let changed = false;
  const out = core.replace(/[A-Za-z]{3,9}/g, (w) => {
    const lw = w.toLowerCase();
    const full = FULL_TO_KEY[lw];
    const key = full ?? (MONTHS[lw] ? lw : null);
    if (!key) {
      changed = false;
      throw new Error("not-date");
    }
    changed = true;
    const m = MONTHS[key];
    const v = lang === "uz" ? (full ? m[2] : m[0]) : full ? m[3] : m[1];
    return w[0] === w[0].toUpperCase() ? v.charAt(0).toUpperCase() + v.slice(1) : v;
  });
  return changed ? out : null;
}

function lookup(core: string, lang: Lang): string {
  const hit = exact.get(core);
  if (hit) return hit[IDX[lang]];

  // Faqat harf kattaligi farq qiladigan holat: natijani ham shu uslubda qaytaramiz
  // Qisqa so'zlar (masalan, kurs nomi "SAT" ≠ "Sat") bilan adashmaslik uchun faqat 5+ belgili matnlarda
  const lowerHit = core.length >= 5 ? exactLower.get(core.toLowerCase()) : undefined;
  if (lowerHit) {
    const out = lowerHit[IDX[lang]];
    const isUpper = core === core.toUpperCase() && core !== core.toLowerCase();
    return isUpper ? out.toUpperCase() : out;
  }

  try {
    const d = translateDateLike(core, lang);
    if (d) return d;
  } catch {
    /* oy nomi bo'lmagan so'z uchradi — oddiy tarjima davom etadi */
  }

  for (const p of patterns) {
    const m = core.match(p.re);
    if (!m) continue;
    const order = (p as unknown as { order: number[] }).order;
    const vals: string[] = [];
    order.forEach((n, i) => (vals[n] = m[i + 1]));
    // Parametrlarning o'zi ham lug'atda bo'lishi mumkin (masalan, oy nomi)
    const filled = p.entry[IDX[lang]].replace(/\{(\d)\}/g, (_, n) => {
      const v = vals[Number(n)] ?? "";
      const t = exact.get(collapse(v));
      return t ? t[IDX[lang]] : v;
    });
    return filled;
  }
  return core;
}
