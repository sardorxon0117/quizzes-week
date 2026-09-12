"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const READER_ID = "qw-qr-reader";

type Camera = { id: string; label: string };
type CameraTarget = string | { facingMode: string };

// Phones often expose several rear lenses (main, 0.5x ultra-wide, telephoto).
// `facingMode: "environment"` doesn't guarantee the main sensor — on quite a
// few devices it hands back the ultra-wide one, which focuses badly up close
// and makes QR codes harder to read than on any normal scanner app. So we
// enumerate the actual cameras and pick the main lens by label first...
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

// ...but on plenty of phones the physical lenses aren't separate devices at
// all: the browser exposes just 1-2 "logical" back cameras, and additional
// lenses (0.5x ultra-wide, 2x/3x telephoto) only become reachable through
// the `zoom` constraint on whichever logical camera fuses them. So for
// *every* camera we also probe its zoom range and collect the meaningful
// stops inside it (wide / normal / tele) — that's what actually gets you to
// all 3-4 physical lenses even when only 2 devices are ever listed.
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function buildZoomStops(zoom: { min: number; max: number } | undefined | null): number[] {
  if (!zoom || typeof zoom.min !== "number" || typeof zoom.max !== "number") return [];
  const stops = new Set<number>();
  if (zoom.min <= 0.9) stops.add(round2(zoom.min)); // an ultra-wide-ish stop fused into this device
  if (zoom.min <= 1 && zoom.max >= 1) stops.add(1); // the normal, unzoomed lens
  if (zoom.max >= 1.5) stops.add(round2(zoom.max)); // a telephoto-ish stop fused into this device
  return Array.from(stops).sort((a, b) => a - b);
}

export default function QRScanner() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerCtorRef = useRef<any>(null);
  const scannerRef = useRef<any>(null);
  const camerasRef = useRef<Camera[]>([]);
  const cameraIndexRef = useRef(0);
  const zoomStopsRef = useRef<number[]>([]);
  const zoomStopIndexRef = useRef(0);
  const handledRef = useRef(false);
  const mountedRef = useRef(true);

  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const [canSwitch, setCanSwitch] = useState(false);

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

  function handleDecoded(text: string) {
    let code: string | null = null;
    try {
      const url = new URL(text);
      const parts = url.pathname.split("/").filter(Boolean);
      const qIdx = parts.indexOf("q");
      if (qIdx !== -1 && parts[qIdx + 1]) code = parts[qIdx + 1];
    } catch {
      if (/^\d{6}$/.test(text.trim())) code = text.trim();
    }

    stopScanner().finally(() => {
      if (!mountedRef.current) return;
      if (code) {
        router.push(`/q/${code}`);
      } else {
        setError("QR kod tanilmadi. Boshqa QR kodni sinab ko'ring.");
        handledRef.current = false;
        startWithCamera(currentCameraTarget());
      }
    });
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

      await startWithCamera(currentCameraTarget());
    } catch {
      setStarting(false);
      setError("Kameraga ruxsat berilmadi yoki kamera topilmadi.");
    }
  }

  async function startWithCamera(camera: CameraTarget) {
    const Html5Qrcode = scannerCtorRef.current;
    if (!Html5Qrcode || !mountedRef.current) return;
    setStarting(true);
    try {
      const scanner = new Html5Qrcode(READER_ID, { verbose: false });
      scannerRef.current = scanner;
      const config = { fps: 10, qrbox: { width: 220, height: 220 } };

      try {
        await scanner.start(camera, config, onDecoded, () => {});
      } catch (err) {
        // A specific deviceId can occasionally fail to start on some browsers —
        // retry once with the generic facingMode request before giving up.
        if (typeof camera !== "string") throw err;
        camera = { facingMode: "environment" };
        await scanner.start(camera, config, onDecoded, () => {});
      }

      const stops = await probeZoomStops(scanner);
      zoomStopsRef.current = stops;
      zoomStopIndexRef.current = Math.max(0, stops.indexOf(1));

      if (mountedRef.current) {
        setStarting(false);
        setCanSwitch(camerasRef.current.length > 1 || stops.length > 1);
      }
    } catch {
      if (mountedRef.current) {
        setStarting(false);
        setError("Kameraga ruxsat berilmadi yoki kamera topilmadi.");
      }
    }
  }

  // Reads the running track's zoom range, jumps it to the "normal" (1x) stop
  // when possible, and returns every meaningful stop (wide/normal/tele) this
  // device can reach so the switch button can step through them too.
  async function probeZoomStops(scanner: any): Promise<number[]> {
    try {
      const capabilities = scanner.getRunningTrackCapabilities?.() as any;
      const stops = buildZoomStops(capabilities?.zoom);
      if (!stops.length) return [];
      const startAt = stops.includes(1) ? 1 : stops[0];
      await scanner.applyVideoConstraints({ advanced: [{ zoom: startAt }] } as any);
      return stops;
    } catch {
      return [];
    }
  }

  async function handleSwitchCamera() {
    // First, try stepping to the next zoom stop *within the same device* —
    // instant (no camera restart) and this is where extra fused lenses live.
    const stops = zoomStopsRef.current;
    if (zoomStopIndexRef.current + 1 < stops.length) {
      zoomStopIndexRef.current += 1;
      try {
        await scannerRef.current?.applyVideoConstraints({
          advanced: [{ zoom: stops[zoomStopIndexRef.current] }],
        });
      } catch {}
      return;
    }

    // Otherwise move on to the next physical camera device, if there is one.
    const cameras = camerasRef.current;
    if (cameras.length < 2) {
      zoomStopIndexRef.current = 0; // wrap back to this device's first stop
      if (stops.length) {
        try {
          await scannerRef.current?.applyVideoConstraints({ advanced: [{ zoom: stops[0] }] });
        } catch {}
      }
      return;
    }

    handledRef.current = false;
    setError(null);
    await stopScanner();
    cameraIndexRef.current = (cameraIndexRef.current + 1) % cameras.length;
    await startWithCamera(currentCameraTarget());
  }

  return (
    <div className="w-full">
      <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-2xl bg-neutral-900 shadow-inner">
        <div id={READER_ID} ref={containerRef} className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />

        {/* corner frame */}
        <div className="pointer-events-none absolute inset-6 sm:inset-8">
          <div className="absolute top-0 left-0 w-8 h-8 rounded-tl-xl border-t-4 border-l-4 border-[rgb(0,175,166)]" />
          <div className="absolute top-0 right-0 w-8 h-8 rounded-tr-xl border-t-4 border-r-4 border-[rgb(0,175,166)]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 rounded-bl-xl border-b-4 border-l-4 border-[rgb(0,175,166)]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-br-xl border-b-4 border-r-4 border-[rgb(0,175,166)]" />
          <div className="absolute left-0 right-0 top-0 h-0.5 rounded-full bg-[rgb(255,199,0)] shadow-[0_0_8px_2px_rgba(255,199,0,0.6)] scan-line" />
        </div>

        {canSwitch && (
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

        {starting && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/70 text-white text-sm backdrop-blur-sm">
            Kamera ishga tushirilmoqda...
          </div>
        )}
      </div>
      {error && (
        <p className="text-center text-sm text-red-600 mt-3 font-medium">{error}</p>
      )}
    </div>
  );
}
