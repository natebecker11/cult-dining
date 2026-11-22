// Made-up journal entries for trying the journal, Photos tab and globe cards on the local dev server.
// Nothing here is written to Firestore or Storage; see CountryEntriesService.testMode.
import { isDevMode } from '@angular/core';
import { CountryEntry, EntryPhoto } from '../models/country-entry';

const FLAG_KEY = 'cultDiningTestData';
/** Off for now. Set to true to bring back the ?testdata switch on the dev server. */
const TEST_DATA_ENABLED = false;

/**
 * Dev server only, and only while TEST_DATA_ENABLED is true. Open the site with ?testdata to turn it on
 * (it stays on for the browser tab), and ?testdata=0 to turn it off. Production builds ignore it.
 */
export function readTestDataFlag(): boolean
{
    if (!TEST_DATA_ENABLED || !isDevMode()) return false;
    try
    {
        const param = new URLSearchParams(window.location.search).get('testdata');
        if (param !== null) sessionStorage.setItem(FLAG_KEY, param === '0' ? '0' : '1');
        return sessionStorage.getItem(FLAG_KEY) === '1';
    } catch
    {
        return false;
    }
}

const DISHES = [
    'Slow-braised beef stew', 'Spiced lentil soup', 'Grilled flatbread', 'Herb rice pilaf', 'Chicken in peanut sauce',
    'Fried plantains', 'Stuffed peppers', 'Coconut fish curry', 'Roasted root vegetables', 'Honey nut pastries',
    'Garlic shrimp', 'Cabbage rolls', 'Bean and corn salad', 'Lamb skewers', 'Sweet rice pudding',
    'Fried dumplings', 'Pickled vegetables', 'Cornmeal porridge', 'Citrus-marinated pork', 'Fresh cheese pie'
];
const COOKS = ['Nate', 'Sam', 'Alex', 'Jordan', 'Riley', 'Casey', 'Morgan'];
const DESCRIPTIONS = [
    'Took most of the afternoon, but worth it.',
    'Everyone went back for seconds.',
    'A little too spicy for some of us. Next time, half the chili.',
    'Made from a recipe a friend sent over.',
    'Simple, and better than expected.'
];
/** Food-ish gradient pairs for the placeholder photos */
const PALETTES = [
    ['#e65100', '#ffb74d'], ['#2e7d32', '#aed581'], ['#6a1b9a', '#ce93d8'], ['#ad1457', '#f48fb1'],
    ['#00838f', '#80deea'], ['#4e342e', '#bcaaa4'], ['#f9a825', '#fff176'], ['#283593', '#9fa8da']
];

/** Entries for every country given: 1-5 dishes and 3-10 photos each, the same every time for a country. */
export function makeTestEntries(countries: string[]): CountryEntry[]
{
    const entries: CountryEntry[] = [];
    const start = Date.UTC(2023, 0, 1);
    countries.forEach((country, countryIndex) =>
    {
        const rand = seeded(country);
        const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)];
        const dishCount = 1 + Math.floor(rand() * 5);
        const photoCount = 3 + Math.floor(rand() * 8);
        const createdAt = start + countryIndex * 30 * 86400000;
        const id = (n: string | number) => `test-${slug(country)}-${n}`;

        const dishes: CountryEntry[] = [];
        const usedTitles = new Set<string>();
        for (let d = 0; d < dishCount; d++)
        {
            let title = pick(DISHES);
            while (usedTitles.has(title)) title = pick(DISHES);
            usedTitles.add(title);
            dishes.push({
                id: id(`dish-${d}`),
                country,
                type: 'dish',
                title,
                madeBy: pick(COOKS),
                description: rand() < 0.6 ? pick(DESCRIPTIONS) : undefined,
                recipeUrl: rand() < 0.4 ? `https://example.com/recipes/${slug(title)}` : undefined,
                photos: [],
                createdBy: { uid: 'test', email: 'test@example.com', name: 'Test data' },
                createdAt: createdAt + d * 60000
            });
        }

        // Each photo goes on a random dish or becomes a general photo of the dinner
        const general: CountryEntry[] = [];
        for (let p = 0; p < photoCount; p++)
        {
            const dish = rand() < 0.6 ? pick(dishes) : null;
            const label = dish ? dish.title! : `${country} dinner`;
            const photo = placeholderPhoto(`${id('photo')}-${p}`, label, pick(PALETTES));
            if (dish) dish.photos.push(photo);
            else general.push({
                id: id(`photo-${p}`),
                country,
                type: 'photo',
                photos: [photo],
                createdBy: { uid: 'test', email: 'test@example.com', name: 'Test data' },
                createdAt: createdAt + (dishCount + p) * 60000
            });
        }
        entries.push(...dishes, ...general);
    });
    return entries;
}

/** An SVG "photo": a gradient with the dish name, as a data URL so nothing is downloaded */
function placeholderPhoto(path: string, label: string, [from, to]: string[]): EntryPhoto
{
    const text = label.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200">`
        + `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>`
        + `<rect width="1600" height="1200" fill="url(#g)"/>`
        + `<circle cx="800" cy="560" r="300" fill="rgba(255,255,255,0.25)"/>`
        + `<text x="800" y="1040" font-family="Roboto, Arial, sans-serif" font-size="96" font-weight="700" fill="#fff" text-anchor="middle">${text}</text>`
        + `</svg>`;
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    return { path, url, thumbUrl: url, width: 1600, height: 1200 };
}

/** Small seeded random number generator (mulberry32), seeded from the country name */
function seeded(seedText: string): () => number
{
    let a = 0;
    for (let i = 0; i < seedText.length; i++) a = (Math.imul(a, 31) + seedText.charCodeAt(i)) | 0;
    return () =>
    {
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function slug(text: string): string
{
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
