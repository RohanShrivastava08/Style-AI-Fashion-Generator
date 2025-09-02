// src/ai/flows/suggest-outfit-styles.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting outfit styles based on an uploaded clothing item image.
 *
 * It exports:
 * - `suggestOutfitStyles` - An async function that takes an image data URI and returns outfit suggestions.
 * - `SuggestOutfitStylesInput` - The input type for the suggestOutfitStyles function.
 * - `SuggestOutfitStylesOutput` - The output type for the suggestOutfitStyles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOutfitStylesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestOutfitStylesInput = z.infer<typeof SuggestOutfitStylesInputSchema>;

const OutfitStyleSuggestionSchema = z.object({
  styleName: z.string().describe('The name of the outfit style (e.g., Casual, Formal/Smart, Trendy/Party).'),
  description: z.string().describe('A short, user-friendly description of the outfit style.'),
  recommendedItems: z.array(
    z.object({
      type: z.string().describe('The type of clothing item (e.g., top, bottom, footwear, accessory).'),
      name: z.string().describe('The name or description of the recommended item.'),
      shoppingLink: z.string().url().describe('A valid, clickable URL to a similar item on a fashion e-commerce site.'),
    })
  ).describe('A list of recommended clothing items, footwear and accessories for the outfit style.'),
  explanation: z.string().describe('An explanation of why the outfit combination works, including color coordination, occasion fit, and fashion trends.'),
  aiStyledImage: z.string().describe('A data URI for an AI-styled image showing the original item styled with the recommended pieces.'),
});

const SuggestOutfitStylesOutputSchema = z.object({
  outfitSuggestions: z.array(OutfitStyleSuggestionSchema).describe('An array of outfit style suggestions.'),
});
export type SuggestOutfitStylesOutput = z.infer<typeof SuggestOutfitStylesOutputSchema>;

export async function suggestOutfitStyles(input: SuggestOutfitStylesInput): Promise<SuggestOutfitStylesOutput> {
  return suggestOutfitStylesFlow(input);
}

const suggestOutfitStylesPrompt = ai.definePrompt({
  name: 'suggestOutfitStylesPrompt',
  input: {schema: SuggestOutfitStylesInputSchema},
  output: {schema: SuggestOutfitStylesOutputSchema},
  prompt: `You are an AI fashion stylist. The user has uploaded an image of a clothing item. Your task is to suggest three different outfit styles (e.g., Casual, Formal, Party) that incorporate this item.

  For each outfit style, you must:
  1.  **Recommend Complementary Items**: Suggest specific items like shirts, t-shirts, dresses, pants, shoes, and accessories that would pair well with the user's item.
  2.  **Provide Shopping Links**: For each recommended item, provide a valid, clickable shopping link from a reputable online fashion retailer (e.g., Amazon Fashion, Myntra, Zara, H&M, ASOS).
  3.  **Explain the Style**: Write a brief explanation of why the recommended items create a cohesive and stylish outfit. Mention color theory, occasion suitability, and current fashion trends.
  4.  **Generate a Visual**: Create an AI-generated image that showcases a complete outfit, combining the user's item with your recommendations. This image should be a realistic representation of a person wearing the styled outfit.

  Analyze the user's clothing item from the image provided. Based on its type, color, and style, generate three distinct and fashionable outfit suggestions.

  **User's Clothing Item Image:**
  {{media url=photoDataUri}}

  Ensure your output is a JSON object that strictly follows the provided schema.
  `,
});

const suggestOutfitStylesFlow = ai.defineFlow(
  {
    name: 'suggestOutfitStylesFlow',
    inputSchema: SuggestOutfitStylesInputSchema,
    outputSchema: SuggestOutfitStylesOutputSchema,
  },
  async input => {
    const {output} = await suggestOutfitStylesPrompt(input);
    return output!;
  }
);
