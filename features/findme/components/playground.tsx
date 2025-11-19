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
  const [useLocalAlbum, setUseLocalAlbum] = useState(false);
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
      className="space-y-12"
    >
      {/* Hero-style Header */}
      <div className="space-y-6 text-center">
        <span className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-2 text-[11px] uppercase tracking-[0.5em] text-slate-200/80 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[#19FFC7] shadow-[0_0_12px_rgba(25,255,199,0.9)]" />
          {copy.subtitle}
        </span>
        <h2 className="text-4xl font-semibold leading-tight tracking-[0.02em] text-white md:text-5xl">
          {copy.title}
        </h2>
        <p className="mx-auto max-w-2xl text-base text-white/70 md:text-lg">
          只需两步：上传你的自拍 + 上传活动相册，AI 自动帮你找出所有有你的照片
        </p>
      </div>

      {/* Main Content - Single Column */}
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Step 1: Upload Selfie */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#19FFC7]/20 text-sm font-bold text-[#19FFC7]">
              1
            </span>
            <h3 className="text-xl font-semibold text-white">{copy.uploadLabel}</h3>
          </div>
          {/* Selfie Upload - Dark Glass Style */}
          <label className="block cursor-pointer rounded-[32px] border border-[#19FFC7]/30 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 backdrop-blur transition hover:border-[#19FFC7]/50 hover:shadow-[0_0_40px_rgba(25,255,199,0.15)]">
            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleSelfieChange}
            />
            {selfiePreview ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <img
                  src={selfiePreview}
                  alt="Selfie preview"
                  className="h-32 w-32 rounded-2xl border border-white/10 object-cover shadow-lg"
                />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-white">✓ 自拍照已上传</p>
                  <p className="text-xs text-white/50">
                    JPG / PNG · 自动压缩
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#19FFC7]/10 border border-[#19FFC7]/20">
                  <svg className="h-8 w-8 text-[#19FFC7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">点击上传自拍照</p>
                  <p className="text-xs text-white/50">
                    {copy.uploadHint}
                  </p>
                  <p className="text-xs text-white/40">
                    支持 JPG / PNG 格式
                  </p>
                </div>
              </div>
            )}
          </label>
        </div>

        {/* Step 2: Album URL */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#00AEEF]/20 text-sm font-bold text-[#00AEEF]">
              2
            </span>
            <h3 className="text-xl font-semibold text-white">{copy.urlLabel}</h3>
          </div>
          <div className="rounded-[32px] border border-white/12 bg-[rgba(6,9,15,0.92)] p-8 backdrop-blur-2xl space-y-6">
            {/* URL Input - Main Feature */}
            <div className="space-y-3">
              <Input
                value={eventUrl}
                onChange={(event) => setEventUrl(event.target.value)}
                placeholder={copy.urlPlaceholder}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 text-base"
                disabled={useLocalAlbum}
              />
              <p className="text-xs text-white/50">
                粘贴活动相册链接，AI 将自动从中找出有你的照片
              </p>
            </div>

            {/* Local Upload - Secondary Option */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setUseLocalAlbum(!useLocalAlbum)}
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <span>{useLocalAlbum ? '↑' : '→'}</span>
                <span className="underline decoration-dotted underline-offset-4">
                  或者，从本地上传相册照片
                </span>
              </button>

              {useLocalAlbum && (
                <div className="mt-4 space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto justify-center text-sm font-medium"
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
                        className="text-xs sm:ml-auto sm:w-auto w-full text-white/60 hover:text-white"
                        onClick={clearAlbumFiles}
                      >
                        {copy.albumClearCta}
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-white/60">
                    {albumCountLabel}
                  </p>

                  {albumFiles.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {albumFiles.map((file, index) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-white/20"
                        >
                          <img
                            src={file.preview}
                            alt={file.file.name || `album-${index + 1}`}
                            className="h-14 w-14 flex-shrink-0 rounded-xl border border-white/10 object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {file.file.name || `album-${index + 1}`}
                            </p>
                            <p className="text-xs text-white/50">
                              {Math.round(file.file.size / 1024)} KB
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="simple"
                            onClick={() => removeAlbumFile(file.id)}
                            className="flex-shrink-0 text-white/60 hover:text-white"
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4 pt-4">
          <button
            onClick={startProcessing}
            disabled={isProcessing}
            className="w-full max-w-md rounded-full bg-white px-12 py-4 text-lg font-semibold shadow-[0_15px_50px_rgba(255,255,255,0.25)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(255,255,255,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ color: '#000000' }}
          >
            {isProcessing ? "处理中..." : (copy.startButton || "开始查找")}
          </button>
          {!isProcessing && selfieFile && (
            <button
              onClick={handleReset}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {copy.resetButton}
            </button>
          )}
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <div className="text-center rounded-2xl border border-[#19FFC7]/20 bg-[#19FFC7]/10 p-4">
            <p className="text-sm font-medium text-[#19FFC7]">{statusMessage}</p>
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-center">
            <p className="text-sm font-medium text-red-400">{error}</p>
          </div>
        )}

        {/* Progress Section - Only show when processing */}
        {isProcessing && (
          <div className="rounded-[32px] border border-white/12 bg-[rgba(6,9,15,0.92)] p-8 backdrop-blur-2xl">
          {/* Gradient Progress Bar */}
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#19FFC7] via-[#00AEEF] to-[#9B4FFF] transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <ul className="mt-8 space-y-4">
            {copy.statuses.map((status, index) => {
              const isCurrent = index + 1 === activeStep;
              const isDone = index + 1 <= activeStep && activeStep > 0;

              const glowColor = index % 3 === 0
                ? "rgba(25,255,199,0.3)"
                : index % 3 === 1
                ? "rgba(0,174,239,0.3)"
                : "rgba(155,79,255,0.3)";

              return (
                <li
                  key={status.title}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border p-4 transition-all",
                    isDone
                      ? "border-[#19FFC7]/40 bg-[#19FFC7]/10"
                      : isCurrent
                      ? "border-[#00AEEF]/50 bg-[#00AEEF]/10"
                      : "border-white/10 bg-white/5",
                    isCurrent && "shadow-[0_0_35px_rgba(0,174,239,0.3)]"
                  )}
                >
                  {isCurrent && (
                    <div
                      className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-[60px]"
                      style={{ background: glowColor }}
                    />
                  )}
                  <div className="relative flex items-center gap-3">
                    <span className={cn(
                      "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      isDone
                        ? "bg-[#19FFC7]/20 text-[#19FFC7]"
                        : isCurrent
                        ? "bg-[#00AEEF]/20 text-[#00AEEF]"
                        : "bg-white/10 text-white/50"
                    )}>
                      {isDone ? "✓" : index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{status.title}</p>
                      <p className="text-xs text-white/60">
                        {status.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          </div>
        )}

        {/* Results Section - Only show when有结果 */}
        {matches.length > 0 && (
      <div className="space-y-8 rounded-[40px] border border-white/12 bg-[rgba(6,9,15,0.92)] p-10 backdrop-blur-2xl">
        <div className="text-center space-y-2">
          <p className="text-3xl font-semibold text-white">{copy.resultsTitle}</p>
          <p className="text-sm text-white/60">
            找到 {matches.length} 张照片，{copy.resultsHelp}
          </p>
        </div>
        {matches.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((match, index) => {
              const album = albumFiles[match.photoIndex];
              const previewSrc = match.previewUrl ?? album?.preview;
              const hasPreview = Boolean(previewSrc);
              const canDownload = Boolean(match.sourceUrl || previewSrc);
              return (
                <article
                  key={`${match.photoIndex}-${match.confidence}`}
                  className="group relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 flex flex-col gap-3 transition hover:border-white/20 hover:-translate-y-1"
                >
                  {hasPreview ? (
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(index)}
                      className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19FFC7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
                      aria-label={`预览 ${match.filename}`}
                    >
                      <div className="aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                        <img
                          src={previewSrc ?? ""}
                          alt={album?.file.name || match.filename}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    </button>
                  ) : (
                    <div className="aspect-square w-full rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-xs text-white/50">
                      {match.filename}
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {match.filename}
                    </p>
                    <p className="text-xs text-white/60">
                      {match.tokenCount} face hits · {match.confidence.toFixed(2)}%
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto w-full rounded-full border-white/20 bg-transparent text-white hover:border-[#19FFC7]/50 hover:bg-[#19FFC7]/10 hover:text-[#19FFC7]"
                    onClick={() => handleDownloadSingle(match)}
                    disabled={!canDownload}
                  >
                    {copy.cardDownloadCta}
                  </Button>
                </article>
              );
            })}
          </div>
        )}
        </div>
        )}
      </div>

      {/* Preview Modal */}
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
