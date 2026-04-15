"use client";

import { useState } from "react";
import { Zap, AlertCircle, HelpCircle } from "lucide-react";
import { TutorialModal } from "@/components/layout/TutorialModal";

export function CookieSetup({ onSave }: { onSave: (cookie: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handle() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Paste your session cookie first.");
      return;
    }
    onSave(trimmed);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16">
      {/* Display heading */}
      <h1
        className="font-[family-name:var(--font-outfit)] font-black lowercase text-[clamp(3rem,10vw,6rem)] leading-none tracking-tight text-foreground mb-4"
        style={{ letterSpacing: "-0.03em" }}
      >
        slottle
      </h1>
      <p className="text-muted-foreground text-sm text-center mb-10 leading-relaxed">
        build your schedule with ease.
      </p>

      {/* Card */}
      <div className="w-full max-w-lg space-y-4">
        {/* Label */}
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
          Connect Session Cookie
        </p>

        {/* Textarea */}
        <textarea
          className="w-full h-24 px-4 py-3 rounded-sm bg-input border border-border/60 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary focus:ring-0 transition-colors"
          placeholder="Paste your session cookie here..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          spellCheck={false}
        />

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="size-3.5 shrink-0" />
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={handle}
          className="w-full h-12 flex items-center justify-center gap-2 text-sm font-bold tracking-widest uppercase text-primary-foreground rounded-sm btn-primary-gradient transition-opacity hover:opacity-90 active:opacity-80"
        >
          <Zap className="size-4" />
          Connect Engine
        </button>

        {/* How to guide */}
        <TutorialModal>
          <button className="w-full flex items-center gap-2 px-4 py-3 rounded-sm border border-border/50 text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground hover:border-border transition-colors">
            <HelpCircle className="size-4 shrink-0" />
            How to get your cookie
          </button>
        </TutorialModal>
      </div>
    </div>
  );
}
