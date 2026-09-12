"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type CameraTarget = string | { facingMode: string };

// Phones often expose several rear lenses (main, 0.5x ultra-wide, telephoto).
// `facingMode: "environment"` doesn't guarantee the main sensor — on quite a
// few devices it hands back the ultra-wide one, which focuses badly up close
// and makes QR codes harder to read than on any normal scanner app. So we
// enumerate the actual cameras and pick the main lens by label instead.
const AVOID_LENS_KEYWORDS = ["ultra wide", "ultra-wide", "wide angle", "0.5", "0,5", "telephoto", "tele lens", "macro"];

function pickMainBackCamera(cameras: { id: string; label: string }[]): string | null {
  if (!cameras.length) return null;

  const backCameras = cameras.filter((c) => {
    const label = c.label.toLowerCase();
    return !(label.includes("front") || label.includes("user") || label.includes("face"));
  });

  const pool = backCameras.length ? backCameras : cameras;
  const mainLens = pool.find((c) => {
    const label = c.label.toLowerCase();
    return !AVOID_LENS_KEYWORDS.some((kw) => label.includes(kw));
  });

  return (mainLens ?? pool[0]).id;
}

export default function QRScanner() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const cameraRef = useRef<CameraTarget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const handledRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function resolveCamera(Html5Qrcode: any): Promise<CameraTarget> {
      if (cameraRef.current) return cameraRef.current;
      let target: CameraTarget = { facingMode: "environment" };
      try {
        const cameras = await Html5Qrcode.getCameras();
        const id = pickMainBackCamera(cameras);
        if (id) target = id;
      } catch {
        // Couldn't enumerate cameras (older browser, denied earlier, etc.) — fall back below.
      }
      cameraRef.current = target;
      return target;
    }

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!mounted || !containerRef.current) return;

        const id = "qw-qr-reader";
        const scanner = new Html5Qrcode(id, { verbose: false });
        scannerRef.current = scanner;

        const config = { fps: 10, qrbox: { width: 220, height: 220 } };
        const camera = await resolveCamera(Html5Qrcode);

        try {
          await scanner.start(camera, config, onDecoded, () => {});
        } catch (err) {
          // A specific deviceId can occasionally fail to start on some browsers —
          // retry once with the generic facingMode request before giving up.
          if (typeof camera !== "string") throw err;
          cameraRef.current = { facingMode: "environment" };
          await scanner.start(cameraRef.current, config, onDecoded, () => {});
        }
        setStarting(false);
      } catch (e: any) {
        setStarting(false);
        setError("Kameraga ruxsat berilmadi yoki kamera topilmadi.");
      }
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

      const stop = scannerRef.current?.stop?.();
      Promise.resolve(stop).finally(() => {
        if (code) {
          router.push(`/q/${code}`);
        } else {
          setError("QR kod tanilmadi. Boshqa QR kodni sinab ko'ring.");
          handledRef.current = false;
          start();
        }
      });
    }

    start();

    return () => {
      mounted = false;
      const s = scannerRef.current;
      if (s) {
        try {
          const state = s.getState?.();
          if (state === 2) {
            s.stop().catch(() => {});
          }
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-2xl bg-neutral-900 shadow-inner">
        <div id="qw-qr-reader" ref={containerRef} className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />

        {/* Blur everything outside the center scan box so the eye lands on the one spot that matters */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[18%] backdrop-blur-md bg-neutral-900/35" />
          <div className="absolute inset-x-0 bottom-0 h-[18%] backdrop-blur-md bg-neutral-900/35" />
          <div className="absolute left-0 top-[18%] bottom-[18%] w-[18%] backdrop-blur-md bg-neutral-900/35" />
          <div className="absolute right-0 top-[18%] bottom-[18%] w-[18%] backdrop-blur-md bg-neutral-900/35" />
        </div>

        {/* corner frame around the clear center */}
        <div className="pointer-events-none absolute inset-[18%]">
          <div className="absolute top-0 left-0 w-8 h-8 rounded-tl-xl border-t-4 border-l-4 border-[rgb(0,175,166)]" />
          <div className="absolute top-0 right-0 w-8 h-8 rounded-tr-xl border-t-4 border-r-4 border-[rgb(0,175,166)]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 rounded-bl-xl border-b-4 border-l-4 border-[rgb(0,175,166)]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-br-xl border-b-4 border-r-4 border-[rgb(0,175,166)]" />
          <div className="absolute left-0 right-0 top-0 h-0.5 rounded-full bg-[rgb(255,199,0)] shadow-[0_0_8px_2px_rgba(255,199,0,0.6)] scan-line" />
        </div>

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
