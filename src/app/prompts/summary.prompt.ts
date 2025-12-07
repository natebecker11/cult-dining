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

## Land Mass Stats (Estimates)
- **Largest**: [Country] (~[Number] sq km)
- **Smallest**: [Country] (~[Number] sq km)

## Some Highly Rated Restaurants
- [Country]: [Restaurant Name] ([Any Michelin Stars])
- [Country]: [Restaurant Name] ([Any Michelin Stars])
- [Country]: [Restaurant Name] ([Any Michelin Stars])
- [Country]: [Restaurant Name] ([Any Michelin Stars])
- [Country]: [Restaurant Name] ([Any Michelin Stars])

## Fun Cultural Connections
Provide 3 interesting facts or themes that loosely connect some of these countries (e.g., "Three of these countries are famous for spice X", or "Multiple countries here have a tradition of Y").
If several countries are all islands, don't use that as a fun cultural connection.
Another fun cultural connection might be that if there is a sports rivalry between two countries. Or if a country is a recent champion in a sports competiton.
Another fun cultural connection might be that if there is a food that originated in one of the countries that's popular in another country in the list.
Format the output in clean Markdown.
`;
