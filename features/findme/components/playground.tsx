"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/button";
import { Input } from "@/features/forms/components/input";
import { cn } from "@/lib/utils";

export type PlaygroundStatus = {
  title: string;
  description: string;
};

export type PlaygroundMockResult = {
  id: string;
  image: string;
  caption: string;
  detail: string;
  score: string;
};

export type PlaygroundCopy = {
  title: string;
  subtitle: string;
  uploadLabel: string;
  uploadHint: string;
  urlLabel: string;
  urlPlaceholder: string;
  startButton: string;
  resetButton: string;
  downloadCta: string;
  downloadHelp: string;
  resultsTitle: string;
  resultsEmpty: string;
  messages: {
    missingFields: string;
    invalidSelfie: string;
    noResults: string;
    ready: string;
    downloadReady: string;
  };
  statuses: PlaygroundStatus[];
  mockResults: PlaygroundMockResult[];
};

export function FindMePlayground({ copy }: { copy: PlaygroundCopy }) {
  const [eventUrl, setEventUrl] = useState("");
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [results, setResults] = useState<PlaygroundMockResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanupTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupTimer();
      if (selfiePreview) {
        URL.revokeObjectURL(selfiePreview);
      }
    };
  }, [selfiePreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage(copy.messages.invalidSelfie);
      return;
    }

    if (selfiePreview) {
      URL.revokeObjectURL(selfiePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelfiePreview(previewUrl);
    setMessage(copy.messages.ready);
  };

  const startProcessing = () => {
    if (!selfiePreview || !eventUrl.trim()) {
      setMessage(copy.messages.missingFields);
      return;
    }

    cleanupTimer();
    setIsProcessing(true);
    setResults([]);
    setMessage(copy.messages.ready);

    let currentStep = 1;
    setActiveStep(currentStep);

    timerRef.current = setInterval(() => {
      currentStep += 1;
      if (currentStep <= copy.statuses.length) {
        setActiveStep(currentStep);
      } else {
        cleanupTimer();
        setIsProcessing(false);
        setActiveStep(copy.statuses.length);
        setResults(copy.mockResults);
        setMessage(copy.messages.downloadReady);
      }
    }, 900);
  };

  const handleReset = () => {
    cleanupTimer();
    if (selfiePreview) {
      URL.revokeObjectURL(selfiePreview);
    }
    setEventUrl("");
    setSelfiePreview(null);
    setIsProcessing(false);
    setActiveStep(0);
    setResults([]);
    setMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = () => {
    if (!results.length) {
      setMessage(copy.messages.noResults);
      return;
    }
    setMessage(copy.messages.downloadReady);
  };

  const progress =
    copy.statuses.length > 0
      ? Math.min(activeStep, copy.statuses.length) / copy.statuses.length
      : 0;

  return (
    <section
      id="findme-app"
      className="space-y-10 rounded-[36px] border border-border/80 bg-background/80 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.35)]"
    >
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          {copy.subtitle}
        </p>
        <h2 className="text-3xl font-semibold">{copy.title}</h2>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex h-full cursor-pointer flex-col justify-between rounded-3xl border border-dashed border-primary/50 bg-primary/5 p-6 transition hover:border-primary">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
              />
              <span className="text-sm font-semibold text-primary">
                {copy.uploadLabel}
              </span>
              <span className="text-xs text-muted-foreground">
                {copy.uploadHint}
              </span>
              {selfiePreview ? (
                <div className="mt-4">
                  <Image
                    src={selfiePreview}
                    alt="Selfie preview"
                    width={320}
                    height={320}
                    className="h-32 w-32 rounded-2xl object-cover"
                  />
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-4 text-xs text-muted-foreground">
                  JPG / PNG · &lt; 10MB
                </div>
              )}
            </label>
            <div className="rounded-3xl border border-border/70 bg-muted/20 p-6">
              <label className="text-sm font-semibold text-foreground">
                {copy.urlLabel}
              </label>
              <Input
                value={eventUrl}
                onChange={(event) => setEventUrl(event.target.value)}
                placeholder={copy.urlPlaceholder}
                className="mt-3"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                *.jpg / *.png only · public URLs
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              onClick={startProcessing}
              className="w-full sm:w-auto"
              disabled={isProcessing}
            >
              {isProcessing ? `${copy.startButton}…` : copy.startButton}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full sm:w-auto"
            >
              {copy.resetButton}
            </Button>
          </div>
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </div>
        <div className="rounded-3xl border border-border/70 bg-background/70 p-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <ul className="mt-6 space-y-4">
            {copy.statuses.map((status, index) => {
              const isPast = activeStep > 0 && index + 1 < activeStep;
              const isCurrent = activeStep > 0 && index + 1 === activeStep;
              const isDone = isPast || (isCurrent && !isProcessing);
              const stateClass = isDone
                ? "border-emerald-400/50 bg-emerald-400/10"
                : isCurrent
                ? "border-primary/70 bg-primary/10"
                : "border-border/70 bg-background/60";

              return (
                <li
                  key={status.title}
                  className={cn(
                    "rounded-2xl border p-4",
                    stateClass,
                    isCurrent && "shadow-[0_0_35px_rgba(59,130,246,0.25)]"
                  )}
                >
                  <p className="text-sm font-semibold">{status.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {status.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="space-y-4 rounded-3xl border border-border/70 bg-background/90 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold">{copy.resultsTitle}</p>
            <p className="text-sm text-muted-foreground">
              {results.length ? copy.downloadHelp : copy.resultsEmpty}
            </p>
          </div>
          <Button
            className={cn(
              "w-full md:w-auto",
              !results.length && "pointer-events-none opacity-60"
            )}
            onClick={handleDownload}
            aria-disabled={!results.length}
          >
            {copy.downloadCta}
          </Button>
        </div>
        {results.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {results.map((match) => (
              <article
                key={match.id}
                className="rounded-3xl border border-border/70 bg-muted/10 p-4"
              >
                <Image
                  src={match.image}
                  alt={match.caption}
                  width={480}
                  height={320}
                  className="h-40 w-full rounded-2xl object-cover"
                />
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-semibold">{match.caption}</p>
                  <p className="text-xs text-muted-foreground">
                    {match.detail}
                  </p>
                  <p className="text-xs text-primary font-semibold">
                    {match.score}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{copy.resultsEmpty}</p>
        )}
      </div>
    </section>
  );
}
