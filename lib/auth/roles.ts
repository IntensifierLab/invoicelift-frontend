export type Role = "sme" | "lender" | "anchor_buyer" | "admin";

const ROLES: readonly Role[] = ["sme", "lender", "anchor_buyer", "admin"];

export const ROLE_LABELS: Record<Role, string> = {
  sme: "SME",
  lender: "Lender",
  anchor_buyer: "Anchor buyer",
  admin: "Admin",
};

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

function parseAssignments(json: string | undefined): Record<string, Role> {
  if (!json) return {};
  try {
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) return {};
    const assignments: Record<string, Role> = {};
    for (const [address, role] of Object.entries(parsed as Record<string, unknown>)) {
      if (isRole(role)) {
        assignments[address.toLowerCase()] = role;
      }
    }
    return assignments;
  } catch {
    return {};
  }
}

// Roles are assigned out-of-band today via NEXT_PUBLIC_ROLE_ASSIGNMENTS, a JSON
// object mapping a Stellar address to one of the four roles (e.g.
// '{"GABC...":"lender","GXYZ...":"admin"}'), since there is no on-chain
// identity/role registry yet. When one ships, `resolveRole` is the only
// function that needs to change — swap the lookup below for a contract read;
// route guards, the nav, and the 403 page all consume its return value and
// need no changes.
const ROLE_ASSIGNMENTS = parseAssignments(process.env.NEXT_PUBLIC_ROLE_ASSIGNMENTS);

export function resolveRole(address: string | undefined): Role | undefined {
  if (!address) return undefined;
  return ROLE_ASSIGNMENTS[address.toLowerCase()];
}

/** Routes gated by role. Routes absent from this map are public. */
export const PAGE_ACCESS: Record<string, Role[]> = {
  "/smes": ["sme", "admin"],
  "/liquidity": ["lender", "admin"],
  "/risk": ["lender", "admin"],
  "/invoices": ["lender", "admin"],
  "/lender": ["lender", "admin"],
  "/admin/systemic-risk": ["admin"],
  "/waterfall": ["lender", "admin"],
  "/buyer-portal": ["anchor_buyer", "admin"],
};

export function isRoleAllowed(pathname: string, role: Role | undefined): boolean {
  const allowed = PAGE_ACCESS[pathname];
  if (!allowed) return true;
  return !!role && allowed.includes(role);
}
