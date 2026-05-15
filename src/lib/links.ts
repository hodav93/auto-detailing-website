/**
 * Külső linkek konstansai a marketing-oldalhoz.
 *
 * A SaaS-foglalási rendszer regisztrációs / login URL-jeit innen
 * importálják a marketing CTA-k. Élesítésnél a domain-cseréhez
 * elég itt frissíteni.
 */

// Build-time env-változó az Astro-ban — ha be van állítva, override
// (`PUBLIC_` prefix kell ahhoz hogy elérhető legyen a kliens-oldalon)
const envSaasBase = (import.meta.env.PUBLIC_SAAS_BASE_URL as string | undefined) ?? "";

/** SaaS root URL (a foglalási rendszer alapja). */
export const SAAS_BASE_URL =
  envSaasBase || "https://foglalo.178.105.129.90.sslip.io";

/** Ingyenes 14-napos próba — itt kezdődik az onboarding. */
export const SIGNUP_URL = `${SAAS_BASE_URL}/regisztracio`;

/** Bejelentkezés (meglévő tenant admin). */
export const LOGIN_URL = `${SAAS_BASE_URL}/belepes`;

/** Vendég-foglalás demó oldal (egy próba-tenant alá). */
export const DEMO_BOOKING_URL = `${SAAS_BASE_URL}/foglalas`;
