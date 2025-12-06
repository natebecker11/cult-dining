import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable({
    providedIn: 'root'
})
export class LlmService
{
    private genAI: GoogleGenerativeAI | undefined;
    private model: any;

    constructor() { }

    initialize(apiKey: string)
    {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        console.log("LlmService initialized with fetched key.");
    }

    async generateCountrySummary(countries: string[], promptTemplate: string): Promise<string>
    {
        if (!this.model)
        {
            console.error("LlmService not initialized with API Key.");
            return "System Error: Oracle not authenticated.";
        }

        try
        {
            const prompt = promptTemplate.replace('{{COUNTRIES}}', countries.join(', '));
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error)
        {
            console.error("Error generating summary:", error);
            return "Sorry, I couldn't consult the oracle at this time. Please try again later.";
        }
    }

    async listModels(): Promise<void>
    {
        console.log("Model diagnostic requires API key setup.");
    }
}
