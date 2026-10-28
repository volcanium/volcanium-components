import { useMemo } from "react";
import clsx from "clsx";
import { create, type QRCodeErrorCorrectionLevel } from "qrcode";

export interface QrCodeProps {
  /** Texte encodé (en général une adresse). Au-delà de ~2 000 caractères le code n'est pas affiché. */
  value: string;
  /** Côté en pixels, marge blanche comprise. @default 192 */
  size?: number;
  /** Texte alternatif lu par les lecteurs d'écran (ce que le code ouvre). */
  label: string;
  /** Redondance : `H` supporte un logo ou un coin abîmé, `L` donne le code le plus simple. @default "M" */
  errorCorrection?: QRCodeErrorCorrectionLevel;
  className?: string;
}

const QUIET = 4; // marge blanche de 4 modules exigée par la norme

/**
 * QR code rendu en SVG, sans requête réseau. Toujours noir sur blanc, quel que soit le thème : les lecteurs de téléphone
 * ne reconnaissent pas un code inversé, et une marge blanche est nécessaire pour qu'il soit lu.
 */
export default function QrCode({ value, size = 192, label, errorCorrection = "M", className }: QrCodeProps) {
  const matrix = useMemo(() => {
    try {
      const qr = create(value, { errorCorrectionLevel: errorCorrection });
      return { count: qr.modules.size, data: qr.modules.data };
    } catch {
      return null;
    }
  }, [value, errorCorrection]);

  if (!matrix) return <div role="img" aria-label={label} style={{ width: size, height: size }} className={clsx("rounded-lg bg-white", className)} />;
  const total = matrix.count + QUIET * 2;
  let d = "";
  for (let y = 0; y < matrix.count; y++) {
    for (let x = 0; x < matrix.count; x++) {
      if (matrix.data[y * matrix.count + x]) d += `M${x + QUIET} ${y + QUIET}h1v1h-1z`;
    }
  }
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${total} ${total}`} width={size} height={size} shapeRendering="crispEdges" className={clsx("rounded-lg bg-white", className)}>
      <path d={d} fill="#000" />
    </svg>
  );
}
