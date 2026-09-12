"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function QRScanner() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const handledRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!mounted || !containerRef.current) return;

        const id = "qw-qr-reader";
        const scanner = new Html5Qrcode(id, { verbose: false });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText: string) => {
            if (handledRef.current) return;
            handledRef.current = true;
            handleDecoded(decodedText);
          },
          () => {
            /* ignore per-frame scan errors */
          }
        );
        setStarting(false);
      } catch (e: any) {
        setStarting(false);
        setError("Kameraga ruxsat berilmadi yoki kamera topilmadi.");
      }
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
