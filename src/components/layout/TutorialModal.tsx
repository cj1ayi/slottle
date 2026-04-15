"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const STEPS = [
  {
    title: "Log in to Archers Hub",
    description:
      "Go to Archers Hub and sign in with your DLSU account credentials.",
    image: "/tutorial/step1.png",
  },
  {
    title: "Navigate to Curriculum Progression",
    description:
      'Click on "Curriculum Progression" or any page that fetches data from the server. This will trigger the network requests we need.',
    image: "/tutorial/step2.png",
  },
  {
    title: "Open DevTools and find a GET request",
    description:
      "Press F12 to open DevTools and go to the Network tab. Look for any GET request in the list and click on it.",
    image: "/tutorial/step3.png",
  },
  {
    title: "Click the Headers tab",
    description:
      'Click on the "Headers" tab and scroll down to the Response Headers section to find the cookie field.',
    image: "/tutorial/step4.png",
  },
  {
    title: "Copy the cookie and paste it into Slottle",
    description:
      "Copy the full cookie value from the response headers, paste it into the session cookie field in Slottle, and click Connect Engine.",
    image: "/tutorial/step5.png",
  },
];

export function TutorialModal({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  return (
    <Dialog onOpenChange={() => setStep(0)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
            <div className="flex gap-1 ml-1">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1 rounded-full transition-all ${
                    i === step
                      ? "w-4 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <DialogTitle className="text-base">{current.title}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {current.description}
          </p>
        </DialogHeader>

        {/* Screenshot */}
        <div className="relative mx-5 mb-4 rounded-lg overflow-hidden border border-border bg-muted aspect-video">
          <Image
            key={step}
            src={current.image}
            alt={`Step ${step + 1}: ${current.title}`}
            fill
            className="object-contain"
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-5 pb-5">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={isFirst}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="size-4" />
            Back
          </button>
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={isLast}
            className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
