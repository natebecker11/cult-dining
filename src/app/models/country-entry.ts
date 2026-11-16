// A journal entry for a country we've had a dinner for.
// Stored in the Firestore collection "CountryEntries", one document per entry.

export type CountryEntryType = 'photo' | 'dish';

export interface EntryPhoto
{
    /** Storage path, used when deleting the file */
    path: string;
    /** Full-size download URL (about 1600px on the long edge) */
    url: string;
    /** Thumbnail download URL (about 400px); falls back to url when missing */
    thumbUrl?: string;
    width?: number;
    height?: number;
}

export interface CountryEntry
{
    id: string;
    /** Same name as in AllCountries / UsedCountries, e.g. "Curaçao (Netherlands)" */
    country: string;
    type: CountryEntryType;
    /** Exactly one for "photo" entries, zero or more for "dish" entries */
    photos: EntryPhoto[];
    /** Dish only */
    title?: string;
    /** Dish only: who cooked it */
    madeBy?: string;
    /** Dish only, optional */
    description?: string;
    /** Dish only, optional */
    recipeUrl?: string;
    createdBy?: { uid: string; email: string; name?: string };
    /** Milliseconds since epoch (converted from the Firestore timestamp) */
    createdAt?: number;
}

export interface CountryEntryCounts
{
    dishes: number;
    photos: number;
}
