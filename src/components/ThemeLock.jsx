import React from "react";
import { Sun, Moon } from "lucide-react";

/* A theme switch that cannot be switched, shown during the welcome sequence.
   The sun side is dimmed and the knob sits on the moon: a familiar control
   that visibly only has one setting. */

export function ThemeLock() {
  return (
    <div aria-hidden="true" className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-[9px] border border-white/10 rounded-full px-[5px] py-1 bg-white/[0.02]">
        {/* the side that is switched off */}
        <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center opacity-[0.22]">
          <Sun className="w-3 h-3 text-[#f4f4f4]" strokeWidth={2} />
        </span>
        {/* the side it is stuck on */}
        <span className="w-[22px] h-[22px] rounded-full bg-white/[0.09] flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.10)]">
          <Moon className="w-3 h-3 text-[#f4f4f4] fill-[#f4f4f4]" strokeWidth={0} />
        </span>
      </div>

      <span className="font-['Outfit'] text-[8px] md:text-[9px] tracking-[0.25em] text-[#888] uppercase whitespace-nowrap">
        Dark mode exclusive.
      </span>
    </div>
  );
}
