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
  prompt: `You are an expert AI fashion stylist. Your single most important task is to provide outfit recommendations that are a perfect match for the user's uploaded clothing item.

  The user has provided an item with these attributes:
  - Item Type: {{{itemType}}}
  - Color: {{{color}}}
  - Fabric: {{{fabric}}}
  - Style: {{{style}}}

  **Your Task:**
  Generate three distinct, sophisticated, and modern outfit styles that **perfectly incorporate and complement this specific item.** Do not suggest anything that would not look good with the provided item. All your recommendations must be based on the uploaded item.

  For each of the three outfit styles, you must:
  1.  **Recommend Complementary Items**: Suggest specific items (tops, bottoms, footwear, accessories) that pair flawlessly with the user's item.
  2.  **Provide Real Shopping Links**: For each recommended item, provide a valid, clickable shopping link from a major online fashion retailer (e.g., Amazon Fashion, Myntra, Zara, H&M, ASOS).
  3.  **Explain the Style**: Write a brief, sharp explanation of why the complete outfit works. Focus on color harmony, texture contrast, occasion appropriateness, and why it's a stylish look.
  4.  **Create an Appealing Style Name**: The name should be short, descriptive, and classy (e.g., "Downtown Chic," "Weekend Getaway," "Polished Professional").

  Your output must be a JSON object that strictly follows the provided schema. Your suggestions must be awesome, well-reasoned, and directly relevant to the user's item.
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
        // Ensure we find the correct item types, even with different casing
        const tops = recommendedItems.find(i => i.type.toLowerCase().includes('top'))?.name || 'any appropriate top';
        const bottoms = recommendedItems.find(i => i.type.toLowerCase().includes('bottom'))?.name || 'any appropriate bottom';
        const footwear = recommendedItems.find(i => i.type.toLowerCase().includes('footwear'))?.name || 'any appropriate footwear';
        const accessories = recommendedItems.filter(i => i.type.toLowerCase().includes('accessory')).map(i => i.name).join(', ') || 'any appropriate accessories';

        const imageResult = await generateAIStyledOutfitImage({
          clothingItemDataUri: input.photoDataUri,
          tops: tops,
          bottoms: bottoms,
          footwear: footwear,
          accessories: accessories,
          styleDescription: `A full-body, realistic, high-fashion photograph of a person (man or woman) wearing a complete, stylish ${suggestion.styleName} outfit. ${suggestion.description}`,
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
