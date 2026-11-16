// Shrinks photos in the browser before upload, so phone pictures go up quickly
// and stay well under the 5 MB limit in storage.rules.

export interface ResizedImage
{
    blob: Blob;
    width: number;
    height: number;
}

/** Thrown when the browser can't read the image (for example a .heic file on desktop Chrome). */
export class ImageReadError extends Error { }

/**
 * Returns a JPEG no larger than maxEdge pixels on its long side (never upscaled).
 * Phone photos are rotated upright using their EXIF orientation.
 */
export async function resizeImage(file: Blob, maxEdge: number, quality = 0.82): Promise<ResizedImage>
{
    const source = await decodeImage(file);
    try
    {
        const scale = Math.min(1, maxEdge / Math.max(source.width, source.height));
        const width = Math.max(1, Math.round(source.width * scale));
        const height = Math.max(1, Math.round(source.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new ImageReadError("This browser can't prepare photos for upload.");
        ctx.fillStyle = '#fff'; // transparent PNGs become white, not black, as JPEG
        ctx.fillRect(0, 0, width, height);
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(source.image, 0, 0, width, height);

        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
        if (!blob) throw new ImageReadError("This photo couldn't be prepared for upload. Try a different photo.");
        return { blob, width, height };
    } finally
    {
        source.close();
    }
}

interface DecodedImage
{
    image: CanvasImageSource;
    width: number;
    height: number;
    close: () => void;
}

async function decodeImage(file: Blob): Promise<DecodedImage>
{
    if (typeof createImageBitmap === 'function')
    {
        try
        {
            const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
            return { image: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
        } catch
        {
            // fall through to <img>, which some browsers decode more formats with
        }
    }

    const url = URL.createObjectURL(file);
    try
    {
        const img = await new Promise<HTMLImageElement>((resolve, reject) =>
        {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error('decode failed'));
            el.src = url;
        });
        return { image: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
    } catch
    {
        URL.revokeObjectURL(url);
        throw new ImageReadError("This photo's format can't be read in this browser. Save it as a JPEG and try again.");
    }
}
