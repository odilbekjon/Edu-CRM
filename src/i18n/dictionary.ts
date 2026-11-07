import { CORE } from "./dict/core";
import { PAGES } from "./dict/pages";
import { SETTINGS } from "./dict/settings";
import { EXTRA } from "./dict/extra";

/** [English, O'zbekcha, Русский] — butun ilova lug'ati */
export const ENTRIES: Array<[string, string, string]> = [...CORE, ...PAGES, ...SETTINGS, ...EXTRA];
