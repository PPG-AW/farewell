"use client";

import { Sparkles } from "lucide-react";

export function UIOverlayFallback({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center" style={{ background: "radial-gradient(circle at 50% 35%, #2b2119, #171310 75%)" }}>
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-dashed border-[#f2cc8f]" style={{ animationDuration: "2.4s" }} />
        <div className="absolute inset-3 animate-spin rounded-full border-2 border-[#e9a84a55]" style={{ animationDirection: "reverse", animationDuration: "3.4s" }} />
        <div className="absolute inset-0 flex items-center justify-center text-[#f2cc8f]">{icon ?? <Sparkles size={26} />}</div>
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-[#f4ecdd]/70">{label}</p>
    </div>
  );
}
