"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

export type CameraFeedHandle = {
  /** Capture the current video frame as a JPEG blob (≤ ~quality). */
  capture: (quality?: number) => Promise<Blob | null>;
  isReady: () => boolean;
};

type Props = {
  active: boolean;
  onError?: (err: Error) => void;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Webcam feed with imperatively-grabbable frames.
 * Falls back gracefully if getUserMedia is unavailable.
 */
export const CameraFeed = forwardRef<CameraFeedHandle, Props>(function CameraFeed(
  { active, onError, className, children },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startingRef = useRef(false);
  const [ready, setReady] = useState(false);

  const start = useCallback(async () => {
    // Re-entry guard: StrictMode (dev) double-fires effects, so start() can run twice in parallel.
    // The second getUserMedia → srcObject swap aborts the first play() with "interrupted by a new load request".
    if (startingRef.current || streamRef.current) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      onError?.(new Error("getUserMedia unavailable"));
      return;
    }
    startingRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 540 }, frameRate: { ideal: 24 } },
        audio: false,
      });
      // Bail if a stop()/unmount happened while awaiting the prompt.
      if (!videoRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const v = videoRef.current;
      v.pause();
      v.srcObject = stream;
      try {
        await v.play();
      } catch (err: unknown) {
        const e = err as { name?: string; message?: string };
        // play() races with srcObject swaps; AbortError / "interrupted" is harmless.
        if (e?.name !== "AbortError" && !/interrupted/i.test(e?.message ?? "")) {
          throw err;
        }
      }
      setReady(true);
    } catch (err) {
      onError?.(err as Error);
      setReady(false);
    } finally {
      startingRef.current = false;
    }
  }, [onError]);

  const stop = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.srcObject = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  useEffect(() => {
    if (active) void start();
    else stop();
    return () => {
      stop();
    };
  }, [active, start, stop]);

  useImperativeHandle(ref, () => ({
    isReady: () => ready,
    capture: async (quality = 0.7) => {
      const v = videoRef.current;
      if (!v || !v.videoWidth) return null;
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvasRef.current = canvas;
      }
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      return new Promise<Blob | null>((resolve) =>
        canvas!.toBlob((b) => resolve(b), "image/jpeg", quality),
      );
    },
  }));

  return (
    <div className={className}>
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-[0.3em] text-ink-mute">
          {active ? "requesting camera…" : "camera idle"}
        </div>
      )}
      {children}
    </div>
  );
});
