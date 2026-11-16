import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPreviewOrgs, setViewAsOrg, viewAsOrgId, type PreviewOrg } from "@/lib/viewAs";

/**
 * For platform admins only: choose which university to see the chat as.
 * Renders nothing for students (the list request is refused for them).
 */
export const ViewAsBar = ({ variant = "bar" }: { variant?: "bar" | "sidebar" }) => {
  const { currentUser } = useAuth();
  const [orgs, setOrgs] = useState<PreviewOrg[] | null>(null);
  const [selected, setSelected] = useState<string | null>(viewAsOrgId());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!currentUser) return;
      const list = await fetchPreviewOrgs(await currentUser.getIdToken());
      if (cancelled) return;
      setOrgs(list);
      if (!list) {
        if (viewAsOrgId()) setViewAsOrg(null); // not an admin (any more)
        return;
      }
      // Start on a university so the chat works straight away.
      if (list.length && !list.some((o) => o.id === viewAsOrgId())) {
        setViewAsOrg(list[0]);
        window.location.reload();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  if (!orgs || !orgs.length) return null;
  const org = orgs.find((o) => o.id === selected);

  const choose = (id: string) => {
    const next = orgs.find((o) => o.id === id) || null;
    setSelected(next?.id || null);
    setViewAsOrg(next);
    window.location.reload();
  };
  const options = orgs.map((o) => (
    <option key={o.id} value={o.id} className="text-[#1C1B19]">
      {o.name}
      {o.is_active ? "" : " (not open to students)"}
    </option>
  ));
  const plan = org ? org.plan_tier.charAt(0).toUpperCase() + org.plan_tier.slice(1) : "";

  if (variant === "sidebar") {
    return (
      <div className="mx-3 mt-3 rounded-lg bg-[#1C1B19] text-white p-2.5 text-[12px]">
        <div className="flex items-center gap-1.5 font-medium mb-1.5">
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          Viewing as
        </div>
        <select
          aria-label="University to view the chat as"
          value={selected || ""}
          onChange={(e) => choose(e.target.value)}
          className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-md px-1.5 py-1 text-white text-[12px]"
        >
          {options}
        </select>
        {org && <div className="mt-1.5 text-white/60 leading-snug">{plan} plan · admin preview, not counted in reports</div>}
      </div>
    );
  }

  return (
    <div className="bg-[#1C1B19] text-white text-[12.5px]">
      <div className="px-3 py-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex items-center gap-1.5 font-medium">
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          Viewing as
        </span>
        <select
          aria-label="University to view the chat as"
          value={selected || ""}
          onChange={(e) => choose(e.target.value)}
          className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-md px-2 py-0.5 text-white text-[12.5px] max-w-[60vw]"
        >
          {options}
        </select>
        {org && <span className="text-white/60">{plan} plan · preview</span>}
      </div>
    </div>
  );
};
