'use server';

/**
 * @fileOverview An AI agent that analyzes an uploaded clothing image and identifies its key attributes.
 *
 * - analyzeUploadedImage - A function that handles the image analysis process.
 * - AnalyzeUploadedImageInput - The input type for the analyzeUploadedImage function.
 * - AnalyzeUploadedImageOutput - The return type for the analyzeUploadedImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUploadedImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeUploadedImageInput = z.infer<typeof AnalyzeUploadedImageInputSchema>;

const AnalyzeUploadedImageOutputSchema = z.object({
  itemType: z.string().describe('The type of clothing item (e.g., dress, shirt, pants).'),
  color: z.string().describe('The dominant color of the clothing item.'),
  fabric: z.string().describe('The fabric of the clothing item (e.g., cotton, silk, denim).'),
  style: z.string().describe('The style of the clothing item (e.g., casual, formal, vintage).'),
});
export type AnalyzeUploadedImageOutput = z.infer<typeof AnalyzeUploadedImageOutputSchema>;

export async function analyzeUploadedImage(input: AnalyzeUploadedImageInput): Promise<AnalyzeUploadedImageOutput> {
  return analyzeUploadedImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeUploadedImagePrompt',
  input: {schema: AnalyzeUploadedImageInputSchema},
  output: {schema: AnalyzeUploadedImageOutputSchema},
  prompt: `You are an AI fashion expert. Analyze the clothing item in the provided image and identify its key attributes.

  Specifically, identify the following:
  - Item Type: What type of clothing item is it? (e.g., dress, shirt, pants)
  - Color: What is the dominant color of the item?
  - Fabric: What is the fabric of the item? (e.g., cotton, silk, denim)
  - Style: What is the style of the item? (e.g., casual, formal, vintage)

  Here is the image of the clothing item:
  {{media url=photoDataUri}}

  Return the output in JSON format.
  `,
});

const analyzeUploadedImageFlow = ai.defineFlow(
  {
    name: 'analyzeUploadedImageFlow',
    inputSchema: AnalyzeUploadedImageInputSchema,
    outputSchema: AnalyzeUploadedImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
