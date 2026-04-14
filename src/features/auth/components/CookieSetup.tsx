"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Slottle</h1>
        <p className="text-muted-foreground mb-8">
          Schedule generator for DLSU Archers Hub
        </p>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div>
            <h2 className="font-semibold mb-1">
              Connect your Archers Hub session
            </h2>
            <p className="text-sm text-muted-foreground">
              Your cookie stays in your browser — never sent to our servers.
            </p>
          </div>

          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Log in to Archers Hub in another tab</li>
            <li>
              Open DevTools (F12) → <strong>Network</strong> tab
            </li>
            <li>
              Click any request to{" "}
              <code className="font-mono text-xs bg-muted px-1 rounded">
                archershub.dlsu.edu.ph
              </code>
            </li>
            <li>
              Under <strong>Request Headers</strong>, copy the full{" "}
              <code className="font-mono text-xs bg-muted px-1 rounded">
                cookie:
              </code>{" "}
              value
            </li>
          </ol>

          <Textarea
            className="h-24 font-mono resize-none"
            placeholder="cf_clearance=…; __RequestVerificationToken=…; __Secure-SID=…"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
          />

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="size-3.5 shrink-0" /> {error}
            </p>
          )}

          <Button onClick={handle} className="w-full h-10">
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
}
