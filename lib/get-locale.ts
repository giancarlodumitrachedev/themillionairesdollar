import "server-only";
import { cookies, headers } from "next/headers";
import {
  type Locale,
  isLocale,
  localeFromAcceptLanguage,
} from "./i18n";

export const LOCALE_COOKIE = "md_locale";

/**
 * Resolve the active locale on the server. Explicit cookie choice wins;
 * otherwise fall back to the Accept-Language header (Italian only for `it*`).
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (fromCookie && isLocale(fromCookie)) return fromCookie;

  const headerStore = await headers();
  return localeFromAcceptLanguage(headerStore.get("accept-language"));
}
