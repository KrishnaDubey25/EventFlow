import jsQR from "jsqr";

/**
 * Decodes a QR code from an HTMLImageElement by painting it to an offscreen canvas.
 */
export function decodeQrFromImage(imageElement: HTMLImageElement): string | null {
  try {
    const canvas = document.createElement("canvas");
    const width = imageElement.naturalWidth || imageElement.width;
    const height = imageElement.naturalHeight || imageElement.height;

    if (!width || !height) return null;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(imageElement, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    return code ? code.data : null;
  } catch (err) {
    console.warn("QR decoding error from image element:", err);
    return null;
  }
}

/**
 * Decodes a QR code directly from ImageData (e.g. from an active video frame on canvas).
 */
export function decodeQrFromImageData(imageData: ImageData): string | null {
  try {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    return code ? code.data : null;
  } catch (err) {
    return null;
  }
}

/**
 * Decodes QR code from a base64 or DataURL image string.
 */
export async function decodeQrFromDataUrl(dataUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const result = decodeQrFromImage(img);
      resolve(result);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = dataUrl;
  });
}
