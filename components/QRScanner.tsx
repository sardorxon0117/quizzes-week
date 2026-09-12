"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StatusView, { StatusPhase } from "./StatusView";
import { checkQuestionCode, codeCheckMessage } from "@/lib/checkQuestionCode";

const READER_ID = "qw-qr-reader";

type Camera = { id: string; label: string };
type CameraTarget = string | { facingMode: string };

// Phones often expose several rear lenses (main, 0.5x ultra-wide, telephoto).
// `facingMode: "environment"` doesn't guarantee the main sensor — on quite a
// few devices it hands back the ultra-wide one, which focuses badly up
// close. So on first load we enumerate the actual cameras and pick the main
// lens by label; from then on the switch button just cycles through
// whatever cameras the phone actually reported, in order.
const AVOID_LENS_KEYWORDS = ["ultra wide", "ultra-wide", "wide angle", "0.5", "0,5", "telephoto", "tele lens", "macro"];

function isBackCamera(label: string) {
  const l = label.toLowerCase();
  return !(l.includes("front") || l.includes("user") || l.includes("face"));
}

function pickMainLensIndex(cameras: Camera[]): number {
  const index = cameras.findIndex((c) => {
    const label = c.label.toLowerCase();
    return !AVOID_LENS_KEYWORDS.some((kw) => label.includes(kw));
  });
  return index === -1 ? 0 : index;
}

function parseCode(text: string): string | null {
  try {
    const url = new URL(text);
    const parts = url.pathname.split("/").filter(Boolean);
    const qIdx = parts.indexOf("q");
    if (qIdx !== -1 && parts[qIdx + 1]) return parts[qIdx + 1];
  } catch {
    if (/^\d{6}$/.test(text.trim())) return text.trim();
  }
  return null;
}

export default function QRScanner() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerCtorRef = useRef<any>(null);
  const scannerRef = useRef<any>(null);
  const camerasRef = useRef<Camera[]>([]);
  const cameraIndexRef = useRef(0);
  const handledRef = useRef(false);
  const mountedRef = useRef(true);

  const [starting, setStarting] = useState(true);
  const [canSwitch, setCanSwitch] = useState(false);
  const [phase, setPhase] = useState<StatusPhase | "scanning">("scanning");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    mountedRef.current = true;
    init();
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function stopScanner() {
    const s = scannerRef.current;
    if (!s) return;
    try {
      const state = s.getState?.();
      if (state === 2) await s.stop().catch(() => {});
    } catch {}
  }

  function onDecoded(decodedText: string) {
    if (handledRef.current) return;
    handledRef.current = true;
    handleDecoded(decodedText);
  }

  async function handleDecoded(text: string) {
    const code = parseCode(text);
    await stopScanner();
    if (!mountedRef.current) return;

    if (!code) {
      setPhase("error");
      setErrorMessage("QR kod tanilmadi. Boshqa QR kodni sinab ko'ring.");
      return;
    }

    setPhase("checking");
    const result = await checkQuestionCode(code);
    if (!mountedRef.current) return;

    if (result.kind === "ok") {
      setPhase("redirecting");
      router.push(`/q/${code}`);
    } else {
      setPhase("error");
      setErrorMessage(codeCheckMessage(result));
    }
  }

  function currentCameraTarget(): CameraTarget {
    const cameras = camerasRef.current;
    const cam = cameras[cameraIndexRef.current];
    return cam ? cam.id : { facingMode: "environment" };
  }

  async function init() {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!mountedRef.current || !containerRef.current) return;
      scannerCtorRef.current = Html5Qrcode;

      let cameras: Camera[] = [];
      try {
        const all: Camera[] = await Html5Qrcode.getCameras();
        cameras = all.filter((c) => isBackCamera(c.label));
        if (!cameras.length) cameras = all;
      } catch {
        // Enumeration blocked/unsupported — fall back to a plain facingMode request below.
      }
      camerasRef.current = cameras;
      cameraIndexRef.current = cameras.length ? pickMainLensIndex(cameras) : 0;
      setCanSwitch(cameras.length > 1);

      await startWithCamera(currentCameraTarget());
    } catch {
      setStarting(false);
      setPhase("error");
      setErrorMessage("Kameraga ruxsat berilmadi yoki kamera topilmadi.");
    }
  }

  async function startWithCamera(camera: CameraTarget) {
    const Html5Qrcode = scannerCtorRef.current;
    if (!Html5Qrcode || !mountedRef.current) return;
    setStarting(true);
    try {
      const scanner = new Html5Qrcode(READER_ID, { verbose: false });
      scannerRef.current = scanner;
      // No `qrbox` on purpose: passing one makes html5-qrcode inject its own
      // hard-coded dark shading + white/green corner borders over the video,
      // which clashes with our own frame. Scanning the full viewfinder
      // works just as well and we draw our own (teal) corner frame below.
      const config = { fps: 10 };

      try {
        await scanner.start(camera, config, onDecoded, () => {});
      } catch (err) {
        // A specific deviceId can occasionally fail to start on some browsers —
        // retry once with the generic facingMode request before giving up.
        if (typeof camera !== "string") throw err;
        camera = { facingMode: "environment" };
        await scanner.start(camera, config, onDecoded, () => {});
      }
      if (mountedRef.current) {
        setStarting(false);
        setPhase("scanning");
      }
    } catch {
      if (mountedRef.current) {
        setStarting(false);
        setPhase("error");
        setErrorMessage("Kameraga ruxsat berilmadi yoki kamera topilmadi.");
      }
    }
  }

  async function handleSwitchCamera() {
    const cameras = camerasRef.current;
    if (cameras.length < 2) return;
    handledRef.current = false;
    await stopScanner();
    cameraIndexRef.current = (cameraIndexRef.current + 1) % cameras.length;
    await startWithCamera(currentCameraTarget());
  }

  function handleRetry() {
    handledRef.current = false;
    startWithCamera(currentCameraTarget());
  }

  return (
    <div className="w-full">
      <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-2xl bg-neutral-900 shadow-inner">
        <div id={READER_ID} ref={containerRef} className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />

        {phase === "scanning" && (
          <div className="pointer-events-none absolute inset-6 sm:inset-8">
            <div className="absolute top-0 left-0 w-8 h-8 rounded-tl-xl border-t-4 border-l-4 border-[rgb(0,175,166)]" />
            <div className="absolute top-0 right-0 w-8 h-8 rounded-tr-xl border-t-4 border-r-4 border-[rgb(0,175,166)]" />
            <div className="absolute bottom-0 left-0 w-8 h-8 rounded-bl-xl border-b-4 border-l-4 border-[rgb(0,175,166)]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-br-xl border-b-4 border-r-4 border-[rgb(0,175,166)]" />
            <div className="absolute left-0 right-0 top-0 h-0.5 rounded-full bg-[rgb(255,199,0)] shadow-[0_0_8px_2px_rgba(255,199,0,0.6)] scan-line" />
          </div>
        )}

        {canSwitch && phase === "scanning" && (
          <button
            type="button"
            onClick={handleSwitchCamera}
            aria-label="Kamerani almashtirish"
            title="Kamerani almashtirish"
            className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-transform active:scale-90"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M17 2l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 12V10a4 4 0 0 1 4-4h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 22l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {starting && phase === "scanning" && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/70 text-white text-sm backdrop-blur-sm">
            Kamera ishga tushirilmoqda...
          </div>
        )}

        {(phase === "checking" || phase === "redirecting" || phase === "error") && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 px-6 backdrop-blur-md">
            <StatusView
              phase={phase === "error" ? "error" : phase}
              errorMessage={errorMessage}
              onRetry={phase === "error" ? handleRetry : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
