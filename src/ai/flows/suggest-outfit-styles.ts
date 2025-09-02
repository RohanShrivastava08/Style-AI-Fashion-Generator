'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting outfit styles based on an uploaded clothing item image.
 *
 * It exports:
 * - `suggestOutfitStyles` - An async function that takes an image data URI and returns outfit suggestions.
 */

import {ai} from '@/ai/genkit';
import {
  type SuggestOutfitStylesInput,
  SuggestOutfitStylesInputSchema,
  type SuggestOutfitStylesOutput,
  SuggestOutfitStylesOutputSchema,
  StyleGuidancePromptSchema,
} from '@/ai/schemas';
import {generateAIStyledOutfitImage} from './generate-ai-styled-outfit-image';
import {analyzeUploadedImage} from './analyze-uploaded-image';

const suggestOutfitStylesPrompt = ai.definePrompt({
  name: 'suggestOutfitStylesPrompt',
  input: {schema: StyleGuidancePromptSchema},
  output: {schema: SuggestOutfitStylesOutputSchema},
  prompt: `You are an AI fashion stylist. The user has uploaded an image of a clothing item with the following attributes:
  - Type: {{{itemType}}}
  - Color: {{{color}}}
  - Fabric: {{{fabric}}}
  - Style: {{{style}}}

  Your task is to suggest three different outfit styles (e.g., Casual, Formal, Party) that incorporate this item. These styles should be suitable for both men and women, so provide diverse and inclusive recommendations.

  For each outfit style, you must:
  1.  **Recommend Complementary Items**: Suggest specific items like shirts, t-shirts, dresses, pants, shoes, and accessories that would pair well with the user's item.
  2.  **Provide Shopping Links**: For each recommended item, provide a valid, clickable shopping link from a reputable online fashion retailer (e.g., Amazon Fashion, Myntra, Zara, H&M, ASOS).
  3.  **Explain the Style**: Write a brief explanation of why the recommended items create a cohesive and stylish outfit. Mention color theory, occasion suitability, and current fashion trends.

  Ensure your output is a JSON object that strictly follows the provided schema.
  `,
});

const suggestOutfitStylesFlow = ai.defineFlow(
  {
    name: 'suggestOutfitStylesFlow',
    inputSchema: SuggestOutfitStylesInputSchema,
    outputSchema: SuggestOutfitStylesOutputSchema,
  },
  async (input) => {
    // 1. Analyze the uploaded image to get item attributes
    const analysis = await analyzeUploadedImage({ photoDataUri: input.photoDataUri });

    // 2. Get style recommendations (without images first)
    const styleGuidance = await suggestOutfitStylesPrompt(analysis);

    if (!styleGuidance.output || !styleGuidance.output.outfitSuggestions) {
      throw new Error('Failed to get outfit suggestions.');
    }

    // 3. Generate images for each suggestion in parallel
    const imagePromises = styleGuidance.output.outfitSuggestions.map(async (suggestion) => {
      try {
        const recommendedItems = suggestion.recommendedItems || [];
        const imageResult = await generateAIStyledOutfitImage({
          clothingItemDataUri: input.photoDataUri,
          tops: recommendedItems.find(i => i.type.toLowerCase() === 'top')?.name || 'any',
          bottoms: recommendedItems.find(i => i.type.toLowerCase() === 'bottom')?.name || 'any',
          footwear: recommendedItems.find(i => i.type.toLowerCase() === 'footwear')?.name || 'any',
          accessories: recommendedItems.find(i => i.type.toLowerCase() === 'accessory')?.name || 'any',
          styleDescription: `A full-body, realistic photo of a person (man or woman) wearing a stylish ${suggestion.styleName} outfit. ${suggestion.description}`,
        });
        return { ...suggestion, aiStyledImage: imageResult.aiStyledOutfitImageDataUri };
      } catch (error) {
        console.error(`Failed to generate image for style: ${suggestion.styleName}`, error);
        return { ...suggestion, aiStyledImage: undefined }; // Return suggestion without image on failure
      }
    });
    
    // 4. Wait for all image generation to complete
    const suggestionsWithImages = await Promise.all(imagePromises);

    return { outfitSuggestions: suggestionsWithImages };
  }
);

export async function suggestOutfitStyles(input: SuggestOutfitStylesInput): Promise<SuggestOutfitStylesOutput> {
  return suggestOutfitStylesFlow(input);
}
