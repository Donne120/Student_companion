import { useBranding } from "@/hooks/useBranding";

/** A slim strip with the university's logo above a mobile header, when the
 * university's plan includes branding. Renders nothing otherwise. */
export const BrandBand = () => {
  const branding = useBranding();
  if (!branding?.logo_url) return null;
  const dark = branding.logo_background === "dark";
  return (
    <div
      className={`h-9 px-3 flex items-center justify-between ${dark ? "" : "border-b border-[#EDEBE6]"}`}
      style={dark ? { backgroundColor: branding.surface_dark } : undefined}
    >
      <img src={branding.logo_url} alt={branding.name} className="h-[18px] w-auto max-w-[160px] object-contain" />
      <span className={`text-[10.5px] tracking-wide ${dark ? "text-white/65" : "text-[#1A1A1A]/55"}`}>
        Student Companion
      </span>
    </div>
  );
};
