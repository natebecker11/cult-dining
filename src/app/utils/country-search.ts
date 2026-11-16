// Shared country-name matching for search boxes (Manage Countries filter, Look up country).

/** Lowercase and strip accents so "curacao" finds "Curaçao (Netherlands)". */
export function normalizeCountryName(value: string): string
{
    return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Countries whose name contains the search text, closest first:
 * exact match, then names starting with the text, then the rest (each group keeps the input order).
 * An empty search returns the list unchanged.
 */
export function searchCountries(countries: string[], query: string): string[]
{
    const term = normalizeCountryName(query.trim());
    if (!term)
    {
        return countries;
    }
    const rank = (name: string) =>
    {
        const n = normalizeCountryName(name);
        return n === term ? 0 : n.startsWith(term) ? 1 : 2;
    };
    return countries
        .filter(c => normalizeCountryName(c).includes(term))
        .map((name, index) => ({ name, index, rank: rank(name) }))
        .sort((a, b) => a.rank - b.rank || a.index - b.index)
        .map(x => x.name);
}
