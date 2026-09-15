import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgb(0,175,166)",
        }}
      >
        <svg width={112} height={112} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"
            stroke="white"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="m7 12 3 3 7-7" stroke="white" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
