// CMS fetcher — build-időben (vagy SSR-ben) a foglaló app publikus
// /api/marketing/content és /api/marketing/pricing endpointjait olvassa.

const CMS_URL =
  (import.meta.env as Record<string, string | undefined>).PUBLIC_CMS_URL ||
  process.env.PUBLIC_CMS_URL ||
  "http://localhost:3001";

type ContentResponse = {
  ok: boolean;
  flat: Record<string, string>;
  grouped: Record<string, Record<string, string>>;
};

export type PricingPlan = {
  slug: string;
  name: string;
  tagline: string | null;
  monthlyPriceHuf: number | null;
  yearlyPriceHuf: number | null;
  currency: string;
  badge: string | null;
  highlighted: boolean;
  ctaLabel: string | null;
  ctaHref: string | null;
  features: Array<{ title?: string; included?: boolean; bold?: boolean }>;
  order: number;
};

let _content: ContentResponse | null = null;
let _plans: PricingPlan[] | null = null;

// Fallback értékek — ha a CMS API nem elérhető, ezekkel build-elünk
const FALLBACK_CONTENT: Record<string, string> = {
  "hero.audience": "Autókozmetikáknak és mosóknak",
  "hero.eyebrow": "Élő demó · most foglalható",
  "hero.title.line1": "Az autókozmetikád",
  "hero.title.line2": "operatív rendszere.",
  "hero.title.line3": "",
  "hero.description":
    "Foglalás, naptár, vendég, jármű, ár, bérlet, hűségpont, riport — egy rendszer, 60+ funkció, magyar pénzügyi környezetre szabva. Az 1-mosóállásos egyfős vállalkozástól a lánc-tulajdonosig.",
  "hero.cta.primary": "14 nap ingyen kipróbálom",
  "hero.cta.secondary": "Funkciók megnézése",
  "pricing.title": "Egyszerű árazás. Bezzeg minden.",
  "pricing.description":
    "Három csomag — az induló egyfős autókozmetikától a lánc-méretű hálózatig. 14 nap próba, kártyaadat nélkül. Felmondás bármikor.",
  "marketing.title": "Nemcsak a foglalót adjuk. Megtöltjük neked.",
  "marketing.subtitle":
    "Mi ügynökségi szinten állítjuk be a Google-t, a Facebookot, az emailjeidet, és visszahozzuk a régi vendégeidet.",
  "numbers.no_show": "−40%",
  "numbers.revenue": "+18%",
  "numbers.booking": "30 mp",
  "numbers.rating": "9.6",
  "cta.demo.label": "Demó kipróbálása",
  "cta.demo.url": "https://demo.boxbook.hu",
  "cta.contact.email": "info@boxbook.hu",
  "footer.tagline":
    "Mosóállás-alapú foglalási rendszer autókozmetikáknak. Magyar fejlesztés, magyar nyelv, magyar adatvédelem — egy ár, minden funkció.",
  "footer.version": "v0.4",
};

export async function getContent(): Promise<Record<string, string>> {
  if (_content) return _content.flat;
  try {
    const res = await fetch(`${CMS_URL}/api/marketing/content`, {
      headers: { Origin: "http://localhost:3002" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _content = (await res.json()) as ContentResponse;
    // Fallback-kal egyesítjük (a CMS-ben hiányzó kulcsok fallback-ből jönnek)
    _content.flat = { ...FALLBACK_CONTENT, ..._content.flat };
    return _content.flat;
  } catch (err) {
    console.warn("[cms] content fetch fail, fallback:", err);
    _content = { ok: false, flat: FALLBACK_CONTENT, grouped: {} };
    return FALLBACK_CONTENT;
  }
}

export async function t(key: string, fallback?: string): Promise<string> {
  const c = await getContent();
  return c[key] ?? fallback ?? key;
}

// Sync getter — Astro komponensekben await-elhetjük előtte
export function tSync(content: Record<string, string>, key: string, fallback?: string): string {
  return content[key] ?? fallback ?? key;
}

export async function getPricing(): Promise<PricingPlan[]> {
  if (_plans) return _plans;
  try {
    const res = await fetch(`${CMS_URL}/api/marketing/pricing`, {
      headers: { Origin: "http://localhost:3002" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { ok: boolean; plans: PricingPlan[] };
    _plans = json.plans ?? [];
    return _plans;
  } catch (err) {
    console.warn("[cms] pricing fetch fail, fallback:", err);
    _plans = [];
    return _plans;
  }
}

export function fmtPrice(p: number | null): string {
  if (p == null) return "Egyedi";
  return p.toLocaleString("hu-HU").replace(/,/g, " ");
}
