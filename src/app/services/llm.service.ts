import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Timed with the real summary prompt on the free tier (Nov 2026): gemini-3.5-flash ~21s with accurate output;
 * gemini-3.8-flash ~3.5 min; the flash-lite models ~2-3s but made counting mistakes.
 * gemini-2.5-flash isn't available to newer Google projects (404 "no longer available to new users").
 */
const MODEL = 'gemini-3.5-flash';
/** Give up after this long so the page never waits forever */
export const SUMMARY_TIMEOUT_MS = 90_000;

/** Why the summary couldn't be made, in words the page can show. */
export class SummaryError extends Error { }

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
        this.model = this.genAI.getGenerativeModel(
            { model: MODEL },
            { timeout: SUMMARY_TIMEOUT_MS }
        );
        console.log("LlmService initialized with fetched key.");
    }

    /** Resolves with the summary Markdown, or rejects with a SummaryError the page can show. */
    async generateCountrySummary(countries: string[], promptTemplate: string): Promise<string>
    {
        if (!this.model)
        {
            throw new SummaryError("The summary service isn't set up yet. Reload the page and try again.");
        }

        const prompt = promptTemplate.replace('{{COUNTRIES}}', countries.join(', '));
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout> | undefined;
        const timeout = new Promise<never>((_, reject) =>
        {
            timer = setTimeout(() =>
            {
                controller.abort();
                reject(new SummaryError("The summary is taking too long. Try again in a moment."));
            }, SUMMARY_TIMEOUT_MS);
        });

        try
        {
            const result: any = await Promise.race([
                this.model.generateContent(prompt, { signal: controller.signal, timeout: SUMMARY_TIMEOUT_MS }),
                timeout
            ]);
            const text: string = result.response.text();
            if (!text?.trim()) throw new SummaryError("The summary came back empty. Try again.");
            return text;
        } catch (error)
        {
            console.error("Error generating summary:", error);
            if (error instanceof SummaryError) throw error;
            throw new SummaryError("Couldn't get the summary right now. Try again in a moment.");
        } finally
        {
            clearTimeout(timer);
        }
    }

    async listModels(): Promise<void>
    {
        console.log("Model diagnostic requires API key setup.");
    }
}
