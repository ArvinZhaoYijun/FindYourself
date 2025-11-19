"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/features/forms/components/input";
import { Switch } from "@/components/switch";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type PlaygroundStatus = {
  title: string;
  description: string;
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
  resultsTitle: string;
  resultsEmpty: string;
  resultsHelp: string;
  cardDownloadCta: string;
  localToggleLabel: string;
  localToggleDescription: string;
  albumUploadCta: string;
  albumSelectedLabel: string;
  albumClearCta: string;
  urlDisabled: string;
  messages: {
    missingFields: string;
    invalidSelfie: string;
    noResults: string;
    ready: string;
    downloadReady: string;
    fileTooLarge: string;
  };
  statuses: PlaygroundStatus[];
};

type SearchMatch = {
  photoIndex: number;
  filename: string;
  confidence: number;
  tokenCount: number;
  previewUrl?: string;
  sourceUrl?: string;
};

type AlbumFileState = {
  id: string;
  file: File;
  preview: string;
};

export function FindMePlayground({ copy }: { copy: PlaygroundCopy }) {
  const [eventUrl, setEventUrl] = useState("");
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [albumFiles, setAlbumFiles] = useState<AlbumFileState[]>([]);
  const [useLocalAlbum, setUseLocalAlbum] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewItems = useMemo(
    () =>
      matches.map((match) => {
        const album = albumFiles[match.photoIndex];
        const previewUrl = match.previewUrl ?? album?.preview ?? null;
        return {
          match,
          album,
          previewUrl,
        };
      }),
    [matches, albumFiles]
  );
  const currentPreview =
    previewIndex !== null ? previewItems[previewIndex] : null;
  const canNavigatePreview = previewItems.length > 1;

  const selfieInputRef = useRef<HTMLInputElement | null>(null);
  const albumInputRef = useRef<HTMLInputElement | null>(null);
  const albumFilesRef = useRef<AlbumFileState[]>([]);

  useEffect(() => {
    albumFilesRef.current = albumFiles;
  }, [albumFiles]);

  useEffect(() => {
    return () => {
      albumFilesRef.current.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, []);

  useEffect(() => {
    return () => {
      if (selfiePreview) {
        URL.revokeObjectURL(selfiePreview);
      }
    };
  }, [selfiePreview]);

  const albumCountLabel = useMemo(() => {
    return copy.albumSelectedLabel.replace(
      "{count}",
      albumFiles.length.toString()
    );
  }, [albumFiles.length, copy.albumSelectedLabel]);

  const handleOpenPreview = useCallback(
    (index: number) => {
      if (!previewItems[index]?.previewUrl) {
        return;
      }
      setPreviewIndex(index);
    },
    [previewItems]
  );

  const closePreview = useCallback(() => setPreviewIndex(null), []);

  const showPrevPreview = useCallback(() => {
    setPreviewIndex((prev) => {
      if (prev === null) {
        return prev;
      }
      const total = previewItems.length;
      if (!total) {
        return null;
      }
      return (prev - 1 + total) % total;
    });
  }, [previewItems.length]);

  const showNextPreview = useCallback(() => {
    setPreviewIndex((prev) => {
      if (prev === null) {
        return prev;
      }
      const total = previewItems.length;
      if (!total) {
        return null;
      }
      return (prev + 1) % total;
    });
  }, [previewItems.length]);

  useEffect(() => {
    if (previewIndex === null) {
      return;
    }
    if (previewIndex >= previewItems.length) {
      setPreviewIndex(null);
    }
  }, [previewIndex, previewItems.length]);

  useEffect(() => {
    if (previewIndex === null) {
      document.body.style.removeProperty("overflow");
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
      } else if (event.key === "ArrowLeft") {
        showPrevPreview();
      } else if (event.key === "ArrowRight") {
        showNextPreview();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.removeProperty("overflow");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewIndex, closePreview, showPrevPreview, showNextPreview]);

  const handleSelfieChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(copy.messages.invalidSelfie);
      return;
    }

    if (selfiePreview) {
      URL.revokeObjectURL(selfiePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelfieFile(file);
    setSelfiePreview(previewUrl);
    setStatusMessage(copy.messages.ready);
    setError(null);
  };

  const handleAlbumUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    const next: AlbumFileState[] = [];
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        return;
      }
      next.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      });
    });

    if (next.length) {
      setAlbumFiles((prev) => [...prev, ...next]);
      setError(null);
    }
    if (albumInputRef.current) {
      albumInputRef.current.value = "";
    }
  };

  const removeAlbumFile = (id: string) => {
    setAlbumFiles((prev) => {
      const target = prev.find((file) => file.id === id);
      if (target) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((file) => file.id !== id);
    });
  };

  const clearAlbumFiles = () => {
    albumFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    setAlbumFiles([]);
  };

  const handleReset = () => {
    if (selfiePreview) {
      URL.revokeObjectURL(selfiePreview);
    }
    selfieInputRef.current && (selfieInputRef.current.value = "");
    albumInputRef.current && (albumInputRef.current.value = "");
    clearAlbumFiles();
    setSelfieFile(null);
    setSelfiePreview(null);
    setEventUrl("");
    setMatches([]);
    setActiveStep(0);
    setStatusMessage(null);
    setError(null);
  };

  const startProcessing = async () => {
    if (!selfieFile) {
      setError(copy.messages.missingFields);
      return;
    }

    if (useLocalAlbum && !albumFiles.length) {
      setError(copy.messages.missingFields);
      return;
    }

    const trimmedUrl = eventUrl.trim();
    if (!useLocalAlbum && !trimmedUrl) {
      setError(copy.urlDisabled);
      return;
    }

    try {
      setIsProcessing(true);
      setActiveStep(1);
      setMatches([]);
      setStatusMessage(copy.messages.ready);
      setError(null);

      const formData = new FormData();
      formData.append("selfie", selfieFile);
      if (useLocalAlbum) {
        albumFiles.forEach((item) => {
          formData.append("album", item.file);
        });
      }
      formData.append("useLocalAlbum", useLocalAlbum.toString());
      formData.append("eventUrl", trimmedUrl);

      const response = await fetch("/api/findme/run", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || copy.messages.noResults);
      }

      const resultMatches: SearchMatch[] = payload.matches ?? [];
      setMatches(resultMatches);
      setActiveStep(copy.statuses.length);
      setStatusMessage(
        resultMatches.length ? copy.messages.downloadReady : copy.messages.noResults
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "运行失败，请稍后再试");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (match: SearchMatch) => {
    const album = albumFiles[match.photoIndex];
    const downloadUrl = match.sourceUrl ?? album?.preview ?? match.previewUrl;
    if (!downloadUrl) {
      setError(copy.messages.noResults);
      return;
    }

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download =
      album?.file.name || match.filename || `findme-${match.photoIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <label className="cursor-pointer rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6 transition hover:border-primary">
            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleSelfieChange}
            />
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-primary">
                  {copy.uploadLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {copy.uploadHint}
                </p>
              </div>
              {selfiePreview ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <img
                    src={selfiePreview}
                    alt="Selfie preview"
                    className="h-32 w-32 rounded-2xl object-cover"
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG / PNG · 自动压缩
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-xs text-muted-foreground">
                  JPG / PNG · 自动压缩
                </div>
              )}
            </div>
          </label>
          <div className="rounded-3xl border border-border/70 bg-muted/20 p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                {copy.urlLabel}
              </label>
              <Input
                value={eventUrl}
                onChange={(event) => setEventUrl(event.target.value)}
                placeholder={copy.urlPlaceholder}
              />
            </div>
            <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 p-4 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">{copy.localToggleLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {copy.localToggleDescription}
                  </p>
                </div>
                <Switch
                  checked={useLocalAlbum}
                  onCheckedChange={(value) => setUseLocalAlbum(Boolean(value))}
                />
              </div>
              {useLocalAlbum ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto justify-center"
                      onClick={() => albumInputRef.current?.click()}
                    >
                      {copy.albumUploadCta}
                    </Button>
                    <input
                      ref={albumInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleAlbumUpload}
                    />
                    {albumFiles.length > 0 && (
                      <Button
                        type="button"
                        variant="simple"
                        size="sm"
                        className="text-xs sm:ml-auto sm:w-auto w-full"
                        onClick={clearAlbumFiles}
                      >
                        {copy.albumClearCta}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {albumCountLabel}
                  </p>
                  {albumFiles.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {albumFiles.map((file, index) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 p-3"
                        >
                          <img
                            src={file.preview}
                            alt={file.file.name || `album-${index + 1}`}
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">
                              {file.file.name || `album-${index + 1}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(file.file.size / 1024)} KB
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="simple"
                            onClick={() => removeAlbumFile(file.id)}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{copy.urlDisabled}</p>
              )}
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
              disabled={isProcessing}
            >
              {copy.resetButton}
            </Button>
          </div>
          {statusMessage && (
            <p className="text-sm text-muted-foreground">{statusMessage}</p>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
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
              const isCurrent = index + 1 === activeStep;
              const isDone = index + 1 <= activeStep && activeStep > 0;
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
        <div>
          <p className="text-lg font-semibold">{copy.resultsTitle}</p>
          <p className="text-sm text-muted-foreground">
            {matches.length ? copy.resultsHelp : copy.resultsEmpty}
          </p>
        </div>
        {matches.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((match, index) => {
              const album = albumFiles[match.photoIndex];
              const previewSrc = match.previewUrl ?? album?.preview;
              const hasPreview = Boolean(previewSrc);
              const canDownload = Boolean(match.sourceUrl || previewSrc);
              return (
                <article
                  key={`${match.photoIndex}-${match.confidence}`}
                  className="rounded-3xl border border-border/70 bg-muted/10 p-4 flex flex-col gap-3"
                >
                  {hasPreview ? (
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(index)}
                      className="group block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      aria-label={`预览 ${match.filename}`}
                    >
                      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-muted">
                        <img
                          src={previewSrc ?? ""}
                          alt={album?.file.name || match.filename}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </button>
                  ) : (
                    <div className="aspect-square w-full rounded-2xl bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      {match.filename}
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold truncate">
                      {match.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {match.tokenCount} face hits · {match.confidence.toFixed(2)}%
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto w-full"
                    onClick={() => handleDownloadSingle(match)}
                    disabled={!canDownload}
                  >
                    {copy.cardDownloadCta}
                  </Button>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{copy.resultsEmpty}</p>
        )}
      </div>
      {previewIndex !== null && currentPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closePreview}
        >
          <div
            className="relative flex max-h-full w-full max-w-5xl flex-col items-center gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closePreview}
              className="absolute right-0 top-0 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="关闭预览"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative flex w-full items-center justify-center">
              {canNavigatePreview && (
                <button
                  type="button"
                  onClick={showPrevPreview}
                  className="absolute left-0 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="上一张照片"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              {currentPreview.previewUrl ? (
                <img
                  src={currentPreview.previewUrl}
                  alt={currentPreview.match.filename}
                  className="max-h-[75vh] w-auto max-w-full rounded-3xl object-contain shadow-2xl"
                />
              ) : (
                <div className="flex h-[60vh] w-full items-center justify-center rounded-3xl bg-background/80 text-sm text-foreground">
                  {currentPreview.match.filename}
                </div>
              )}
              {canNavigatePreview && (
                <button
                  type="button"
                  onClick={showNextPreview}
                  className="absolute right-0 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="下一张照片"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>
            <div className="text-center text-sm text-white">
              <p className="font-semibold">{currentPreview.match.filename}</p>
              <p className="text-xs text-white/80">
                {currentPreview.match.tokenCount} face hits ·{" "}
                {currentPreview.match.confidence.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
