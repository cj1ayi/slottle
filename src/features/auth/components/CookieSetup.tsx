"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Zap, AlertCircle } from "lucide-react";

export function CookieSetup({ onSave }: { onSave: (cookie: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);

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
        className="font-[family-name:var(--font-outfit)] font-black text-[clamp(3rem,10vw,6rem)] leading-none tracking-tight text-foreground mb-4"
        style={{ letterSpacing: "-0.03em" }}
      >
        SLOTTLE
      </h1>
      <p className="text-muted-foreground text-sm text-center mb-10 leading-relaxed">
        Precision Course Engineering.
        <br />
        Build your perfect schedule.
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
        <div className="rounded-sm border border-border/50 overflow-hidden">
          <button
            onClick={() => setGuideOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] uppercase">
              <span className="size-4 rounded-full border border-muted-foreground/40 flex items-center justify-center text-[9px] font-black">
                ?
              </span>
              How to get your cookie
            </span>
            {guideOpen ? (
              <ChevronUp className="size-4 shrink-0" />
            ) : (
              <ChevronDown className="size-4 shrink-0" />
            )}
          </button>

          {guideOpen && (
            <div className="px-4 pb-4 border-t border-border/40">
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Log in to Archers Hub in another tab.</li>
                <li>
                  Open DevTools{" "}
                  <kbd className="px-1 py-0.5 text-xs font-mono bg-accent rounded-sm">
                    F12
                  </kbd>{" "}
                  → <strong className="text-foreground">Network</strong> tab.
                </li>
                <li>
                  Reload the page and click any request to{" "}
                  <code className="text-xs font-mono text-primary">
                    archershub.dlsu.edu.ph
                  </code>
                  .
                </li>
                <li>
                  Under{" "}
                  <strong className="text-foreground">Request Headers</strong>,
                  copy the full{" "}
                  <code className="text-xs font-mono text-primary">
                    cookie:
                  </code>{" "}
                  value.
                </li>
                <li>Paste it into the field above and click Connect Engine.</li>
              </ol>
              <p className="mt-3 text-xs text-muted-foreground/60">
                Your cookie stays in your browser — it is never sent to our
                servers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
