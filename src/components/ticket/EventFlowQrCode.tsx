import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface EventFlowQrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const EventFlowQrCode: React.FC<EventFlowQrCodeProps> = ({
  value,
  size = 180,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 1,
        color: {
          dark: "#0B1120", // Deep navy
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      },
      (error) => {
        if (error) {
          console.error("QR Code generation error:", error);
        }
      }
    );
  }, [value, size]);

  return (
    <div
      className={`inline-flex items-center justify-center p-2 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/80 shadow-xs ${className}`}
    >
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
    </div>
  );
};
