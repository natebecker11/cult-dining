export const SUMMARY_PROMPT = `
You are a cultural expert and data analyst.
I have selected the following 12 countries for a "Cultural Dinner" series in 2026:
{{COUNTRIES}}

Please provide a summary breakdown of these countries using the following format:

## Continent Breakdown
- [Continent Name]: [Count] (List countries)

## Population Stats (Estimates)
- **Highest**: [Country] (~[Number])
- **Lowest**: [Country] (~[Number])
- **Average Population**: ~[Number]

## Land Mass Stats (Estimates)
- **Largest**: [Country] (~[Number] sq km)
- **Smallest**: [Country] (~[Number] sq km)

## Fun Cultural Connections
Provide 3 interesting facts or themes that loosely connect some of these countries (e.g., "Three of these countries are famous for spice X", or "Multiple countries here have a tradition of Y").

Format the output in clean Markdown.
`;
