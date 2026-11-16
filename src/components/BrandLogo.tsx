import type { Branding } from "@/lib/branding";

/** The university's logo with "Student Companion" beneath it, for the
 * sidebar. White text when the logo sits on the university's dark band. */
export const BrandLogo = ({ branding }: { branding: Branding }) => {
  const dark = branding.logo_background === "dark";
  return (
    <span className="flex flex-col items-start leading-none min-w-0">
      <img
        src={branding.logo_url || ""}
        alt={branding.name}
        className="h-[22px] w-auto max-w-[170px] object-contain object-left"
      />
      <span className={`mt-1 text-[10.5px] tracking-wide ${dark ? "text-white/65" : "text-[#1C1B19]/60"}`}>
        Student Companion
      </span>
    </span>
  );
};
