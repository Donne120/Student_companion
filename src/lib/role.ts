import { API_URL, authHeader } from "@/config/api";

/**
 * Who the signed-in person is (backend audience.py): a current student,
 * an alumnus or staff. Asked once, only when their university gives
 * everyone the same email domain, so the assistant can answer for the
 * right person (alumni routes for alumni, "on a student's behalf" for staff).
 */
export type Role = "student" | "alumni" | "staff";
export type RoleStatus = { role: string; can_choose: boolean; needs_choice: boolean; choices: Role[] };

export const ROLE_OPTIONS: { id: Role; name: string; hint: string }[] = [
  { id: "student", name: "Current student", hint: "Studying here now" },
  { id: "alumni", name: "Alumni", hint: "I've graduated" },
  { id: "staff", name: "Staff or faculty", hint: "I work here" },
];

export async function fetchRole(): Promise<RoleStatus | null> {
  try {
    const res = await fetch(`${API_URL}/api/me/role`, { headers: { ...(await authHeader()) } });
    if (!res.ok) return null;
    return (await res.json()) as RoleStatus;
  } catch {
    return null;
  }
}

export async function saveRole(role: Role): Promise<RoleStatus | null> {
  try {
    const res = await fetch(`${API_URL}/api/me/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) return null;
    return (await res.json()) as RoleStatus;
  } catch {
    return null;
  }
}
