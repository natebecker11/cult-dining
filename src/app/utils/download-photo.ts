import { EntryPhoto } from '../models/country-entry';

/**
 * Saves the full-size photo under a readable file name.
 * Fetching the file needs CORS on the Storage bucket; without it the browser blocks the fetch,
 * so we open the photo in a new tab instead, where it can be saved by hand.
 */
export async function downloadPhoto(photo: EntryPhoto, fileName: string): Promise<void>
{
    try
    {
        const response = await fetch(photo.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        // Test-data placeholders are SVGs; name them to match
        link.download = blob.type.startsWith('image/svg') ? fileName.replace(/\.jpg$/, '.svg') : fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (e)
    {
        console.warn('Direct download unavailable, opening the photo instead', e);
        window.open(photo.url, '_blank', 'noopener');
    }
}

/** e.g. "indonesia-nasi-goreng-2.jpg" */
export function photoFileName(...parts: (string | number | undefined)[]): string
{
    const name = parts
        .filter(p => p !== undefined && p !== '')
        .map(p => String(p).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase())
        .join('-')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return (name || 'photo') + '.jpg';
}
