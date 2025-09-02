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
  prompt: `You are an AI fashion stylist. Analyze the uploaded clothing image and suggest three different outfit styles (Casual, Formal/Smart, Trendy/Party) based on the item in the image.

  For each outfit style:

  List recommended items (tops, bottoms, footwear, accessories) with valid, clickable URLs from reliable fashion e-commerce sites (e.g., Amazon Fashion, Myntra, Zara, H&M).

  Explain why the combination works (color coordination, occasion fit, fashion trends).

  Generate an AI-styled outfit image (that visually shows the item styled with other recommended pieces).

  Ensure all suggestions are practical, stylish, and modern.

  Output should be structured in JSON format.

  Here is the clothing item image: {{media url=photoDataUri}}
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
