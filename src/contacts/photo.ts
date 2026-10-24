// Photo choisie par l'utilisateur -> petit JPEG carre (data URI), reduit DANS le navigateur avant l'envoi : le serveur n'accepte que 150 Ko et ne
// decode jamais d'image. Le fichier d'origine ne quitte pas le navigateur. `null` = pas une image lisible.
const SIZE = 256;
const MAX_BYTES = 140_000;

export async function photoFromFile(file: File): Promise<string | null> {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type) || file.size > 15 * 1024 * 1024) return null;
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); } catch { return null; }
  try {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const side = Math.min(bitmap.width, bitmap.height); // recadrage carre centre
    ctx.fillStyle = "#fff"; // les PNG transparents deviennent blancs en JPEG
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
    for (const quality of [0.85, 0.7, 0.5]) {
      const url = canvas.toDataURL("image/jpeg", quality);
      if (url.length * 0.75 <= MAX_BYTES) return url;
    }
    return null;
  } finally { bitmap.close(); }
}
