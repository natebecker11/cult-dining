import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LlmService
{
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor()
    {
        this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }

    async generateCountrySummary(countries: string[], promptTemplate: string): Promise<string>
    {
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
        const apiKey = environment.geminiApiKey;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        try
        {
            const response = await fetch(url);
            const data = await response.json();
            console.log("Available Gemini Models:", data);
        } catch (error)
        {
            console.error("Error listing models:", error);
        }
    }
}
