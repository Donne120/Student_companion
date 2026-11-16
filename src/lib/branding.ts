/**
 * University branding (Enterprise plan).
 *
 * A university on the Enterprise plan can show its own logo and colour in
 * the chat: its logo in the sidebar and mobile header, and its colour on
 * links in answers, the send button and quotes. The backend returns the
 * branding with the organization check (GET /api/organizations/check), only
 * for universities whose plan includes it. Everyone else sees the standard
 * Student Companion look: the CSS variables below default to it.
 *
 * Colours are applied as CSS variables ("R G B" triplets, so Tailwind's
 * opacity modifiers keep working) on <html>; see index.css and
 * tailwind.config.ts (brand-link, brand-action, brand-action-fg).
 */
import { API_URL, fetchWithTimeout } from "@/config/api";

export interface Branding {
  /** e.g. "African Leadership University" */
  name: string;
  /** e.g. "ALU", shown next to "Student Companion" */
  short_name?: string | null;
  /** https URL of the university's logo */
  logo_url?: string | null;
  /** "dark" when the logo is drawn for a dark background (a white logo) */
  logo_background?: "dark" | "light";
  /** The university's main colour, "#RRGGBB" */
  primary: string;
  /** Text colour on top of the main colour, "#RRGGBB" */
  on_primary?: string;
  /** A darker shade, for hover */
  primary_strong?: string;
  /** Background for the logo band when the logo is drawn for a dark background */
  surface_dark?: string;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const STORE = "sc_branding:";

function rgb(hex: string): string | null {
  if (!HEX.test(hex)) return null;
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

function hsl(hex: string): string | null {
  if (!HEX.test(hex)) return null;
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Only safe values: colours must be #RRGGBB and the logo an https URL. */
export function cleanBranding(raw: unknown): Branding | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const primary = typeof b.primary === "string" && HEX.test(b.primary) ? b.primary : null;
  if (!primary || typeof b.name !== "string") return null;
  const color = (v: unknown) => (typeof v === "string" && HEX.test(v) ? v : undefined);
  // An https address, or a logo hosted with the chat site itself (/brands/...).
  const logo =
    typeof b.logo_url === "string" && (b.logo_url.startsWith("https://") || /^\/brands\/[\w.-]+$/.test(b.logo_url))
      ? b.logo_url
      : null;
  return {
    name: b.name.slice(0, 120),
    short_name: typeof b.short_name === "string" ? b.short_name.slice(0, 24) : null,
    logo_url: logo,
    logo_background: b.logo_background === "dark" ? "dark" : "light",
    primary,
    on_primary: color(b.on_primary) || "#FFFFFF",
    primary_strong: color(b.primary_strong) || primary,
    surface_dark: color(b.surface_dark) || "#1C1C1C",
  };
}

const VARS = ["--brand-link", "--brand-action", "--brand-action-hover", "--brand-action-fg",
  "--primary", "--primary-foreground", "--ring", "--sidebar-primary", "--sidebar-primary-foreground"];

/** Apply (or, with null, remove) a university's colours on the page. */
export function applyBranding(b: Branding | null): void {
  const root = document.documentElement;
  VARS.forEach((v) => root.style.removeProperty(v));
  if (!b) {
    delete root.dataset.brand;
    return;
  }
  const set = (name: string, value: string | null) => value && root.style.setProperty(name, value);
  set("--brand-link", rgb(b.primary_strong || b.primary));
  set("--brand-action", rgb(b.primary));
  set("--brand-action-hover", rgb(b.primary_strong || b.primary));
  set("--brand-action-fg", rgb(b.on_primary || "#FFFFFF"));
  set("--primary", hsl(b.primary));
  set("--primary-foreground", hsl(b.on_primary || "#FFFFFF"));
  set("--ring", hsl(b.primary));
  set("--sidebar-primary", hsl(b.primary));
  set("--sidebar-primary-foreground", hsl(b.on_primary || "#FFFFFF"));
  root.dataset.brand = b.short_name || b.name;
}

function domainOf(email: string): string {
  return (email.split("@")[1] || "").toLowerCase();
}

/** The last branding seen for this email domain, so the page paints in the
 * university's colours at once instead of flashing the default. */
export function cachedBranding(email: string): Branding | null {
  try {
    const raw = localStorage.getItem(STORE + domainOf(email));
    return raw ? cleanBranding(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** The university's branding, or null (no branding, or not on Enterprise). */
export async function fetchBranding(email: string): Promise<Branding | null> {
  const domain = domainOf(email);
  if (!domain) return null;
  try {
    const url = `${API_URL}/api/organizations/check?email=${encodeURIComponent(email)}`;
    const res = await fetchWithTimeout(url, {}, 8000);
    if (!res.ok) return cachedBranding(email);
    const data = (await res.json()) as { branding?: unknown };
    const b = cleanBranding(data.branding);
    try {
      if (b) localStorage.setItem(STORE + domain, JSON.stringify(b));
      else localStorage.removeItem(STORE + domain);
    } catch {
      /* storage unavailable: fine */
    }
    return b;
  } catch {
    return cachedBranding(email);
  }
}
